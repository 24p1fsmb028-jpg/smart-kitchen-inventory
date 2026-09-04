import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument, rgb } from 'pdf-lib';

// Standard Pakistani Superstore Aisles (Pure English)
export const PAKISTANI_STORE_AISLES = [
  {
    id: 'aisle-grains',
    name: 'Flour, Rice & Pulses',
    keywords: ['rice', 'basmati', 'flour', 'atta', 'daal', 'dal', 'pulse', 'grain', 'wheat', 'chana', 'maash', 'moong', 'masoor', 'lentil', 'suji', 'maida', 'cereals']
  },
  {
    id: 'aisle-oils-spices',
    name: 'Cooking Oils, Ghee & Spices',
    keywords: ['oil', 'ghee', 'cooking oil', 'salt', 'spice', 'chili', 'mirch', 'haldi', 'turmeric', 'coriander powder', 'cumin', 'zeera', 'garam masala', 'black pepper', 'clove', 'cardamom', 'elaichi', 'cinnamon', 'seasoning']
  },
  {
    id: 'aisle-produce',
    name: 'Fresh Produce & Vegetables',
    keywords: ['onion', 'tomato', 'potato', 'garlic', 'ginger', 'chili', 'vegetable', 'fruit', 'apple', 'banana', 'lemon', 'produce', 'coriander', 'mint', 'cucumber', 'carrot', 'cabbage', 'spinach', 'palak']
  },
  {
    id: 'aisle-dairy-bakery',
    name: 'Dairy, Bakery & Breakfast',
    keywords: ['milk', 'yogurt', 'curd', 'dahi', 'butter', 'cheese', 'egg', 'bread', 'bun', 'rusk', 'tea', 'chai', 'coffee', 'jam', 'honey', 'cereal', 'bakery', 'dairy']
  },
  {
    id: 'aisle-meat',
    name: 'Meat, Poultry & Seafood',
    keywords: ['chicken', 'beef', 'mutton', 'meat', 'fish', 'prawn', 'seafood', 'mince', 'keema']
  },
  {
    id: 'aisle-pantry-packaged',
    name: 'Packaged Grocery & Pantry',
    keywords: ['sugar', 'pasta', 'macaroni', 'noodle', 'sauce', 'ketchup', 'mayonnaise', 'vinegar', 'canned', 'snack', 'biscuit', 'chips', 'juice', 'beverage', 'sharbat', 'drink']
  },
  {
    id: 'aisle-household-cleaning',
    name: 'Household, Detergents & Cleaning',
    keywords: ['detergent', 'surf', 'washing powder', 'dishwash', 'soap', 'cleaner', 'bleach', 'tissue', 'shampoo', 'toiletries', 'household']
  }
];

/**
 * Categorizes an inventory item into a Pakistani Superstore Aisle.
 */
export function getSuperstoreAisle(item) {
  const textToMatch = `${item.name || ''} ${item.category_name || ''}`.toLowerCase();

  for (const aisle of PAKISTANI_STORE_AISLES) {
    if (aisle.keywords.some((kw) => textToMatch.includes(kw))) {
      return aisle.name;
    }
  }

  return item.category_name || 'General Pantry Goods';
}

/**
 * Computes monthly consumption.
 */
export function calculateItemMonthlyMetrics(item) {
  const weeklyUsage = Number(item.weekly_usage) || 1;
  const currentQuantity = Number(item.current_quantity) || 0;
  const unit = item.unit || 'pieces';

  // 1 month = 4 weeks standard calculation
  const monthlyUsage = Math.round(weeklyUsage * 4 * 10) / 10;
  const isOutOfStock = currentQuantity <= 0 || item.status === 'out_of_stock';

  return {
    ...item,
    monthly_usage: monthlyUsage,
    is_out_of_stock: isOutOfStock,
    unit
  };
}

/**
 * Organizes an array of items into Pakistani Superstore aisles.
 */
export function groupItemsBySuperstoreAisle(items) {
  const enriched = items.map(calculateItemMonthlyMetrics);
  const grouped = {};

  for (const item of enriched) {
    const aisle = getSuperstoreAisle(item);
    if (!grouped[aisle]) {
      grouped[aisle] = [];
    }
    grouped[aisle].push(item);
  }

  return grouped;
}

/**
 * Generates and downloads an interactive, professional PDF shopping checklist
 * with real AcroForm clickable checkboxes for automatic purchase scanning.
 */
