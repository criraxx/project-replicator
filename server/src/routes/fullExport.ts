import { Router, Request, Response } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { Category } from '../entities/Category';
import { AuditLog } from '../entities/AuditLog';
import { Notification } from '../entities/Notification';
import { ProjectAuthor } from '../entities/ProjectAuthor';

const router = Router();

const headerFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D5F4A' } };
const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
const borderStyle: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
};

function addHeaderRow(ws: ExcelJS.Worksheet, headers: string[]) {
  const row = ws.addRow(headers);
  row.eachCell(cell => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = borderStyle;
  });
  return row;
}

function addDataRow(ws: ExcelJS.Worksheet, values: any[], index: number) {
  const row = ws.addRow(values);
  row.eachCell(cell => {
    cell.border = borderStyle;
    cell.alignment = { vertical: 'middle', wrapText: true };
    if (index % 2 === 0) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
    }
  });
  return row;
}

function fmtDate(d?: Date | string | null): string {
  if (!d) return '---';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '---' : dt.toLocaleDateString('pt-BR');
}

function fmtDateTime(d?: Date | string | null): string {
  if (!d) return '---';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '---' : dt.toLocaleString('pt-BR');
}

// =====================
// GET ALL DATA
// =====================
async function fetchAllData(sections: string[]) {
  const all = sections.includes('all');
  const data: any = {};

  if (all || sections.includes('users')) {
    data.users = await AppDataSource.getRepository(User).find({ order: { created_at: 'DESC' } });
  }
  if (all || sections.includes('projects')) {
    data.projects = await AppDataSource.getRepository(Project).find({
      where: { is_deleted: false },
      relations: ['owner', 'authors'],
      order: { created_at: 'DESC' },
    });
  }
  if (all || sections.includes('categories')) {
    data.categories = await AppDataSource.getRepository(Category).find({ order: { name: 'ASC' } });
  }
  if (all || sections.includes('audit')) {
    data.audit = await AppDataSource.getRepository(AuditLog).find({
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: 5000,
    });
  }
  if (all || sections.includes('notifications')) {
    data.notifications = await AppDataSource.getRepository(Notification).find({
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: 5000,
    });
  }

  return data;
}

