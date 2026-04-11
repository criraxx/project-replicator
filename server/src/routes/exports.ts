import { Router, Request, Response } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { authMiddleware, requireRole } from '../utils/auth';

const router = Router();

// All export routes require admin authentication
router.use(authMiddleware, requireRole('admin'));

interface ChartData {
  name: string;
  value: number;
}

interface ExportPayload {
  title: string;
  generatedAt: string;
  filters: { label: string; value: string }[];
  kpis: { label: string; value: string | number }[];
  sections: { title: string; data: ChartData[] }[];
  projects: { title: string; owner: string; category: string; status: string; date: string }[];
}

// =====================
// EXCEL EXPORT
// =====================
router.post('/exports/excel', async (req: Request, res: Response) => {
  try {
    const payload: ExportPayload = req.body;
    const wb = new ExcelJS.Workbook();
    wb.creator = 'CEBIO Brasil';
    wb.created = new Date();

    const headerFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D5F4A' } };
    const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    const titleFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FF2D5F4A' }, size: 14 };
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    };

    // --- Aba Resumo ---
    const wsResumo = wb.addWorksheet('Resumo');
    wsResumo.columns = [{ width: 30 }, { width: 45 }];

    let row = wsResumo.addRow([payload.title || 'Relatorio CEBIO Brasil']);
    row.getCell(1).font = titleFont;
    wsResumo.mergeCells(row.number, 1, row.number, 2);

    wsResumo.addRow(['Gerado em', payload.generatedAt]);
    wsResumo.addRow([]);

    row = wsResumo.addRow(['Filtros Aplicados']);
    row.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF2D5F4A' } };
    payload.filters.forEach(f => {
      wsResumo.addRow([f.label, f.value]);
    });

    wsResumo.addRow([]);
    row = wsResumo.addRow(['Indicadores']);
    row.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF2D5F4A' } };
    payload.kpis.forEach(k => {
      wsResumo.addRow([k.label, k.value]);
    });

    // --- Abas de dados (cada secao) ---
    payload.sections.forEach(section => {
      const sheetName = section.title.substring(0, 31);
      const ws = wb.addWorksheet(sheetName);
      ws.columns = [{ width: 35 }, { width: 18 }];

      const hdr = ws.addRow([section.title, 'Quantidade']);
      hdr.eachCell(cell => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = { horizontal: 'center' };
        cell.border = borderStyle;
      });

      section.data.forEach((d, i) => {
        const r = ws.addRow([d.name, d.value]);
        r.eachCell(cell => {
          cell.border = borderStyle;
          cell.alignment = { horizontal: i === 0 ? 'left' : 'left' };
          if (i % 2 === 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          }
        });
        r.getCell(2).alignment = { horizontal: 'right' };
      });
    });

    // --- Aba Projetos ---
    if (payload.projects?.length) {
      const ws = wb.addWorksheet('Projetos');
      ws.columns = [{ width: 40 }, { width: 30 }, { width: 25 }, { width: 15 }, { width: 15 }];

      const hdr = ws.addRow(['Titulo', 'Proprietario', 'Categoria', 'Status', 'Data']);
      hdr.eachCell(cell => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = { horizontal: 'center' };
        cell.border = borderStyle;
      });

      payload.projects.forEach((p, i) => {
        const r = ws.addRow([p.title, p.owner, p.category, p.status, p.date]);
        r.eachCell(cell => {
          cell.border = borderStyle;
          if (i % 2 === 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          }
        });
      });

      ws.autoFilter = { from: 'A1', to: 'E1' };
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio_cebio_${new Date().toISOString().slice(0, 10)}.xlsx`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).json({ error: 'Falha ao gerar Excel' });
  }
});

// =====================
// EXCEL SINGLE SECTION
// =====================
router.post('/exports/excel-section', async (req: Request, res: Response) => {
  try {
    const { sectionTitle, data }: { sectionTitle: string; data: ChartData[] } = req.body;
    const wb = new ExcelJS.Workbook();

    const headerFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D5F4A' } };
    const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    };

    const ws = wb.addWorksheet(sectionTitle.substring(0, 31));
    ws.columns = [{ width: 35 }, { width: 18 }];

    const hdr = ws.addRow([sectionTitle, 'Quantidade']);
    hdr.eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { horizontal: 'center' };
      cell.border = borderStyle;
    });

    data.forEach((d, i) => {
      const r = ws.addRow([d.name, d.value]);
      r.eachCell(cell => {
        cell.border = borderStyle;
        if (i % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      });
      r.getCell(2).alignment = { horizontal: 'right' };
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${sectionTitle.replace(/\s+/g, '_')}.xlsx`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel section export error:', err);
    res.status(500).json({ error: 'Falha ao gerar Excel' });
  }
});

