// API Client for CEBIO Brasil Backend
// Configure API_BASE_URL to point to your backend server

const API_BASE_URL = '/api';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('cebio_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('cebio_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('cebio_token');
  }

  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      this.clearToken();
      localStorage.removeItem('cebio_user');
      window.location.href = '/login';
      throw new Error('Sessão expirada');
    }

    const text = await response.text();
    if (!text) {
      throw new Error('Servidor não respondeu. Verifique se o backend está rodando.');
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Resposta inválida do servidor.');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    return data;
  }

  // ============================================
  // AUTH
  // ============================================

  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string; user: any }>('POST', '/login', { email, password });
    this.setToken(data.access_token);
    return data;
  }

  async getMe() {
    return this.request<any>('GET', '/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<any>('PUT', '/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  // ============================================
  // USERS
  // ============================================

  async listUsers(role?: string, active?: boolean) {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (active !== undefined) params.set('active', String(active));
    const query = params.toString() ? `?${params}` : '';
    return this.request<any[]>('GET', `/users${query}`);
  }

  async getUser(id: number) {
    return this.request<any>('GET', `/users/${id}`);
  }

  async createUser(data: { email: string; name: string; password: string; role: string; institution?: string }) {
    return this.request<any>('POST', '/users', data);
  }

  async updateUser(id: number, data: Partial<{ name: string; institution: string; role: string; is_active: boolean }>) {
    return this.request<any>('PUT', `/users/${id}`, data);
  }

  async deleteUser(id: number) {
    return this.request<void>('DELETE', `/users/${id}`);
  }

  async resetUserPassword(id: number, newPassword?: string) {
    return this.request<{ message: string; temporary_password: string }>('PUT', `/users/${id}/reset-password`, {
      new_password: newPassword,
    });
  }

  async batchCreateUsers(users: { email: string; name: string; role?: string; institution?: string }[], defaultPassword?: string) {
    return this.request<{ success: any[]; errors: any[] }>('POST', '/users/batch', {
      users,
      default_password: defaultPassword,
    });
  }

  // ============================================
  // PROJECTS
  // ============================================

  async listProjects(params?: { status?: string; owner_id?: number; limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.owner_id) searchParams.set('owner_id', String(params.owner_id));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    const query = searchParams.toString() ? `?${searchParams}` : '';
    return this.request<{ projects: any[]; total: number }>('GET', `/projects${query}`);
  }

  async getProject(id: number) {
    return this.request<any>('GET', `/projects/${id}`);
  }

  async createProject(data: { title: string; summary: string; description?: string; category: string; academic_level: string; start_date?: string; end_date?: string }) {
    return this.request<any>('POST', '/projects', data);
  }

  async updateProject(id: number, data: Partial<any>) {
    return this.request<any>('PUT', `/projects/${id}`, data);
  }

  async approveProject(id: number, comment?: string) {
    return this.request<any>('POST', `/projects/${id}/approve`, { comment });
  }

  async rejectProject(id: number, comment?: string) {
    return this.request<any>('POST', `/projects/${id}/reject`, { comment });
  }

  async deleteProject(id: number) {
    return this.request<void>('DELETE', `/projects/${id}`);
  }

  async getProjectStats() {
    return this.request<{ total: number; pending: number; approved: number; rejected: number }>('GET', '/projects/stats');
  }

  async getPendingProjects() {
    return this.request<{ projects: any[]; total: number }>('GET', '/projects/pending');
  }

  async batchApprove(projectIds: number[]) {
    return this.request<void>('POST', '/projects/batch/approve', { project_ids: projectIds });
  }

  async batchReject(projectIds: number[]) {
    return this.request<void>('POST', '/projects/batch/reject', { project_ids: projectIds });
  }

  // ============================================
  // CATEGORIES
  // ============================================

  async listCategories() {
    return this.request<any[]>('GET', '/categories');
  }

  async createCategory(data: { name: string; slug: string; description?: string; color?: string }) {
    return this.request<any>('POST', '/categories', data);
  }

  async updateCategory(id: number, data: Partial<any>) {
    return this.request<any>('PUT', `/categories/${id}`, data);
  }

  async deleteCategory(id: number) {
    return this.request<void>('DELETE', `/categories/${id}`);
  }

  // ============================================
  // ACADEMIC LEVELS
  // ============================================

  async listAcademicLevels() {
    return this.request<any[]>('GET', '/academic-levels');
  }

  async createAcademicLevel(data: { name: string; slug: string; description?: string; order?: number }) {
    return this.request<any>('POST', '/academic-levels', data);
  }

  async updateAcademicLevel(id: number, data: Partial<any>) {
    return this.request<any>('PUT', `/academic-levels/${id}`, data);
  }

  async deleteAcademicLevel(id: number) {
    return this.request<void>('DELETE', `/academic-levels/${id}`);
  }

  // ============================================
  // AUDIT
  // ============================================

  async listAuditLogs(limit?: number, offset?: number) {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    if (offset) params.set('offset', String(offset));
    const query = params.toString() ? `?${params}` : '';
    return this.request<{ logs: any[]; total: number }>('GET', `/audit${query}`);
  }

  async getAuditStats() {
    return this.request<{ total: number; today: number }>('GET', '/audit/stats');
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  async listNotifications(limit?: number, offset?: number) {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    if (offset) params.set('offset', String(offset));
    const query = params.toString() ? `?${params}` : '';
    return this.request<{ notifications: any[]; total: number }>('GET', `/notifications${query}`);
  }

  async markNotificationRead(id: number) {
    return this.request<void>('PUT', `/notifications/${id}/read`);
  }

  async broadcastNotification(data: { title: string; message: string; type?: string }) {
    return this.request<void>('POST', '/notifications/broadcast', data);
  }

  // ============================================
  // ADMIN
  // ============================================

  async getAdminStatus() {
    return this.request<any>('GET', '/admin/status');
  }

  async getAdminConfig() {
    return this.request<any>('GET', '/admin/config');
  }

  async getDashboardReports() {
    return this.request<any>('GET', '/reports/dashboard');
  }

}

export const api = new ApiClient();
export default api;
