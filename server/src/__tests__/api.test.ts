import request from 'supertest';
import app from '../index';

describe('CEBIO Brasil API Tests', () => {
  let token: string;
  let userId: number;
  let projectId: number;

  // Health Check
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  // Authentication
  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'admin@cebio.org.br',
          password: 'admin123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('role', 'admin');

      token = response.body.access_token;
      userId = response.body.user.id;
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'admin@cebio.org.br',
          password: 'wrong-password',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should get authenticated user info', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'admin@cebio.org.br');
      expect(response.body).toHaveProperty('role', 'admin');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  // Users
  describe('Users', () => {
    it('should list users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get user stats', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('admins');
      expect(response.body).toHaveProperty('pesquisadores');
      expect(response.body).toHaveProperty('bolsistas');
    });

    it('should get specific user', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('email');
    });
  });

  // Projects
  describe('Projects', () => {
    it('should list projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('projects');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.projects)).toBe(true);
    });

    it('should create a project', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Project',
          summary: 'Test Summary',
          description: 'Test Description',
          category: 'Biologia',
          academic_level: 'Mestrado',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Test Project');
      expect(response.body).toHaveProperty('status', 'pendente');

      projectId = response.body.id;
    });

    it('should get project stats', async () => {
      const response = await request(app)
        .get('/api/projects/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('pending');
      expect(response.body).toHaveProperty('approved');
      expect(response.body).toHaveProperty('rejected');
    });

    it('should get pending projects', async () => {
      const response = await request(app)
        .get('/api/projects/pending')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('projects');
      expect(response.body).toHaveProperty('total');
    });

    it('should approve a project', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/approve`)
        .set('Authorization', `Bearer ${token}`)
        .send({ comment: 'Approved for testing' })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'aprovado');
    });

    it('should reject a project', async () => {
      // Create another project first
      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Project 2',
          summary: 'Test Summary 2',
          description: 'Test Description 2',
          category: 'Química',
          academic_level: 'Doutorado',
        })
        .expect(201);

      const newProjectId = createResponse.body.id;

      // Reject it
      const response = await request(app)
        .post(`/api/projects/${newProjectId}/reject`)
        .set('Authorization', `Bearer ${token}`)
        .send({ comment: 'Rejected for testing' })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'rejeitado');
    });
  });

  // Categories
  describe('Categories', () => {
    it('should list categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should list academic levels', async () => {
      const response = await request(app)
        .get('/api/academic-levels')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // Audit
  describe('Audit', () => {
    it('should list audit logs', async () => {
      const response = await request(app)
        .get('/api/audit')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('total');
    });

    it('should get audit stats', async () => {
      const response = await request(app)
        .get('/api/audit/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
    });
  });

  // Notifications
  describe('Notifications', () => {
    it('should list notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('notifications');
      expect(response.body).toHaveProperty('total');
    });
  });

  // Admin
  describe('Admin', () => {
    it('should get admin health check', async () => {
      const response = await request(app)
        .get('/api/admin/health')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
    });

    it('should get admin status', async () => {
      const response = await request(app)
        .get('/api/admin/status')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should get admin config', async () => {
      const response = await request(app)
        .get('/api/admin/config')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('maintenance_mode');
    });

    it('should get dashboard reports', async () => {
      const response = await request(app)
        .get('/api/reports/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('users_total');
      expect(response.body).toHaveProperty('projects_total');
    });
  });

  // Error Handling
  describe('Error Handling', () => {
    it('should return 404 for non-existent route', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // Missing required fields
          description: 'Missing title and summary',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
