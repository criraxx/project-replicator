import { AppDataSource } from '../config/database';
import { AuditLog } from '../entities/AuditLog';

export class AuditService {
  private auditRepository = AppDataSource.getRepository(AuditLog);

  async logAction(
    action: string,
    userId?: number,
    targetUserId?: number,
    targetProjectId?: number,
    details?: string,
    ipAddress?: string,
    severity: 'low' | 'medium' | 'high' = 'low'
  ): Promise<AuditLog> {
    const log = this.auditRepository.create({
      action,
      user_id: userId,
      target_user_id: targetUserId,
      target_project_id: targetProjectId,
      details,
      ip_address: ipAddress,
      severity,
      timestamp: new Date(),
    });

    return await this.auditRepository.save(log);
  }

  async listLogs(limit: number = 100, offset: number = 0) {
    const [logs, total] = await this.auditRepository.findAndCount({
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['user'],
    });

    return { logs, total };
  }

  async getStats() {
    const total = await this.auditRepository.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await this.auditRepository.count({
      where: { timestamp: { $gte: today } as any },
    });

    return { total, today: todayCount };
  }
}
