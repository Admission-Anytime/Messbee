import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (invoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // --- Header Background ---
  doc.setFillColor(37, 99, 235); // Blue 600
  doc.rect(0, 0, pageWidth, 45, 'F');

  // --- Header Text ---
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 14, 30);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Messbee POS Solutions', pageWidth - 14, 20, { align: 'right' });
  doc.text('contact@messbee.com', pageWidth - 14, 26, { align: 'right' });
  doc.text('+91 88888 99999', pageWidth - 14, 32, { align: 'right' });

  // --- Invoice & Customer Details ---
  doc.setTextColor(51, 65, 85); // Slate 700
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  
  // Left Side: Invoice Info
  doc.text('Invoice Details:', 14, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Number:`, 14, 67);
  doc.setFont('helvetica', 'bold');
  doc.text(`${invoiceData.invoiceNumber}`, 45, 67);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Date Issued:`, 14, 73);
  doc.setFont('helvetica', 'bold');
  doc.text(`${invoiceData.date}`, 45, 73);

  // Right Side: Customer/Supplier Info
  doc.text(invoiceData.supplier ? 'Supplier Details:' : 'Billed To:', pageWidth / 2 + 10, 60);
  doc.setFont('helvetica', 'normal');
  const entity = invoiceData.customer || invoiceData.supplier;
  const entityName = entity?.customerName || entity?.companyName || 'Walk-in';
  
  doc.text(`${entityName}`, pageWidth / 2 + 10, 67);
  doc.text(`${entity?.mobile || ''}`, pageWidth / 2 + 10, 73);
  if (entity?.email) {
    doc.text(`${entity.email}`, pageWidth / 2 + 10, 79);
  }
  if (entity?.address) {
    doc.text(`${entity.address}`, pageWidth / 2 + 10, 85);
  }

  // --- Items Table ---
  const tableColumn = ["#", "Item Description", "Qty", "Price", "Discount", "GST %", "Total"];
  const tableRows = [];

  invoiceData.items.forEach((item, index) => {
    const row = [
      index + 1,
      item.name,
      item.quantity,
      `Rs ${item.sellingPrice || item.purchasePrice || 0}`,
      `Rs ${item.discount || 0}`,
      `${item.gst}%`,
      `Rs ${item.total.toFixed(2)}`
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    startY: 95,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: [37, 99, 235], // Blue 600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      textColor: [51, 65, 85]
    },
    alternateRowStyles: { 
      fillColor: [248, 250, 252] // Slate 50
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { halign: 'right', fontStyle: 'bold' },
    }
  });

  const finalY = doc.lastAutoTable.finalY || 95;

  // --- Totals Section ---
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.line(pageWidth / 2 + 10, finalY + 10, pageWidth - 14, finalY + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Subtotal:`, pageWidth - 80, finalY + 18);
  doc.text(`Rs ${invoiceData.grandTotal.toFixed(2)}`, pageWidth - 14, finalY + 18, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(`Grand Total:`, pageWidth - 80, finalY + 28);
  doc.text(`Rs ${invoiceData.grandTotal.toFixed(2)}`, pageWidth - 14, finalY + 28, { align: 'right' });

  doc.line(pageWidth / 2 + 10, finalY + 33, pageWidth - 14, finalY + 33);

  // --- Footer ---
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('Thank you for your business!', pageWidth / 2, doc.internal.pageSize.height - 20, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('This is a computer generated invoice and requires no signature.', pageWidth / 2, doc.internal.pageSize.height - 15, { align: 'center' });

  // Save the PDF
  doc.save(`Invoice_${invoiceData.invoiceNumber}.pdf`);
};
