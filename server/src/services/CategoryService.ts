import { AppDataSource } from '../config/database';
import { Category } from '../entities/Category';
import { AcademicLevel } from '../entities/AcademicLevel';
import { AppError } from '../middleware/errorHandler';

export class CategoryService {
  private categoryRepository = AppDataSource.getRepository(Category);
  private levelRepository = AppDataSource.getRepository(AcademicLevel);

  // Categories
  async createCategory(
    name: string,
    slug: string,
    description?: string,
    color?: string,
    icon?: string,
    createdBy?: number
  ): Promise<Category> {
    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing) {
      throw new AppError(400, 'Categoria já existe');
    }

    const category = this.categoryRepository.create({
      name,
      slug,
      description,
      color,
      icon,
      created_by: createdBy,
    });

    return await this.categoryRepository.save(category);
  }

  async listCategories(activeOnly: boolean = true): Promise<Category[]> {
    let query = this.categoryRepository.createQueryBuilder('category');

    if (activeOnly) {
      query = query.where('category.is_active = :active', { active: true });
    }

    return await query.orderBy('category.name', 'ASC').getMany();
  }

  async getCategoryById(id: number): Promise<Category | null> {
    return await this.categoryRepository.findOne({ where: { id } });
  }

  async updateCategory(id: number, updates: Partial<Category>): Promise<Category> {
    await this.categoryRepository.update(id, updates);
    const category = await this.getCategoryById(id);
    if (!category) {
      throw new AppError(404, 'Categoria não encontrada');
    }
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new AppError(404, 'Categoria não encontrada');
    }
  }

  // Academic Levels
  async createAcademicLevel(
    name: string,
    slug: string,
    description?: string,
    order: number = 0,
    createdBy?: number
  ): Promise<AcademicLevel> {
    const existing = await this.levelRepository.findOne({ where: { slug } });
    if (existing) {
      throw new AppError(400, 'Nível acadêmico já existe');
    }

    const level = this.levelRepository.create({
      name,
      slug,
      description,
      order,
      created_by: createdBy,
    });

    return await this.levelRepository.save(level);
  }

  async listAcademicLevels(activeOnly: boolean = true): Promise<AcademicLevel[]> {
    let query = this.levelRepository.createQueryBuilder('level');

    if (activeOnly) {
      query = query.where('level.is_active = :active', { active: true });
    }

    return await query.orderBy('level.order', 'ASC').addOrderBy('level.name', 'ASC').getMany();
  }

  async getAcademicLevelById(id: number): Promise<AcademicLevel | null> {
    return await this.levelRepository.findOne({ where: { id } });
  }

  async updateAcademicLevel(id: number, updates: Partial<AcademicLevel>): Promise<AcademicLevel> {
    await this.levelRepository.update(id, updates);
    const level = await this.getAcademicLevelById(id);
    if (!level) {
      throw new AppError(404, 'Nível acadêmico não encontrado');
    }
    return level;
  }

  async deleteAcademicLevel(id: number): Promise<void> {
    const result = await this.levelRepository.delete(id);
    if (result.affected === 0) {
      throw new AppError(404, 'Nível acadêmico não encontrado');
    }
  }
}
