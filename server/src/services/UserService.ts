import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { hashPassword, verifyPassword } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async createUser(
    email: string,
    name: string,
    password: string,
    role: UserRole = 'bolsista',
    institution?: string,
    createdBy?: number,
    cpf?: string,
    birthDate?: string,
    phone?: string,
    department?: string,
    registrationNumber?: string
  ): Promise<User> {
    const existingEmail = await this.userRepository.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingEmail) {
      throw new AppError(400, 'Email já cadastrado');
    }

    if (cpf) {
      const existingCpf = await this.userRepository.findOne({ where: { cpf } });
      if (existingCpf) {
        throw new AppError(400, 'CPF já cadastrado');
      }
    }

    const user = this.userRepository.create({
      email: email.toLowerCase().trim(),
      name,
      hashed_password: hashPassword(password),
      role,
      institution,
      created_by: createdBy,
      cpf,
      birth_date: birthDate ? new Date(birthDate) : undefined,
      phone,
      department,
      registration_number: registrationNumber,
      is_temp_password: true,
      must_change_password: true,
    });

    return await this.userRepository.save(user);
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async getUserByCpf(cpf: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { cpf: cpf.replace(/\D/g, '') },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.is_active) {
      return null;
    }

    if (!verifyPassword(password, user.hashed_password)) {
      return null;
    }

    return user;
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      last_login: new Date(),
    });
  }

  async listUsers(role?: UserRole, active?: boolean): Promise<User[]> {
    let query = this.userRepository.createQueryBuilder('user');

    if (role) {
      query = query.where('user.role = :role', { role });
    }

    if (active !== undefined) {
      query = query.andWhere('user.is_active = :active', { active });
    }

    return await query.orderBy('user.created_at', 'DESC').getMany();
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updates);
    const user = await this.getUserById(id);
    if (!user) {
      throw new AppError(404, 'Usuário não encontrado');
    }
    return user;
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new AppError(404, 'Usuário não encontrado');
    }

    if (!verifyPassword(oldPassword, user.hashed_password)) {
      throw new AppError(400, 'Senha atual incorreta');
    }

    await this.userRepository.update(userId, {
      hashed_password: hashPassword(newPassword),
      is_temp_password: false,
      must_change_password: false,
    });
  }

  async deleteUser(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new AppError(404, 'Usuário não encontrado');
    }
  }

  async listInstitutions(): Promise<string[]> {
    const results = await this.userRepository
      .createQueryBuilder('user')
      .select('DISTINCT user.institution', 'institution')
      .where('user.institution IS NOT NULL')
      .andWhere("user.institution != ''")
      .getRawMany();
    return results.map((r: any) => r.institution).filter(Boolean).sort();
  }
}
