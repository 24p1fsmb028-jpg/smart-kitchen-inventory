import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
 * Generates and downloads a clean, professional PDF shopping checklist.
 * Notes and Buy Limit removed as requested.
 */
export function generateSuperstoreShoppingPdf({
  items = [],
  kitchenName = 'My Kitchen',
  householdSize = 2,
  includeLowStock = true
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
    return;
  }

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
  doc.setFontSize(15);
  doc.text('SHOPPING LIST', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(167, 243, 208);
  doc.text('Smart Kitchen Inventory — Out of Stock & Low Stock Items', 14, 18);

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
  doc.text(`Total items: ${targetItems.length} (${outOfStockCount} Out of Stock)`, 196, 32, { align: 'right' });

  let currentY = 40;
  const aisleNames = Object.keys(grouped);

  aisleNames.forEach((aisleName) => {
    const aisleItems = grouped[aisleName];

    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }

    // Aisle Section Title
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, currentY, 182, 7.5, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(aisleName.toUpperCase(), 18, currentY + 5.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${aisleItems.length} item(s)`, 192, currentY + 5.2, { align: 'right' });

    currentY += 9.5;

    // Table rows: Checkbox, Product Name, Status, Current Stock, Monthly Usage (NO buy limit, NO notes)
    const tableBody = aisleItems.map((item) => {
      const isOut = Number(item.current_quantity) <= 0 || item.status === 'out_of_stock';
      const statusText = isOut ? 'OUT OF STOCK' : 'LOW STOCK';
      const currentQtyText = `${item.current_quantity} ${item.unit}`;
      const monthlyUsageText = `${item.monthly_usage} ${item.unit} / mo`;

      return [
        '[   ]',
        item.name,
        statusText,
        currentQtyText,
        monthlyUsageText
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Check', 'Product Name', 'Status', 'Current Stock', 'Monthly Usage']],
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
        0: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 76, fontStyle: 'bold' },
        2: { cellWidth: 35, fontStyle: 'bold', halign: 'center' },
        3: { cellWidth: 27, halign: 'center' },
        4: { cellWidth: 28, halign: 'center' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          if (data.cell.raw === 'OUT OF STOCK') {
            data.cell.styles.textColor = [225, 29, 72]; // rose-600
          } else {
            data.cell.styles.textColor = [217, 119, 6]; // amber-600
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
      `Smart Kitchen Inventory • Page ${i} of ${totalPages}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Save the PDF file
  const fileName = `Shopping_List_${kitchenName.replace(/[^a-zA-Z0-9]/g, '_')}_${formattedDate.replace(/ /g, '_')}.pdf`;
  doc.save(fileName);
}
