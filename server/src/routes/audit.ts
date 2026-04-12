import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../utils/auth';
import { AuditService } from '../services/AuditService';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

const router = Router();
const auditService = new AuditService();

// GET /api/audit
router.get('/audit', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.query;
    const result = await auditService.listLogs(
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/audit/stats
router.get('/audit/stats', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const stats = await auditService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/audit/export/pdf — export filtered audit logs as PDF
router.post('/audit/export/pdf', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { logs, viewMode, userName } = req.body as {
      logs: { action: string; details: string; user_name: string; ip_address: string; severity: string; created_at: string }[];
      viewMode: string;
      userName?: string;
    };

    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=auditoria_cebio_${new Date().toISOString().slice(0, 10)}.pdf`);
    doc.pipe(res);

    const green = '#2D5F4A';
    const gray = '#6B7280';
    const lightGray = '#F3F4F6';

    // Title
    doc.fontSize(20).fillColor(green).text('Relatório de Auditoria — CEBIO Brasil', { align: 'center' });
    doc.fontSize(10).fillColor(gray).text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.moveDown(0.5);

    const modeLabel = viewMode === 'meus' ? `Meus Logs (${userName || ''})` : viewMode === 'usuario' ? `Logs de: ${userName || ''}` : 'Logs Gerais';
    doc.fontSize(11).fillColor(green).text(`Visualização: ${modeLabel}  |  Total: ${logs.length} registros`);
    doc.moveDown(1);

    // Summary KPIs
    const critical = logs.filter(l => l.severity === 'high' || l.severity === 'critical').length;
    const uniqueUsers = new Set(logs.map(l => l.user_name)).size;
    const kpis = [
      { label: 'Total', value: logs.length },
      { label: 'Críticos', value: critical },
      { label: 'Usuários Únicos', value: uniqueUsers },
    ];
    const kpiWidth = 150;
    const kpiY = doc.y;
    kpis.forEach((k, i) => {
      const x = 40 + i * (kpiWidth + 15);
      doc.save().roundedRect(x, kpiY, kpiWidth, 45, 5).fillAndStroke('#F0F7F4', '#E5E7EB')
        .fillColor(green).fontSize(18).text(String(k.value), x, kpiY + 8, { width: kpiWidth, align: 'center' })
        .fillColor(gray).fontSize(8).text(k.label, x, kpiY + 30, { width: kpiWidth, align: 'center' })
        .restore();
    });
    doc.y = kpiY + 60;
    doc.moveDown(0.5);

    // Table
    const colX = [40, 140, 240, 370, 460];
    const headers = ['Timestamp', 'Usuário', 'Ação', 'Detalhes', 'Severidade'];

    const drawHeader = () => {
      doc.save().rect(40, doc.y - 3, 515, 18).fill(green);
      headers.forEach((h, i) => {
        doc.fillColor('white').fontSize(8).text(h, colX[i] + 3, doc.y - 1, { width: (colX[i + 1] || 555) - colX[i] - 6 });
      });
      doc.restore();
      doc.y += 18;
    };

    drawHeader();

    logs.forEach((log, i) => {
      if (doc.y > 740) {
        doc.addPage();
        doc.y = 40;
        drawHeader();
      }
      const rowY = doc.y;
      if (i % 2 === 0) doc.save().rect(40, rowY - 2, 515, 15).fill(lightGray).restore();

      const ts = log.created_at ? new Date(log.created_at).toLocaleString('pt-BR') : '';
      doc.fillColor('#333').fontSize(7);
      doc.text(ts, colX[0] + 3, rowY, { width: 97 });
      doc.text((log.user_name || '').substring(0, 18), colX[1] + 3, rowY, { width: 97 });
      doc.text((log.action || '').replace(/_/g, ' ').substring(0, 22), colX[2] + 3, rowY, { width: 127 });
      doc.text((log.details || '').substring(0, 25), colX[3] + 3, rowY, { width: 87 });
      doc.text(log.severity || '', colX[4] + 3, rowY, { width: 80 });
      doc.y = rowY + 16;
    });

    // Footer
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor(gray).text(`CEBIO Brasil — Auditoria — Página ${i + 1} de ${totalPages}`, 40, 780, { align: 'center', width: 515 });
    }

    doc.end();
  } catch (err) {
    console.error('Audit PDF export error:', err);
    res.status(500).json({ error: 'Falha ao gerar PDF de auditoria' });
  }
});

// POST /api/audit/export/excel — export filtered audit logs as Excel
router.post('/audit/export/excel', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { logs, viewMode, userName } = req.body as {
      logs: { action: string; details: string; user_name: string; ip_address: string; severity: string; created_at: string }[];
      viewMode: string;
      userName?: string;
    };

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Auditoria');

    sheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 22 },
      { header: 'Usuário', key: 'user', width: 25 },
      { header: 'Ação', key: 'action', width: 25 },
      { header: 'Detalhes', key: 'details', width: 45 },
      { header: 'IP', key: 'ip', width: 18 },
      { header: 'Severidade', key: 'severity', width: 14 },
    ];

    // Style header
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D5F4A' } };

    logs.forEach(log => {
      sheet.addRow({
        timestamp: log.created_at ? new Date(log.created_at).toLocaleString('pt-BR') : '',
        user: log.user_name || '',
        action: (log.action || '').replace(/_/g, ' '),
        details: log.details || '',
        ip: log.ip_address || '',
        severity: log.severity || '',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=auditoria_cebio_${new Date().toISOString().slice(0, 10)}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Audit Excel export error:', err);
    res.status(500).json({ error: 'Falha ao gerar Excel de auditoria' });
  }
});

export default router;
