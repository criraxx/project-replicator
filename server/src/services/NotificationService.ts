import { AppDataSource } from '../config/database';
import { Notification } from '../entities/Notification';

export class NotificationService {
  private notificationRepository = AppDataSource.getRepository(Notification);

  async createNotification(
    userId: number,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    category?: string,
    relatedProjectId?: number
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user_id: userId,
      title,
      message,
      notification_type: type,
      category,
      related_project_id: relatedProjectId,
    });

    return await this.notificationRepository.save(notification);
  }

  async listNotifications(userId: number, limit: number = 50, offset: number = 0) {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { notifications, total };
  }

  async markAsRead(notificationId: number): Promise<void> {
    await this.notificationRepository.update(notificationId, { is_read: true });
  }

  async broadcastNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): Promise<void> {
    // Send to all users (could be improved with WebSocket)
    const users = await AppDataSource.getRepository('User').find();
    for (const user of users) {
      await this.createNotification(user.id, title, message, type);
    }
  }
}
