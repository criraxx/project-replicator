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

interface ProjectData {
  title: string;
  owner: string;
  category: string;
  status: string;
  date: string;
}

interface ExportPayload {
  title: string;
  generatedAt: string;
  chartType?: string;
  filters: { label: string; value: string }[];
  kpis: { label: string; value: string | number }[];
  sections: { title: string; data: ChartData[] }[];
  projects: ProjectData[];
}

const COLORS = ['#2D5F4A', '#D4A843', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B', '#10B981', '#6366F1'];

// Helper to draw a Pie Chart
function drawPieChart(doc: PDFKit.PDFDocument, data: ChartData[], x: number, y: number, radius: number) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return;

  let startAngle = 0;
  data.forEach((d, i) => {
    const sliceAngle = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    doc.save()
       .moveTo(x, y)
       .arc(x, y, radius, startAngle, endAngle)
       .lineTo(x, y)
       .fill(COLORS[i % COLORS.length]);
    
    startAngle = endAngle;
    doc.restore();
  });

  let legendY = y - radius;
  data.forEach((d, i) => {
    doc.save()
       .rect(x + radius + 20, legendY, 10, 10)
       .fill(COLORS[i % COLORS.length]);
    doc.fillColor('#333').fontSize(8).text(`${d.name}: ${d.value} (${((d.value/total)*100).toFixed(1)}%)`, x + radius + 35, legendY + 1);
    legendY += 15;
    doc.restore();
  });
}

// Helper to draw a Bar Chart (Vertical or Horizontal)
function drawBarChart(doc: PDFKit.PDFDocument, data: ChartData[], x: number, y: number, width: number, height: number, isHorizontal: boolean = false) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  
  if (isHorizontal) {
    const barHeight = (height / data.length) * 0.7;
    const spacing = (height / data.length) * 0.3;
    
    data.forEach((d, i) => {
      const barWidth = (d.value / maxVal) * width;
      const barY = y - height + i * (barHeight + spacing) + spacing/2;
      
      doc.save().rect(x, barY, barWidth, barHeight).fill(COLORS[0]).restore();
      doc.fillColor('#666').fontSize(7).text(d.name.substring(0, 15), x - 75, barY + barHeight/2 - 3, { width: 70, align: 'right' });
      doc.fillColor('#333').fontSize(7).text(String(d.value), x + barWidth + 5, barY + barHeight/2 - 3);
    });
  } else {
    const barWidth = (width / data.length) * 0.7;
    const spacing = (width / data.length) * 0.3;

    data.forEach((d, i) => {
      const barHeight = (d.value / maxVal) * height;
      const barX = x + i * (barWidth + spacing) + spacing/2;
      
      doc.save().rect(barX, y - barHeight, barWidth, barHeight).fill(COLORS[0]).restore();
      doc.fillColor('#666').fontSize(7).text(d.name.substring(0, 10), barX, y + 5, { width: barWidth, align: 'center' });
      doc.fillColor('#333').fontSize(7).text(String(d.value), barX, y - barHeight - 10, { width: barWidth, align: 'center' });
    });
  }
}

// Helper to draw a Line Chart
function drawLineChart(doc: PDFKit.PDFDocument, data: ChartData[], x: number, y: number, width: number, height: number) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const stepX = width / (data.length - 1 || 1);

  if (data.length > 0) {
    doc.save();
    doc.moveTo(x, y - (data[0].value / maxVal) * height);
    data.forEach((d, i) => {
      const pointX = x + i * stepX;
      const pointY = y - (d.value / maxVal) * height;
      doc.lineTo(pointX, pointY);
    });
    doc.stroke(COLORS[0]).lineWidth(2);
    doc.restore();

    data.forEach((d, i) => {
      const pointX = x + i * stepX;
      const pointY = y - (d.value / maxVal) * height;
      doc.save().circle(pointX, pointY, 3).fill(COLORS[0]).restore();
      doc.save().fillColor('#666').fontSize(7).text(d.name.substring(0, 10), pointX - 15, y + 5, { width: 30, align: 'center' }).restore();
    });
  }
}