export async function generateSuperstoreShoppingPdf({
  items = [],
  kitchenName = 'My Kitchen',
  householdSize = 2,
  includeLowStock = true,
  shoppingListId = null
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const targetItems = items.filter((item) => {
    const isOut = Number(item.current_quantity) <= 0 || item.status === 'out_of_stock';
    if (isOut) return true;
    return includeLowStock && item.status === 'low';
  });

  if (targetItems.length === 0) {
    alert('No items found to generate PDF.');
    return { success: false, error: 'No items found' };
  }

  const activeListId = shoppingListId || `sl-${Date.now().toString(36)}`;
  const grouped = groupItemsBySuperstoreAisle(targetItems);
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = now.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Top header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SMART KITCHEN INVENTORY — SHOPPING LIST', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(167, 243, 208); // emerald-200
  doc.text('Interactive Checklist • Check off purchased products & scan to auto-restock', 14, 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(253, 224, 71); // yellow-300
  doc.text(`SHOPPING LIST ID: ${activeListId}`, 14, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`${formattedDate} • ${formattedTime}`, 196, 12, { align: 'right' });
  doc.text(`Household: ${householdSize} Persons`, 196, 18, { align: 'right' });

  // Kitchen info strip
  doc.setFillColor(241, 245, 249);
  doc.rect(0, 26, 210, 9, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`KITCHEN: ${kitchenName.toUpperCase()}`, 14, 32);

  const outOfStockCount = targetItems.filter((i) => Number(i.current_quantity) <= 0 || i.status === 'out_of_stock').length;
  doc.setFont('helvetica', 'normal');
  doc.text(`Total items: ${targetItems.length} (${outOfStockCount} Out of Stock) • Scanner Ready ✓`, 196, 32, { align: 'right' });

  let currentY = 40;
  const aisleNames = Object.keys(grouped);
  const checkboxWidgets = [];

  aisleNames.forEach((aisleName) => {
    const aisleItems = grouped[aisleName];

    if (currentY > 255) {
      doc.addPage();
      currentY = 20;
    }

    // Aisle Section Title
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, currentY, 182, 7.5, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(aisleName.toUpperCase(), 18, currentY + 5.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${aisleItems.length} item(s)`, 192, currentY + 5.2, { align: 'right' });

    currentY += 9.5;

    // Table rows: Checkbox, Product Name, Target Purchase Qty, Status, Current Stock, Monthly Usage
    const tableBody = aisleItems.map((item) => {
      const isOut = Number(item.current_quantity) <= 0 || item.status === 'out_of_stock';
      const statusText = isOut ? 'OUT OF STOCK' : 'LOW STOCK';
      const currentQtyText = `${item.current_quantity} ${item.unit}`;
      const toBuyQty = item.recommended_buy_quantity || (isOut ? (item.weekly_usage || 1) * 2 : 1);
      const buyQtyText = `${toBuyQty} ${item.unit}`;
      const monthlyUsageText = `${item.monthly_usage} ${item.unit} / mo`;

      return [
        '', // Checkbox placeholder to be overlayed with AcroForm CheckBox
        item.name,
        buyQtyText,
        statusText,
        currentQtyText,
        monthlyUsageText
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Check', 'Product Name', 'Buy Qty', 'Status', 'Current Stock', 'Monthly Usage']],
      body: tableBody,
      theme: 'grid',
      styles: {
        fontSize: 8.5,
        cellPadding: 2.5,
        font: 'helvetica',
        textColor: [30, 41, 59]
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center' },
        1: { cellWidth: 66, fontStyle: 'bold' },
        2: { cellWidth: 26, fontStyle: 'bold', halign: 'center', textColor: [5, 150, 105] }, // emerald-600
        3: { cellWidth: 30, fontStyle: 'bold', halign: 'center' },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 24, halign: 'center' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          if (data.cell.raw === 'OUT OF STOCK') {
            data.cell.styles.textColor = [225, 29, 72]; // rose-600
          } else {
            data.cell.styles.textColor = [217, 119, 6]; // amber-600
          }
        }
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const rowItem = aisleItems[data.row.index];
          if (rowItem) {
            const pageNum = doc.internal.getCurrentPageInfo().pageNumber;
            checkboxWidgets.push({
              pageNumber: pageNum,
              x: data.cell.x,
              y: data.cell.y,
              width: data.cell.width,
              height: data.cell.height,
              fieldName: `shoppingList_${activeListId}_item_${rowItem.id || rowItem.item_id}`,
              itemName: rowItem.name
            });
          }
        }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        currentY = data.cursor.y + 6;
      }
    });

    currentY += 2;
  });

  // Page numbering footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Smart Kitchen Inventory • List ID: ${activeListId} • Page ${i} of ${totalPages}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Convert to pdf-lib to inject real interactive AcroForm checkboxes
  const pdfArrayBuffer = doc.output('arraybuffer');
  const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
  const form = pdfDoc.getForm();
  const pages = pdfDoc.getPages();

  // 1 mm in PDF points = 72 / 25.4 = 2.83464567
  const MM_TO_PT = 72 / 25.4;
  const PAGE_HEIGHT_PT = 841.89; // Standard A4 height in pt

  for (const widget of checkboxWidgets) {
    const page = pages[widget.pageNumber - 1];
    if (!page) continue;

    const cellX_pt = widget.x * MM_TO_PT;
    const cellY_pt = PAGE_HEIGHT_PT - ((widget.y + widget.height) * MM_TO_PT);
    const cellW_pt = widget.width * MM_TO_PT;
    const cellH_pt = widget.height * MM_TO_PT;

    const boxSize = 10.5;
    const cbX = cellX_pt + (cellW_pt - boxSize) / 2;
    const cbY = cellY_pt + (cellH_pt - boxSize) / 2;

    try {
      const checkBox = form.createCheckBox(widget.fieldName);
      checkBox.addToPage(page, {
        x: cbX,
        y: cbY,
        width: boxSize,
        height: boxSize,
        borderWidth: 1.2,
        borderColor: rgb(0.2, 0.28, 0.38),
        backgroundColor: rgb(1, 1, 1)
      });
    } catch (err) {
      console.warn('Could not register AcroForm checkbox field:', widget.fieldName, err);
    }
  }

  const finalPdfBytes = await pdfDoc.save();
  const fileName = `Shopping_List_${kitchenName.replace(/[^a-zA-Z0-9]/g, '_')}_${formattedDate.replace(/ /g, '_')}.pdf`;

  // Trigger download in browser
  const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

  return {
    success: true,
    shoppingListId: activeListId,
    fileName,
    totalItems: targetItems.length
  };
}

