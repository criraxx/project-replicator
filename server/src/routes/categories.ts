import { Router, Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';
import { authMiddleware, requireRole } from '../utils/auth';

const router = Router();
const categoryService = new CategoryService();

// GET /api/categories
router.get('/categories', authMiddleware, async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.listCategories();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/categories
router.post('/categories', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { name, slug, description, color, icon } = req.body;
    const category = await categoryService.createCategory(name, slug, description, color, icon, req.user!.id);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// PUT /api/categories/:id
router.put('/categories/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const category = await categoryService.updateCategory(Number(req.params.id), req.body);
    res.json(category);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// DELETE /api/categories/:id
router.delete('/categories/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    await categoryService.deleteCategory(Number(req.params.id));
    res.json({ message: 'Categoria removida com sucesso' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/academic-levels
router.get('/academic-levels', authMiddleware, async (req: Request, res: Response) => {
  try {
    const levels = await categoryService.listAcademicLevels();
    res.json(levels);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

export default router;