// =====================
// EXCEL FULL EXPORT
// =====================
router.post('/exports/full/excel', async (req: Request, res: Response) => {
  try {
    const sections: string[] = req.body.sections || ['all'];
    const data = await fetchAllData(sections);
    const wb = new ExcelJS.Workbook();
    wb.creator = 'CEBIO Brasil';
    wb.created = new Date();

    // --- Aba Resumo ---
    const wsResumo = wb.addWorksheet('Resumo');
    wsResumo.columns = [{ width: 30 }, { width: 20 }];
    const titleRow = wsResumo.addRow(['Exportacao Completa - CEBIO Brasil']);
    titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FF2D5F4A' } };
    wsResumo.mergeCells(titleRow.number, 1, titleRow.number, 2);
    wsResumo.addRow(['Gerado em', new Date().toLocaleString('pt-BR')]);
    wsResumo.addRow([]);
    wsResumo.addRow(['Secao', 'Total de Registros']);
    if (data.users) wsResumo.addRow(['Usuarios', data.users.length]);
    if (data.projects) wsResumo.addRow(['Projetos', data.projects.length]);
    if (data.categories) wsResumo.addRow(['Categorias', data.categories.length]);
    if (data.audit) wsResumo.addRow(['Logs de Auditoria', data.audit.length]);
    if (data.notifications) wsResumo.addRow(['Notificacoes', data.notifications.length]);

    // --- Usuarios ---
    if (data.users?.length) {
      const ws = wb.addWorksheet('Usuarios');
      ws.columns = [
        { width: 8 }, { width: 30 }, { width: 30 }, { width: 15 },
        { width: 15 }, { width: 25 }, { width: 12 }, { width: 18 },
        { width: 18 }, { width: 15 },
      ];
      addHeaderRow(ws, ['ID', 'Nome', 'Email', 'CPF', 'Perfil', 'Instituicao', 'Ativo', 'Telefone', 'Criado em', 'Ultimo Login']);
      data.users.forEach((u: any, i: number) => {
        addDataRow(ws, [
          u.id, u.name, u.email, u.cpf || '---',
          u.role, u.institution || '---',
          u.is_active ? 'Sim' : 'Nao',
          u.phone || '---',
          fmtDateTime(u.created_at), fmtDateTime(u.last_login),
        ], i);
      });
      ws.autoFilter = { from: 'A1', to: 'J1' };
    }

    // --- Projetos ---
    if (data.projects?.length) {
      const ws = wb.addWorksheet('Projetos');
      ws.columns = [
        { width: 8 }, { width: 35 }, { width: 25 }, { width: 20 },
        { width: 15 }, { width: 15 }, { width: 30 }, { width: 18 },
        { width: 18 }, { width: 15 }, { width: 15 },
      ];
      addHeaderRow(ws, ['ID', 'Titulo', 'Proprietario', 'Categoria', 'Nivel Academico', 'Status', 'Resumo', 'Data Inicio', 'Data Fim', 'Criado em', 'Atualizado em']);
      data.projects.forEach((p: any, i: number) => {
        addDataRow(ws, [
          p.id, p.title, p.owner?.name || '---', p.category || '---',
          p.academic_level || '---', p.status,
          (p.summary || '').substring(0, 200),
          fmtDate(p.start_date), fmtDate(p.end_date),
          fmtDateTime(p.created_at), fmtDateTime(p.updated_at),
        ], i);
      });
      ws.autoFilter = { from: 'A1', to: 'K1' };

      // --- Autores dos Projetos ---
      const authorsData: any[] = [];
      data.projects.forEach((p: any) => {
        if (p.authors?.length) {
          p.authors.forEach((a: any) => {
            authorsData.push({ projectTitle: p.title, ...a });
          });
        }
      });
      if (authorsData.length) {
        const wsA = wb.addWorksheet('Autores');
        wsA.columns = [
          { width: 35 }, { width: 25 }, { width: 15 }, { width: 25 },
          { width: 20 }, { width: 15 }, { width: 15 },
        ];
        addHeaderRow(wsA, ['Projeto', 'Nome', 'CPF', 'Instituicao', 'Nivel Academico', 'Funcao', 'Status']);
        authorsData.forEach((a: any, i: number) => {
          addDataRow(wsA, [
            a.projectTitle, a.name, a.cpf || '---', a.institution || '---',
            a.academic_level || '---', a.role_in_project || '---', a.approval_status || '---',
          ], i);
        });
      }
    }

    // --- Categorias ---
    if (data.categories?.length) {
      const ws = wb.addWorksheet('Categorias');
      ws.columns = [{ width: 8 }, { width: 30 }, { width: 40 }, { width: 15 }, { width: 12 }, { width: 18 }];
      addHeaderRow(ws, ['ID', 'Nome', 'Descricao', 'Slug', 'Ativa', 'Criada em']);
      data.categories.forEach((c: any, i: number) => {
        addDataRow(ws, [c.id, c.name, c.description || '---', c.slug, c.is_active ? 'Sim' : 'Nao', fmtDateTime(c.created_at)], i);
      });
    }

    // --- Auditoria ---
    if (data.audit?.length) {
      const ws = wb.addWorksheet('Auditoria');
      ws.columns = [
        { width: 8 }, { width: 25 }, { width: 25 }, { width: 40 },
        { width: 12 }, { width: 15 }, { width: 20 },
      ];
      addHeaderRow(ws, ['ID', 'Acao', 'Usuario', 'Detalhes', 'Severidade', 'IP', 'Data/Hora']);
      data.audit.forEach((a: any, i: number) => {
        addDataRow(ws, [
          a.id, a.action, a.user?.name || `ID ${a.user_id}`,
          (a.details || '').substring(0, 300), a.severity, a.ip_address || '---',
          fmtDateTime(a.timestamp || a.created_at),
        ], i);
      });
      ws.autoFilter = { from: 'A1', to: 'G1' };
    }

    // --- Notificacoes ---
    if (data.notifications?.length) {
      const ws = wb.addWorksheet('Notificacoes');
      ws.columns = [
        { width: 8 }, { width: 25 }, { width: 30 }, { width: 40 },
        { width: 12 }, { width: 12 }, { width: 20 },
      ];
      addHeaderRow(ws, ['ID', 'Usuario', 'Titulo', 'Mensagem', 'Tipo', 'Lida', 'Data']);
      data.notifications.forEach((n: any, i: number) => {
        addDataRow(ws, [
          n.id, n.user?.name || `ID ${n.user_id}`, n.title,
          (n.message || '').substring(0, 200), n.type || '---',
          n.is_read ? 'Sim' : 'Nao', fmtDateTime(n.created_at),
        ], i);
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=exportacao_completa_cebio_${new Date().toISOString().slice(0, 10)}.xlsx`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Full Excel export error:', err);
    res.status(500).json({ error: 'Falha ao gerar exportacao Excel' });
  }
});

// =====================
// PDF FULL EXPORT
// =====================
router.post('/exports/full/pdf', async (req: Request, res: Response) => {
  try {
    const sections: string[] = req.body.sections || ['all'];
    const data = await fetchAllData(sections);
    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=exportacao_completa_cebio_${new Date().toISOString().slice(0, 10)}.pdf`);
    doc.pipe(res);

    const green = '#2D5F4A';
    const gray = '#6B7280';
    const lightGray = '#F3F4F6';

    // Cover
    doc.fontSize(22).fillColor(green).text('Exportacao Completa', { align: 'center' });
    doc.fontSize(12).fillColor(green).text('CEBIO Brasil', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(gray).text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.moveDown(1);

    // Summary
    doc.fontSize(14).fillColor(green).text('Resumo da Exportacao');
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(green).lineWidth(1).stroke();
    doc.moveDown(0.5);
    if (data.users) doc.fontSize(10).fillColor('#111').text(`Usuarios: ${data.users.length}`);
    if (data.projects) doc.fontSize(10).fillColor('#111').text(`Projetos: ${data.projects.length}`);
    if (data.categories) doc.fontSize(10).fillColor('#111').text(`Categorias: ${data.categories.length}`);
    if (data.audit) doc.fontSize(10).fillColor('#111').text(`Logs de Auditoria: ${data.audit.length}`);
    if (data.notifications) doc.fontSize(10).fillColor('#111').text(`Notificacoes: ${data.notifications.length}`);

    // Users table
    if (data.users?.length) {
      doc.addPage();
      doc.fontSize(16).fillColor(green).text(`Usuarios (${data.users.length})`);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(green).lineWidth(1).stroke();
      doc.moveDown(0.3);

      const cols = [40, 180, 320, 420, 490];
      const colW = [135, 135, 95, 65, 65];
      const headers = ['Nome', 'Email', 'Instituicao', 'Perfil', 'Status'];
      const hy = doc.y;
      doc.save();
      doc.rect(40, hy - 2, 515, 18).fill(green);
      headers.forEach((h, i) => doc.fillColor('white').fontSize(8).text(h, cols[i] + 3, hy, { width: colW[i] }));
      doc.restore();
      doc.y = hy + 20;

      data.users.forEach((u: any, i: number) => {
        if (doc.y > 740) { doc.addPage(); doc.y = 40; }
        const ry = doc.y;
        if (i % 2 === 0) { doc.save(); doc.rect(40, ry - 2, 515, 16).fill(lightGray); doc.restore(); }
        const vals = [u.name, u.email, u.institution || '---', u.role, u.is_active ? 'Ativo' : 'Inativo'];
        vals.forEach((v, j) => doc.fillColor('#111').fontSize(7).text(v || '---', cols[j] + 3, ry, { width: colW[j], lineBreak: false }));
        doc.y = ry + 17;
      });
    }

    // Projects table
    if (data.projects?.length) {
      doc.addPage();
      doc.fontSize(16).fillColor(green).text(`Projetos (${data.projects.length})`);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(green).lineWidth(1).stroke();
      doc.moveDown(0.3);

      const cols = [40, 210, 330, 430, 490];
      const colW = [165, 115, 95, 55, 65];
      const headers = ['Titulo', 'Proprietario', 'Categoria', 'Status', 'Data'];
      const hy = doc.y;
      doc.save();
      doc.rect(40, hy - 2, 515, 18).fill(green);
      headers.forEach((h, i) => doc.fillColor('white').fontSize(8).text(h, cols[i] + 3, hy, { width: colW[i] }));
      doc.restore();
      doc.y = hy + 20;

      data.projects.forEach((p: any, i: number) => {
        if (doc.y > 740) { doc.addPage(); doc.y = 40; }
        const ry = doc.y;
        if (i % 2 === 0) { doc.save(); doc.rect(40, ry - 2, 515, 16).fill(lightGray); doc.restore(); }
        const vals = [p.title, p.owner?.name || '---', p.category || '---', p.status, fmtDate(p.created_at)];
        vals.forEach((v, j) => doc.fillColor('#111').fontSize(7).text(v || '---', cols[j] + 3, ry, { width: colW[j], lineBreak: false }));
        doc.y = ry + 17;
      });
    }

    // Categories
    if (data.categories?.length) {
      doc.addPage();
      doc.fontSize(16).fillColor(green).text(`Categorias (${data.categories.length})`);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(green).lineWidth(1).stroke();
      doc.moveDown(0.3);
      data.categories.forEach((c: any, i: number) => {
        if (doc.y > 740) doc.addPage();
        const ry = doc.y;
        if (i % 2 === 0) { doc.save(); doc.rect(40, ry - 2, 515, 16).fill(lightGray); doc.restore(); }
        doc.fillColor('#111').fontSize(9).text(`${c.name} — ${c.description || 'Sem descricao'}`, 45, ry);
        doc.y = ry + 18;
      });
    }

    // Audit
    if (data.audit?.length) {
      doc.addPage();
      doc.fontSize(16).fillColor(green).text(`Auditoria (${data.audit.length} registros)`);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(green).lineWidth(1).stroke();
      doc.moveDown(0.3);

      const cols = [40, 150, 280, 430];
      const colW = [105, 125, 145, 125];
      const headers = ['Acao', 'Usuario', 'Detalhes', 'Data/Hora'];
      const hy = doc.y;
      doc.save();
      doc.rect(40, hy - 2, 515, 18).fill(green);
      headers.forEach((h, i) => doc.fillColor('white').fontSize(8).text(h, cols[i] + 3, hy, { width: colW[i] }));
      doc.restore();
      doc.y = hy + 20;

      const auditSlice = data.audit.slice(0, 500);
      auditSlice.forEach((a: any, i: number) => {
        if (doc.y > 740) { doc.addPage(); doc.y = 40; }
        const ry = doc.y;
        if (i % 2 === 0) { doc.save(); doc.rect(40, ry - 2, 515, 16).fill(lightGray); doc.restore(); }
        const vals = [a.action, a.user?.name || '---', (a.details || '').substring(0, 60), fmtDateTime(a.timestamp || a.created_at)];
        vals.forEach((v, j) => doc.fillColor('#111').fontSize(7).text(v || '---', cols[j] + 3, ry, { width: colW[j], lineBreak: false }));
        doc.y = ry + 17;
      });
    }

    // Footer
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor(gray).text(`CEBIO Brasil - Pagina ${i + 1} de ${totalPages}`, 40, 780, { align: 'center', width: 515 });
    }

    doc.end();
  } catch (err) {
    console.error('Full PDF export error:', err);
    res.status(500).json({ error: 'Falha ao gerar exportacao PDF' });
  }
});

// =====================
// JSON FULL EXPORT
// =====================
router.post('/exports/full/json', async (req: Request, res: Response) => {
  try {
    const sections: string[] = req.body.sections || ['all'];
    const data = await fetchAllData(sections);

    // Remove sensitive fields
    if (data.users) {
      data.users = data.users.map((u: any) => {
        const { hashed_password, ...safe } = u;
        return safe;
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=exportacao_completa_cebio_${new Date().toISOString().slice(0, 10)}.json`);
    res.json({
      exported_at: new Date().toISOString(),
      system: 'CEBIO Brasil',
      ...data,
    });
  } catch (err) {
    console.error('Full JSON export error:', err);
    res.status(500).json({ error: 'Falha ao gerar exportacao JSON' });
  }
});

export default router;
