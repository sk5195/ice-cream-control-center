import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export async function generatePDF(title, columns, rows) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    const colWidth = (doc.page.width - 100) / columns.length;
    let y = doc.y;

    doc.fontSize(11).font('Helvetica-Bold');
    columns.forEach((col, i) => {
      doc.text(col, 50 + i * colWidth, y, { width: colWidth, align: 'left' });
    });
    y += 20;
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).stroke();
    y += 10;

    doc.font('Helvetica').fontSize(10);
    rows.forEach(row => {
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 50;
      }
      columns.forEach((col, i) => {
        const key = col.toLowerCase().replace(/\s+/g, '_');
        const val = row[key] ?? row[col] ?? row[Object.keys(row)[i]] ?? '';
        doc.text(String(val), 50 + i * colWidth, y, { width: colWidth });
      });
      y += 18;
    });

    doc.end();
  });
}

export async function generateExcel(sheetName, columns, rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map(col => ({
    header: col,
    key: col.toLowerCase().replace(/\s+/g, '_'),
    width: 20
  }));

  rows.forEach(row => {
    const mapped = {};
    columns.forEach((col, i) => {
      const key = col.toLowerCase().replace(/\s+/g, '_');
      mapped[key] = row[key] ?? row[col] ?? row[Object.keys(row)[i]] ?? '';
    });
    sheet.addRow(mapped);
  });

  sheet.getRow(1).font = { bold: true };
  return workbook.xlsx.writeBuffer();
}
