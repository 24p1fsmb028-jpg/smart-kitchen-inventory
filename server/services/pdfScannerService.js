import { PDFDocument, PDFCheckBox } from 'pdf-lib';

/**
 * Parses an uploaded PDF file buffer to extract AcroForm checkbox statuses
 * and associate them with underlying database shopping list items.
 *
 * Checkbox field format: shoppingList_<shoppingListId>_item_<itemId>
 */
export async function extractCheckedItemsFromPdf(pdfBuffer) {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    if (!fields || fields.length === 0) {
      return {
        has_form: false,
        error: 'This PDF does not contain interactive shopping-list checkboxes.'
      };
    }

    let shoppingListId = null;
    const checkedItemIds = [];
    const allDetectedFields = [];

    for (const field of fields) {
      const fieldName = field.getName();
      const isCheckbox = field instanceof PDFCheckBox;

      if (!isCheckbox) continue;

      const isChecked = field.isChecked();

      // Expected pattern: shoppingList_<listId>_item_<itemId>
      const match = fieldName.match(/^shoppingList_([^_]+(?:-[^_]+)*)_item_(.+)$/);
      if (match) {
        const detectedListId = match[1];
        const detectedItemId = match[2];

        if (!shoppingListId && detectedListId) {
          shoppingListId = detectedListId;
        }

        allDetectedFields.push({
          field_name: fieldName,
          item_id: detectedItemId,
          is_checked: isChecked
        });

        if (isChecked) {
          checkedItemIds.push(detectedItemId);
        }
      } else {
        // Fallback pattern support (e.g. item_<itemId> or custom formats)
        allDetectedFields.push({
          field_name: fieldName,
          is_checked: isChecked
        });
      }
    }

    if (allDetectedFields.length === 0) {
      return {
        has_form: false,
        error: 'This PDF does not contain recognizable shopping-list form fields.'
      };
    }

    return {
      has_form: true,
      shopping_list_id: shoppingListId,
      checked_item_ids: checkedItemIds,
      total_fields: allDetectedFields.length,
      fields: allDetectedFields
    };
  } catch (err) {
    console.error('Error reading AcroForm PDF buffer:', err);
    throw new Error(`Could not read this PDF: ${err.message}`);
  }
}
