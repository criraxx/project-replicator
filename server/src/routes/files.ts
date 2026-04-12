import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppDataSource } from '../config/database';
import { ProjectFile } from '../entities/ProjectFile';
import { ProjectLink } from '../entities/ProjectLink';
import { Project } from '../entities/Project';
import { authMiddleware } from '../utils/auth';
import { AuditService } from '../services/AuditService';

const router = Router();
const auditService = new AuditService();
const fileRepo = AppDataSource.getRepository(ProjectFile);
const linkRepo = AppDataSource.getRepository(ProjectLink);
const projectRepo = AppDataSource.getRepository(Project);

// Configurar diretório de uploads
const uploadsDir = path.resolve(process.env.UPLOADS_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectDir = path.join(uploadsDir, `project_${req.params.id}`);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    cb(null, projectDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedPhotos = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const allowedDocs = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if ([...allowedPhotos, ...allowedDocs].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${ext}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 10, // max 10 files per request
  },
});

// POST /api/projects/:id/files - Upload de arquivos
router.post(
  '/projects/:id/files',
  authMiddleware,
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'files', maxCount: 10 }]),
  async (req: Request, res: Response) => {
    try {
      const projectId = Number(req.params.id);
      const project = await projectRepo.findOne({ where: { id: projectId, is_deleted: false } });
      if (!project) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }

      // Verificar permissão (dono ou admin)
      if (req.user!.role !== 'admin' && project.owner_id !== req.user!.id) {
        return res.status(403).json({ error: 'Sem permissão para enviar arquivos neste projeto' });
      }

      // Support both 'file' (single) and 'files' (multiple) field names
      const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
      const files = [...(uploadedFiles['file'] || []), ...(uploadedFiles['files'] || [])];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      // Verificar limites: max 5 fotos e 5 PDFs
      const existingFiles = await fileRepo.find({ where: { project_id: projectId } });
      const existingPhotos = existingFiles.filter(f => f.file_category === 'photo').length;
      const existingPdfs = existingFiles.filter(f => f.file_category === 'pdf').length;

      const photoExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const newPhotos = files.filter(f => photoExts.includes(path.extname(f.originalname).toLowerCase()));
      const newPdfs = files.filter(f => path.extname(f.originalname).toLowerCase() === '.pdf');

      if (existingPhotos + newPhotos.length > 5) {
        return res.status(400).json({ error: `Limite de 5 fotos excedido. Já existem ${existingPhotos} fotos.` });
      }
      if (existingPdfs + newPdfs.length > 5) {
        return res.status(400).json({ error: `Limite de 5 PDFs excedido. Já existem ${existingPdfs} PDFs.` });
      }

      const savedFiles: ProjectFile[] = [];
      const fileTypeFromReq = req.body.file_type; // Get file_type from frontend if available

      for (const file of files) {
        const ext = path.extname(file.originalname).toLowerCase();
        const isPhoto = photoExts.includes(ext);
        
        // Use file_type from request if it's valid, otherwise fallback to extension check
        let category = isPhoto ? 'photo' : 'pdf';
        if (fileTypeFromReq === 'photo' || fileTypeFromReq === 'foto') category = 'photo';
        if (fileTypeFromReq === 'pdf' || fileTypeFromReq === 'documento') category = 'pdf';

        const projectFile = fileRepo.create({
          project_id: projectId,
          filename: file.filename,
          original_name: file.originalname,
          file_type: file.mimetype,
          file_path: file.path,
          file_size: file.size,
          file_category: category,
          uploaded_by: req.user!.id,
        });
        savedFiles.push(await fileRepo.save(projectFile));
      }

      await auditService.logAction(
        'UPLOAD_FILES',
        req.user!.id,
        undefined,
        projectId,
        `${savedFiles.length} arquivo(s) enviado(s) para projeto #${projectId}`,
        req.ip || 'unknown',
        'low'
      );

      res.status(201).json({ files: savedFiles, message: `${savedFiles.length} arquivo(s) enviado(s) com sucesso` });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao enviar arquivos' });
    }
  }
);

// GET /api/projects/:id/files - Listar arquivos do projeto
router.get('/projects/:id/files', authMiddleware, async (req: Request, res: Response) => {
  try {
    const files = await fileRepo.find({
      where: { project_id: Number(req.params.id) },
      order: { created_at: 'DESC' },
    });
    res.json(files);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao listar arquivos' });
  }
});

// DELETE /api/projects/:id/files/:fileId - Remover arquivo
router.delete('/projects/:id/files/:fileId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const file = await fileRepo.findOne({
      where: { id: Number(req.params.fileId), project_id: Number(req.params.id) },
    });
    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    await fileRepo.remove(file);

    await auditService.logAction(
      'DELETE_FILE',
      req.user!.id,
      Number(req.params.id),
      undefined,
      `Arquivo removido: ${file.original_name}`,
      req.ip || 'unknown',
      'medium'
    );

    res.json({ message: 'Arquivo removido com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao remover arquivo' });
  }
});

// GET /api/projects/:id/files/:fileId/download - Download de arquivo (protegido por autenticação)
router.get('/projects/:id/files/:fileId/download', authMiddleware, async (req: Request, res: Response) => {
  try {
    const file = await fileRepo.findOne({
      where: { id: Number(req.params.fileId), project_id: Number(req.params.id) },
    });
    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }
    res.download(file.file_path, file.original_name);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao baixar arquivo' });
  }
});

// ===== LINKS =====

// POST /api/projects/:id/links - Adicionar link
router.post('/projects/:id/links', authMiddleware, async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.id);
    const project = await projectRepo.findOne({ where: { id: projectId, is_deleted: false } });
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    if (req.user!.role !== 'admin' && project.owner_id !== req.user!.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const { title, url, link_type, description } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: 'Título e URL são obrigatórios' });
    }

    const link = linkRepo.create({ 
      project_id: projectId, 
      title, 
      url, 
      link_type: link_type || 'outro', 
      description 
    });
    const saved = await linkRepo.save(link);
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao adicionar link' });
  }
});

// GET /api/projects/:id/links - Listar links
router.get('/projects/:id/links', authMiddleware, async (req: Request, res: Response) => {
  try {
    const links = await linkRepo.find({
      where: { project_id: Number(req.params.id) },
      order: { created_at: 'DESC' },
    });
    res.json(links);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao listar links' });
  }
});

// DELETE /api/projects/:id/links/:linkId - Remover link
router.delete('/projects/:id/links/:linkId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const link = await linkRepo.findOne({
      where: { id: Number(req.params.linkId), project_id: Number(req.params.id) },
    });
    if (!link) {
      return res.status(404).json({ error: 'Link não encontrado' });
    }
    await linkRepo.remove(link);
    res.json({ message: 'Link removido com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao remover link' });
  }
});

export default router;