// Helper to draw a Pictogram
function drawPictogram(doc: PDFKit.PDFDocument, data: ChartData[], x: number, y: number, width: number) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return;

  const iconsPerRow = 10;
  const iconSize = 15;
  const spacing = 5;
  let currentX = x;
  let currentY = y;
  let iconCount = 0;

  data.forEach((d, colorIdx) => {
    const count = Math.round((d.value / total) * 100);
    for (let i = 0; i < count; i++) {
      doc.save()
         .circle(currentX + iconSize/2, currentY + iconSize/2, iconSize/2 - 2)
         .fill(COLORS[colorIdx % COLORS.length]);
      
      iconCount++;
      currentX += iconSize + spacing;
      if (iconCount % iconsPerRow === 0) {
        currentX = x;
        currentY += iconSize + spacing;
      }
    }
  });

  doc.y = currentY + 30;
  data.forEach((d, i) => {
    doc.save().rect(x, doc.y, 10, 10).fill(COLORS[i % COLORS.length]).restore();
    doc.fillColor('#333').fontSize(8).text(`${d.name}: ${d.value}`, x + 15, doc.y + 1);
    doc.y += 15;
  });
}

// Helper to draw Projects Table
function drawProjectsTable(doc: PDFKit.PDFDocument, projects: ProjectData[]) {
  const green = '#2D5F4A';
  const lightGray = '#F3F4F6';

  doc.addPage();
  doc.fontSize(16).fillColor(green).text('Tabela Resumo de Projetos', { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#6B7280').text(`Total de ${projects.length} projetos listados abaixo.`);
  doc.moveDown(1);

  const tableTop = doc.y;
  const colX = [40, 220, 320, 420, 490];
  const headers = ['Título', 'Proprietário', 'Categoria', 'Status', 'Data'];

  doc.save().rect(40, tableTop - 5, 515, 20).fill(green);
  headers.forEach((h, i) => {
    doc.fillColor('white').fontSize(9).text(h, colX[i] + 5, tableTop);
  });
  doc.restore();
  doc.y = tableTop + 20;

  projects.forEach((p, i) => {
    if (doc.y > 740) { doc.addPage(); doc.y = 40; }
    const rowY = doc.y;
    if (i % 2 === 0) doc.save().rect(40, rowY - 2, 515, 16).fill(lightGray).restore();
    doc.fillColor('#333').fontSize(8);
    doc.text(p.title.substring(0, 45) + (p.title.length > 45 ? '...' : ''), colX[0] + 5, rowY, { width: 175 });
    doc.text(p.owner.substring(0, 20), colX[1] + 5, rowY, { width: 95 });
    doc.text(p.category.substring(0, 20), colX[2] + 5, rowY, { width: 95 });
    doc.text(p.status, colX[3] + 5, rowY, { width: 65 });
    doc.text(p.date, colX[4] + 5, rowY, { width: 60 });
    doc.y = rowY + 18;
  });
}

// Helper to draw Advanced Comparison Tables
function drawAdvancedComparisonTables(doc: PDFKit.PDFDocument, projects: ProjectData[]) {
  const green = '#2D5F4A';
  const lightGray = '#F3F4F6';

  doc.addPage();
  doc.fontSize(16).fillColor(green).text('Tabelas de Comparação Analítica', { align: 'left' });
  doc.moveDown(1);

  // 1. Matrix: Status x Category
  doc.fontSize(12).fillColor(green).text('1. Matriz: Status por Categoria');
  doc.moveDown(0.5);
  
  const categories = Array.from(new Set(projects.map(p => p.category || 'Sem Categoria')));
  const statuses = Array.from(new Set(projects.map(p => p.status)));
  
  const matrixTop = doc.y;
  const cellW = 50;
  const labelW = 120;
  
  // Header
  doc.save().rect(40, matrixTop - 2, labelW + statuses.length * cellW, 18).fill(green);
  doc.fillColor('white').fontSize(8).text('Categoria', 45, matrixTop);
  statuses.forEach((s, i) => {
    doc.text(s.substring(0, 8), 40 + labelW + i * cellW, matrixTop, { width: cellW, align: 'center' });
  });
  doc.restore();
  doc.y = matrixTop + 20;

  categories.forEach((cat, i) => {
    if (doc.y > 740) { doc.addPage(); doc.y = 40; }
    const rowY = doc.y;
    if (i % 2 === 0) doc.save().rect(40, rowY - 2, labelW + statuses.length * cellW, 16).fill(lightGray).restore();
    
    doc.fillColor('#333').fontSize(8).text(cat, 45, rowY, { width: labelW - 10 });
    statuses.forEach((s, j) => {
      const count = projects.filter(p => (p.category || 'Sem Categoria') === cat && p.status === s).length;
      doc.text(String(count), 40 + labelW + j * cellW, rowY, { width: cellW, align: 'center' });
    });
    doc.y = rowY + 18;
  });

  doc.moveDown(1.5);

  // 2. Performance by Owner (Full List)
  doc.fontSize(12).fillColor(green).text('2. Engajamento por Proprietário (Lista Completa)');
  doc.moveDown(0.5);
  
  const owners = Array.from(new Set(projects.map(p => p.owner)));
  const ownerTop = doc.y;
  doc.save().rect(40, ownerTop - 2, 515, 18).fill(green);
  doc.fillColor('white').fontSize(8).text('Proprietário', 45, ownerTop);
  doc.text('Total Projetos', 250, ownerTop, { width: 80, align: 'center' });
  doc.text('Aprovados', 340, ownerTop, { width: 80, align: 'center' });
  doc.text('% Aprovação', 430, ownerTop, { width: 80, align: 'center' });
  doc.restore();
  doc.y = ownerTop + 20;

  owners.sort((a, b) => projects.filter(p => p.owner === b).length - projects.filter(p => p.owner === a).length).forEach((owner, i) => {
    if (doc.y > 740) { doc.addPage(); doc.y = 40; }
    const rowY = doc.y;
    if (i % 2 === 0) doc.save().rect(40, rowY - 2, 515, 16).fill(lightGray).restore();
    
    const total = projects.filter(p => p.owner === owner).length;
    const approved = projects.filter(p => p.owner === owner && p.status === 'aprovado').length;
    const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

    doc.fillColor('#333').fontSize(8).text(owner, 45, rowY, { width: 200 });
    doc.text(String(total), 250, rowY, { width: 80, align: 'center' });
    doc.text(String(approved), 340, rowY, { width: 80, align: 'center' });
    doc.text(`${rate}%`, 430, rowY, { width: 80, align: 'center' });
    doc.y = rowY + 18;
  });
}

router.post('/exports/excel', async (req: Request, res: Response) => {
  try {
    const payload: ExportPayload = req.body;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CEBIO Brasil';

    const greenFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D5F4A' } };
    const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    };

    // Summary sheet
    const wsSummary = workbook.addWorksheet('Resumo');
    wsSummary.columns = [{ width: 30 }, { width: 25 }];
    const titleRow = wsSummary.addRow([payload.title || 'Relatório CEBIO Brasil']);
    titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FF2D5F4A' } };
    wsSummary.addRow(['Gerado em', payload.generatedAt]);
    wsSummary.addRow([]);
    wsSummary.addRow(['Filtro', 'Valor']);
    payload.filters.forEach(f => wsSummary.addRow([f.label, f.value]));
    wsSummary.addRow([]);
    wsSummary.addRow(['KPI', 'Valor']);
    payload.kpis.forEach(k => wsSummary.addRow([k.label, String(k.value)]));

    // Charts data sheets
    payload.sections.forEach(section => {
      const ws = workbook.addWorksheet(section.title.substring(0, 31));
      ws.columns = [{ width: 35 }, { width: 15 }];
      const hRow = ws.addRow([section.title, 'Valor']);
      hRow.eachCell(cell => { cell.fill = greenFill; cell.font = headerFont; cell.border = borderStyle; });
      section.data.forEach((d, i) => {
        const row = ws.addRow([d.name, d.value]);
        row.eachCell(cell => {
          cell.border = borderStyle;
          if (i % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
        });
      });
    });

    // Projects sheet
    if (payload.projects?.length) {
      const ws = workbook.addWorksheet('Projetos');
      ws.columns = [{ width: 40 }, { width: 25 }, { width: 20 }, { width: 15 }, { width: 15 }];
      const hRow = ws.addRow(['Título', 'Proprietário', 'Categoria', 'Status', 'Data']);
      hRow.eachCell(cell => { cell.fill = greenFill; cell.font = headerFont; cell.border = borderStyle; });
      payload.projects.forEach((p, i) => {
        const row = ws.addRow([p.title, p.owner, p.category, p.status, p.date]);
        row.eachCell(cell => {
          cell.border = borderStyle;
          if (i % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
        });
      });
      ws.autoFilter = { from: 'A1', to: 'E1' };
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio_cebio_${new Date().toISOString().slice(0, 10)}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel export error:', err);
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

    doc.fontSize(20).fillColor(green).text(payload.title || 'Relatório CEBIO Brasil', { align: 'center' });
    doc.fontSize(10).fillColor(gray).text(`Gerado em ${payload.generatedAt}`, { align: 'center' });
    doc.moveDown(1.5);

    const kpiX = 40;
    const kpiWidth = (515 - 30) / 4;
    const kpiY = doc.y;
    payload.kpis.forEach((k, i) => {
      const x = kpiX + i * (kpiWidth + 10);
      doc.save()
         .roundedRect(x, kpiY, kpiWidth, 50, 5).fillAndStroke('#F0F7F4', '#E5E7EB')
         .fillColor(green).fontSize(16).text(String(k.value), x, kpiY + 10, { width: kpiWidth, align: 'center' })
         .fillColor(gray).fontSize(8).text(k.label, x, kpiY + 30, { width: kpiWidth, align: 'center' })
         .restore();
    });
    doc.y = kpiY + 70;

    for (const section of payload.sections) {
      if (doc.y > 500) doc.addPage();
      doc.moveDown(1);
      doc.fontSize(14).fillColor(green).text(section.title);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(green).lineWidth(1).stroke();
      doc.moveDown(1);

      const chartY = doc.y + 80;
      const chartX = 80;

      if (payload.chartType === 'pie') drawPieChart(doc, section.data, 150, chartY, 60);
      else if (payload.chartType === 'lines') drawLineChart(doc, section.data, chartX, chartY + 40, 350, 100);
      else if (payload.chartType === 'pictogram') drawPictogram(doc, section.data, 100, chartY - 40, 350);
      else if (payload.chartType === 'bars') drawBarChart(doc, section.data, 120, chartY + 40, 300, 100, true);
      else drawBarChart(doc, section.data, chartX, chartY + 40, 350, 100, false);

      if (payload.chartType === 'pictogram') doc.y += 150;
      else doc.y = chartY + 80;

      doc.moveDown(2);
      section.data.forEach((d, i) => {
        if (doc.y > 750) doc.addPage();
        doc.fontSize(9).fillColor('#333').text(d.name, 45, doc.y, { continued: true })
           .fillColor(gray).text(`: ${d.value}`, { align: 'right' });
      });
    }

    if (payload.projects && payload.projects.length > 0) {
      drawAdvancedComparisonTables(doc, payload.projects);
      drawProjectsTable(doc, payload.projects);
    }

    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor(gray).text(`CEBIO Brasil - Página ${i + 1} de ${totalPages}`, 40, 780, { align: 'center', width: 515 });
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
    const { sectionTitle, data, chartType, projects }: { sectionTitle: string; data: ChartData[]; chartType?: string; projects?: ProjectData[] } = req.body;
    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${sectionTitle.replace(/\s+/g, '_')}.pdf`);
    doc.pipe(res);

    const green = '#2D5F4A';
    doc.fontSize(18).fillColor(green).text(sectionTitle, { align: 'center' });
    doc.moveDown(2);

    const chartY = doc.y + 100;
    if (chartType === 'pie') drawPieChart(doc, data, 150, chartY, 80);
    else if (chartType === 'lines') drawLineChart(doc, data, 80, chartY + 50, 400, 150);
    else if (chartType === 'pictogram') drawPictogram(doc, data, 100, chartY - 40, 350);
    else if (chartType === 'bars') drawBarChart(doc, data, 120, chartY + 50, 350, 150, true);
    else drawBarChart(doc, data, 80, chartY + 50, 400, 150, false);

    if (projects && projects.length > 0) {
      drawAdvancedComparisonTables(doc, projects);
      drawProjectsTable(doc, projects);
    }

    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#6B7280').text(`CEBIO Brasil - Página ${i + 1} de ${totalPages}`, 40, 780, { align: 'center', width: 515 });
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ error: 'Falha ao gerar PDF da seção' });
  }
});

export default router;