// =====================
// PDF EXPORT
// =====================
router.post('/exports/pdf', async (req: Request, res: Response) => {
  try {
    const payload: ExportPayload = req.body;
    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio_cebio_${new Date().toISOString().slice(0, 10)}.pdf`);
    doc.pipe(res);

    const green = '#2D5F4A';
    const gray = '#6B7280';
    const lightGray = '#F3F4F6';

    // Title
    doc.fontSize(20).fillColor(green).text(payload.title || 'Relatorio CEBIO Brasil', { align: 'center' });
    doc.fontSize(10).fillColor(gray).text(`Gerado em ${payload.generatedAt}`, { align: 'center' });
    doc.moveDown(1.5);

    // Filters
    doc.fontSize(14).fillColor(green).text('Filtros Aplicados');
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(green).lineWidth(1).stroke();
    doc.moveDown(0.5);
    payload.filters.forEach(f => {
      doc.fontSize(10).fillColor('#111').text(`${f.label}: `, { continued: true }).fillColor(gray).text(f.value);
    });
    doc.moveDown(1);

    // KPIs
    doc.fontSize(14).fillColor(green).text('Indicadores');
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(green).lineWidth(1).stroke();
    doc.moveDown(0.5);

    const kpiX = 40;
    const kpiWidth = (555 - 40 - 30) / 4;
    const kpiY = doc.y;
    payload.kpis.forEach((k, i) => {
      const x = kpiX + i * (kpiWidth + 10);
      doc.save();
      doc.roundedRect(x, kpiY, kpiWidth, 55, 5).fillAndStroke('#F0F7F4', '#E5E7EB');
      doc.fillColor(green).fontSize(20).text(String(k.value), x, kpiY + 8, { width: kpiWidth, align: 'center' });
      doc.fillColor(gray).fontSize(8).text(k.label, x, kpiY + 35, { width: kpiWidth, align: 'center' });
      doc.restore();
    });
    doc.y = kpiY + 70;

    // Sections (data tables with bars)
    payload.sections.forEach(section => {
      if (doc.y > 650) doc.addPage();
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor(green).text(section.title);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(green).lineWidth(1).stroke();
      doc.moveDown(0.3);

      const maxVal = Math.max(...section.data.map(d => d.value), 1);
      const barColors = ['#2D5F4A', '#D4A843', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B'];

      section.data.forEach((d, i) => {
        if (doc.y > 730) doc.addPage();
        const rowY = doc.y;
        const barWidth = (d.value / maxVal) * 200;

        if (i % 2 === 0) {
          doc.save();
          doc.rect(40, rowY - 2, 515, 18).fill(lightGray);
          doc.restore();
        }

        doc.fontSize(10).fillColor('#111').text(d.name, 45, rowY, { width: 180 });
        doc.fontSize(10).fillColor(gray).text(String(d.value), 230, rowY, { width: 40, align: 'right' });

        doc.save();
        doc.roundedRect(280, rowY + 1, barWidth, 10, 3).fill(barColors[i % barColors.length]);
        doc.restore();

        doc.y = rowY + 20;
      });
    });

    // Projects table
    if (payload.projects?.length) {
      doc.addPage();
      doc.fontSize(14).fillColor(green).text(`Projetos (${payload.projects.length})`);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(green).lineWidth(1).stroke();
      doc.moveDown(0.3);

      // Table header
      const cols = [40, 200, 320, 410, 480];
      const colW = [155, 115, 85, 65, 75];
      const headers = ['Titulo', 'Proprietario', 'Categoria', 'Status', 'Data'];
      const headerY = doc.y;

      doc.save();
      doc.rect(40, headerY - 2, 515, 18).fill(green);
      headers.forEach((h, i) => {
        doc.fillColor('white').fontSize(9).text(h, cols[i] + 3, headerY, { width: colW[i] });
      });
      doc.restore();
      doc.y = headerY + 20;

      payload.projects.forEach((p, i) => {
        if (doc.y > 740) {
          doc.addPage();
          doc.y = 40;
        }
        const rowY = doc.y;
        if (i % 2 === 0) {
          doc.save();
          doc.rect(40, rowY - 2, 515, 16).fill(lightGray);
          doc.restore();
        }
        const vals = [p.title, p.owner, p.category, p.status, p.date];
        vals.forEach((v, j) => {
          doc.fillColor('#111').fontSize(8).text(v || '---', cols[j] + 3, rowY, { width: colW[j], lineBreak: false });
        });
        doc.y = rowY + 17;
      });
    }

    // Footer on all pages
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor(gray).text(
        `CEBIO Brasil - Pagina ${i + 1} de ${totalPages}`,
        40, 780, { align: 'center', width: 515 }
      );
    }

    doc.end();
  } catch (err) {
    console.error('PDF export error:', err);
    res.status(500).json({ error: 'Falha ao gerar PDF' });
  }
});

// =====================
// PDF SINGLE SECTION
// =====================
router.post('/exports/pdf-section', async (req: Request, res: Response) => {
  try {
    const { sectionTitle, data }: { sectionTitle: string; data: ChartData[] } = req.body;
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${sectionTitle.replace(/\s+/g, '_')}.pdf`);
    doc.pipe(res);

    const green = '#2D5F4A';
    const gray = '#6B7280';
    const lightGray = '#F3F4F6';

    doc.fontSize(18).fillColor(green).text(sectionTitle, { align: 'center' });
    doc.fontSize(9).fillColor(gray).text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.moveDown(1.5);

    const maxVal = Math.max(...data.map(d => d.value), 1);
    const barColors = ['#2D5F4A', '#D4A843', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B'];

    // Table header
    const headerY = doc.y;
    doc.save();
    doc.rect(40, headerY - 2, 515, 20).fill(green);
    doc.fillColor('white').fontSize(11).text('Item', 45, headerY + 2, { width: 250 });
    doc.fillColor('white').fontSize(11).text('Quantidade', 300, headerY + 2, { width: 80, align: 'right' });
    doc.restore();
    doc.y = headerY + 24;

    data.forEach((d, i) => {
      const rowY = doc.y;
      const barWidth = (d.value / maxVal) * 150;

      if (i % 2 === 0) {
        doc.save();
        doc.rect(40, rowY - 2, 515, 20).fill(lightGray);
        doc.restore();
      }

      doc.fontSize(10).fillColor('#111').text(d.name, 45, rowY + 2, { width: 250 });
      doc.fontSize(10).fillColor(gray).text(String(d.value), 300, rowY + 2, { width: 80, align: 'right' });

      doc.save();
      doc.roundedRect(395, rowY + 3, barWidth, 12, 3).fill(barColors[i % barColors.length]);
      doc.restore();

      doc.y = rowY + 22;
    });

    doc.end();
  } catch (err) {
    console.error('PDF section export error:', err);
    res.status(500).json({ error: 'Falha ao gerar PDF da secao' });
  }
});

export default router;
