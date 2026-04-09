import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Category } from '../entities/Category';
import { AcademicLevel } from '../entities/AcademicLevel';
import { Project } from '../entities/Project';
import { hashPassword } from '../utils/auth';
import logger from '../utils/logger';

const seed = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established');

    const userRepository = AppDataSource.getRepository(User);
    const categoryRepository = AppDataSource.getRepository(Category);
    const levelRepository = AppDataSource.getRepository(AcademicLevel);
    const projectRepository = AppDataSource.getRepository(Project);

    // Clear existing data
    await projectRepository.delete({});
    await userRepository.delete({});
    await categoryRepository.delete({});
    await levelRepository.delete({});

    logger.info('Cleared existing data');

    // Create users
    const admin = userRepository.create({
      email: 'admin@cebio.org.br',
      name: 'Administrador CEBIO',
      hashed_password: hashPassword('admin123'),
      role: 'admin',
      institution: 'CEBIO',
      is_active: true,
      is_temp_password: false,
    });

    const pesquisador = userRepository.create({
      email: 'pesquisador@cebio.org.br',
      name: 'Dr. João Silva',
      hashed_password: hashPassword('pesq123'),
      role: 'pesquisador',
      institution: 'Universidade Federal de Goiás',
      is_active: true,
      is_temp_password: false,
    });

    const bolsista = userRepository.create({
      email: 'bolsista@cebio.org.br',
      name: 'Maria Santos',
      hashed_password: hashPassword('bolsa123'),
      role: 'bolsista',
      institution: 'Universidade Federal de Goiás',
      is_active: true,
      is_temp_password: false,
    });

    await userRepository.save([admin, pesquisador, bolsista]);
    logger.info('✅ Created 3 users (admin, pesquisador, bolsista)');

    // Create categories
    const categories = [
      { name: 'Biologia', slug: 'biologia', description: 'Pesquisas em Biologia', color: '#4CAF50', icon: 'flask' },
      { name: 'Química', slug: 'quimica', description: 'Pesquisas em Química', color: '#2196F3', icon: 'beaker' },
      { name: 'Física', slug: 'fisica', description: 'Pesquisas em Física', color: '#FF9800', icon: 'atom' },
      { name: 'Tecnologia', slug: 'tecnologia', description: 'Pesquisas em Tecnologia', color: '#9C27B0', icon: 'laptop' },
      { name: 'Saúde', slug: 'saude', description: 'Pesquisas em Saúde', color: '#F44336', icon: 'heart' },
    ];

    for (const cat of categories) {
      const category = categoryRepository.create({
        ...cat,
        created_by: admin.id,
        is_active: true,
      });
      await categoryRepository.save(category);
    }
    logger.info('✅ Created 5 categories');

    // Create academic levels
    const levels = [
      { name: 'Ensino Médio', slug: 'ensino-medio', order: 1 },
      { name: 'Graduação', slug: 'graduacao', order: 2 },
      { name: 'Mestrado', slug: 'mestrado', order: 3 },
      { name: 'Doutorado', slug: 'doutorado', order: 4 },
      { name: 'Pós-Doutorado', slug: 'pos-doutorado', order: 5 },
    ];

    for (const level of levels) {
      const academicLevel = levelRepository.create({
        ...level,
        created_by: admin.id,
        is_active: true,
      });
      await levelRepository.save(academicLevel);
    }
    logger.info('✅ Created 5 academic levels');

    // Create sample projects
    const projects = [
      {
        title: 'Estudo de Biodiversidade em Goiás',
        summary: 'Análise da biodiversidade local',
        description: 'Pesquisa completa sobre a biodiversidade da região de Goiás',
        category: 'Biologia',
        academic_level: 'Mestrado',
        owner_id: pesquisador.id,
        status: 'aprovado' as const,
      },
      {
        title: 'Desenvolvimento de Aplicativo Mobile',
        summary: 'App para gestão de projetos',
        description: 'Desenvolvimento de aplicativo mobile para gestão de projetos de pesquisa',
        category: 'Tecnologia',
        academic_level: 'Graduação',
        owner_id: bolsista.id,
        status: 'pendente' as const,
      },
      {
        title: 'Análise de Compostos Químicos',
        summary: 'Estudo de novos compostos',
        description: 'Análise e síntese de novos compostos químicos',
        category: 'Química',
        academic_level: 'Doutorado',
        owner_id: pesquisador.id,
        status: 'em_revisao' as const,
      },
      {
        title: 'Efeitos da Radiação Solar',
        summary: 'Estudo de impactos da radiação',
        description: 'Pesquisa sobre os efeitos da radiação solar em organismos vivos',
        category: 'Física',
        academic_level: 'Mestrado',
        owner_id: pesquisador.id,
        status: 'aprovado' as const,
      },
      {
        title: 'Prevenção de Doenças Infecciosas',
        summary: 'Estratégias de prevenção',
        description: 'Desenvolvimento de estratégias para prevenção de doenças infecciosas',
        category: 'Saúde',
        academic_level: 'Doutorado',
        owner_id: pesquisador.id,
        status: 'rejeitado' as const,
      },
    ];

    for (const proj of projects) {
      const project = projectRepository.create(proj);
      await projectRepository.save(project);
    }
    logger.info('✅ Created 5 sample projects');

    logger.info('✅ Seed completed successfully!');
    console.log('\n📊 Dados de Teste Criados:');
    console.log('👤 Usuários:');
    console.log('  - admin@cebio.org.br / admin123 (Admin)');
    console.log('  - pesquisador@cebio.org.br / pesq123 (Pesquisador)');
    console.log('  - bolsista@cebio.org.br / bolsa123 (Bolsista)');
    console.log('📁 Categorias: 5');
    console.log('🎓 Níveis Acadêmicos: 5');
    console.log('📚 Projetos: 5');

    process.exit(0);
  } catch (error) {
    logger.error('Seed failed', { error });
    console.error('❌ Erro ao popular banco de dados:', error);
    process.exit(1);
  }
};

seed();
