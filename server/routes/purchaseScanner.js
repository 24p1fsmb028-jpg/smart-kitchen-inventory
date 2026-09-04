import express from 'express';
import multer from 'multer';
import { db } from '../db/db.js';
import { extractCheckedItemsFromPdf } from '../services/pdfScannerService.js';
import { scanShoppingListImageWithAI } from '../services/aiVisionService.js';

const router = express.Router();

// Configure Multer for In-Memory storage (100% Vercel Serverless compatible, 0 disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];
    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload a PDF, JPG, PNG, or WEBP shopping list.'));
    }
  }
});

// Helper to extract authenticated user from request headers
async function getAuthUser(req) {
  const userId = req.headers['x-user-id'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  if (!userId) return null;
  try {
    return await db.getUserById(userId);
  } catch {
    return null;
  }
}

/**
 * POST /api/purchase-scanner/upload
 * Unified endpoint accepting PDF or Image shopping list checklists.
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a shopping list.' });
    }

    const authUser = await getAuthUser(req);
    const userId = authUser ? authUser.id : (req.body.userId || null);
    const mimeType = req.file.mimetype.toLowerCase();
    const isPdf = mimeType === 'application/pdf';

    let shoppingListId = null;
    let purchasedItemInputs = [];
    let skippedItems = [];

    // =========================================================================
    // MODE A: PDF CHECKBOX SCANNER (Primary & Deterministic)
    // =========================================================================
    if (isPdf) {
      const scanResult = await extractCheckedItemsFromPdf(req.file.buffer);

      if (!scanResult.has_form) {
        return res.status(400).json({
          success: false,
          error: scanResult.error || 'This PDF does not contain interactive shopping-list checkboxes.'
        });
      }

      shoppingListId = scanResult.shopping_list_id || req.body.shoppingListId;

      if (!shoppingListId) {
        // Look up the user's latest unprocessed shopping list as fallback
        const recentLists = await db.getShoppingListsByUser(userId, 5);
        const latestUnprocessed = recentLists.find(l => !l.processed);
        if (latestUnprocessed) {
          shoppingListId = latestUnprocessed.id;
        } else {
          return res.status(400).json({
            success: false,
            error: 'Could not identify which shopping list this PDF corresponds to. Please re-export from the Shopping List page.'
          });
        }
      }

      // Verify shopping list existence
      const shoppingList = await db.getShoppingListById(shoppingListId);
      if (!shoppingList) {
        return res.status(404).json({
          success: false,
          error: `Shopping list "${shoppingListId}" was not found in the system.`
        });
      }

      // Check duplicate processing
      if (shoppingList.processed) {
        return res.status(409).json({
          success: false,
          error: 'This shopping list has already been processed.'
        });
      }

      // Check ownership
      if (userId && shoppingList.user_id && shoppingList.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You are not authorized to process this shopping list.'
        });
      }

      // Fetch official items on this list
      const listItems = await db.getShoppingListItems(shoppingListId);
      const listItemsMap = new Map(listItems.map(i => [i.item_id, i]));

      const checkedIds = new Set(scanResult.checked_item_ids);

      for (const item of listItems) {
        if (checkedIds.has(item.item_id)) {
          purchasedItemInputs.push({
            item_id: item.item_id,
            item_name: item.item_name,
            purchased_quantity: item.quantity,
            unit: item.unit
          });
        }
      }

      // Flag any checked IDs that were not on this list
      for (const cid of checkedIds) {
        if (!listItemsMap.has(cid)) {
          skippedItems.push({
            item_id: cid,
            reason: 'Item does not belong to this shopping list.'
          });
        }
      }
    }
    // =========================================================================
    // MODE B: IMAGE / SCREENSHOT SCANNER (AI Vision / OCR)
    // =========================================================================
    else {
      // Retrieve recent user shopping lists to provide context to the AI
      const recentLists = await db.getShoppingListsByUser(userId, 5);
      const enrichedCandidateLists = [];
      for (const l of recentLists) {
        if (!l.processed) {
          const items = await db.getShoppingListItems(l.id);
          enrichedCandidateLists.push({ ...l, items });
        }
      }

      let aiResult;
      try {
        aiResult = await scanShoppingListImageWithAI({
          imageBuffer: req.file.buffer,
          mimeType,
          candidateLists: enrichedCandidateLists
        });
      } catch (aiErr) {
        return res.status(500).json({
          success: false,
          error: aiErr.message || "We couldn't scan the image. Please try a clearer photo."
        });
      }

      // Identify the shopping list ID
      shoppingListId = aiResult.shopping_list_id || req.body.shoppingListId;
      if (!shoppingListId) {
        const firstUnprocessed = enrichedCandidateLists[0];
        if (firstUnprocessed) {
          shoppingListId = firstUnprocessed.id;
        } else {
          return res.status(400).json({
            success: false,
            error: 'Could not associate this image with an active shopping list. Please export a list first.'
          });
        }
      }

      const shoppingList = await db.getShoppingListById(shoppingListId);
      if (!shoppingList) {
        return res.status(404).json({
          success: false,
          error: `Shopping list "${shoppingListId}" was not found.`
        });
      }

      if (shoppingList.processed) {
        return res.status(409).json({
          success: false,
          error: 'This shopping list has already been processed.'
        });
      }

      if (userId && shoppingList.user_id && shoppingList.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You are not authorized to process this shopping list.'
        });
      }

      // Fetch known list items for validation
      const listItems = await db.getShoppingListItems(shoppingListId);

      // AI Output Validation: Strict item matching
      const aiItems = aiResult.items || [];

      for (const aiItem of aiItems) {
        // Find best match in official list items by exact or normalized name
        const normalizedAiName = (aiItem.item_name || '').toLowerCase().trim();
        const matchedItem = listItems.find(
          li => li.item_name.toLowerCase().trim() === normalizedAiName ||
                li.item_name.toLowerCase().includes(normalizedAiName) ||
                normalizedAiName.includes(li.item_name.toLowerCase())
        );

        if (!matchedItem) {
          // Unrecognized or hallucinated item rejected
          skippedItems.push({
            item_name: aiItem.item_name,
            reason: 'Item not found in your shopping list.'
          });
          continue;
        }

        const confidence = typeof aiItem.confidence === 'number' ? aiItem.confidence : 1.0;
        const isPurchased = Boolean(aiItem.purchased);

        if (!isPurchased) {
          // Unchecked item, skip
          continue;
        }

        if (confidence < 0.70) {
          // Low confidence item moved to review
          skippedItems.push({
            item_id: matchedItem.item_id,
            item_name: matchedItem.item_name,
            reason: 'Could not confidently determine whether this item was purchased.'
          });
          continue;
        }

        // Use requested buy quantity from database or AI detected quantity
        const qtyToRestock = Number(aiItem.quantity) > 0 ? Number(aiItem.quantity) : Number(matchedItem.quantity);

        purchasedItemInputs.push({
          item_id: matchedItem.item_id,
          item_name: matchedItem.item_name,
          purchased_quantity: qtyToRestock,
          unit: matchedItem.unit
        });
      }
    }

    // =========================================================================
    // RESTOCKING EXECUTION (Atomic Transaction)
    // =========================================================================
    if (purchasedItemInputs.length === 0) {
      return res.json({
        success: true,
        shopping_list_id: shoppingListId,
        processed: false,
        restocked_items: [],
        skipped_items: skippedItems,
        message: 'No purchased products were detected.'
      });
    }

    // Execute atomic restocking
    const restockResult = await db.processRestockAtomic({
      shoppingListId,
      userId,
      purchasedItems: purchasedItemInputs
    });

    return res.json({
      success: true,
      shopping_list_id: shoppingListId,
      processed: true,
      restocked_items: restockResult.restocked_items,
      skipped_items: skippedItems,
      message: `Shopping list processed successfully. Restocked ${restockResult.restocked_items.length} items.`
    });
  } catch (err) {
    console.error('Purchase scanner upload error:', err);
    if (err.message && err.message.includes('already been processed')) {
      return res.status(409).json({ success: false, error: 'This shopping list has already been processed.' });
    }
    return res.status(500).json({
      success: false,
      error: err.message || 'Inventory could not be updated. No changes were made.'
    });
  }
});

// Error handling middleware for Multer file errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File is too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ success: false, error: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
});

export default router;
