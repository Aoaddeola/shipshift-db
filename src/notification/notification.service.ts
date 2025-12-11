import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Notification, NotificationType } from './notification.types.js';
import { randomUUID } from 'node:crypto';
import { NotificationCreateDto } from './notification-create.dto.js';
import { NotificationUpdateDto } from './notification-update.dto.js';
import { UserService } from '../users/user/user.service.js';
import { Database } from '../db/orbitdb/database.js';
import { InjectDatabase } from '../db/orbitdb/inject-database.decorator.js';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectDatabase('notification') private database: Database<Notification>,
    @Inject(UserService) private userService: UserService,
  ) {}

  async createNotification(
    notification: Omit<
      Notification,
      'id' | 'createdAt' | 'updatedAt' | 'user' | 'timestamp'
    >,
  ): Promise<Notification> {
    const id = randomUUID();
    const now = new Date().toISOString();

    // Generate proper timestamp based on human-readable time
    const timestamp = this.generateTimestamp(notification.time);

    this.logger.log(`Creating notification: ${id}`);
    const newNotification: Notification = {
      id,
      createdAt: now,
      updatedAt: now,
      timestamp,
      ...notification,
    };

    await this.database.put(newNotification);
    return newNotification;
  }

  private generateTimestamp(humanTime: string): string {
    // Parse human-readable time and convert to ISO timestamp
    const now = new Date();
    const timeMatch = humanTime.match(
      /(\d+)\s*(min|hour|day|week|month|year)s?/i,
    );

    if (timeMatch) {
      const value = parseInt(timeMatch[1]);
      const unit = timeMatch[2].toLowerCase();

      switch (unit) {
        case 'min':
          now.setMinutes(now.getMinutes() - value);
          break;
        case 'hour':
          now.setHours(now.getHours() - value);
          break;
        case 'day':
          now.setDate(now.getDate() - value);
          break;
        case 'week':
          now.setDate(now.getDate() - value * 7);
          break;
        case 'month':
          now.setMonth(now.getMonth() - value);
          break;
        case 'year':
          now.setFullYear(now.getFullYear() - value);
          break;
      }
    }

    return now.toISOString();
  }

  async getNotification(id: string, include?: string[]): Promise<Notification> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Notification not found');
    }

    return this.populateRelations(entry, include);
  }

  async getNotifications(include?: string[]): Promise<Notification[]> {
    const all = await this.database.all();
    return Promise.all(
      all.map((notification) => this.populateRelations(notification, include)),
    );
  }

  async getNotificationsByUser(
    userId: string,
    include?: string[],
  ): Promise<Notification[]> {
    const all = await this.database.all();
    const notifications = all.filter(
      (notification) => notification.userId === userId,
    );

    return Promise.all(
      notifications.map((notification) =>
        this.populateRelations(notification, include),
      ),
    );
  }

  async getNotificationsByType(
    type: NotificationType,
    include?: string[],
  ): Promise<Notification[]> {
    const all = await this.database.all();
    const notifications = all.filter(
      (notification) => notification.type === type,
    );

    return Promise.all(
      notifications.map((notification) =>
        this.populateRelations(notification, include),
      ),
    );
  }

  async getNotificationsByRead(
    read: boolean,
    include?: string[],
  ): Promise<Notification[]> {
    const all = await this.database.all();
    const notifications = all.filter(
      (notification) => notification.read === read,
    );

    return Promise.all(
      notifications.map((notification) =>
        this.populateRelations(notification, include),
      ),
    );
  }

  async getNotificationsByUserAndType(
    userId: string,
    type: NotificationType,
    include?: string[],
  ): Promise<Notification[]> {
    const all = await this.database.all();
    const notifications = all.filter(
      (notification) =>
        notification.userId === userId && notification.type === type,
    );

    return Promise.all(
      notifications.map((notification) =>
        this.populateRelations(notification, include),
      ),
    );
  }

  async getNotificationsByUserAndRead(
    userId: string,
    read: boolean,
    include?: string[],
  ): Promise<Notification[]> {
    const all = await this.database.all();
    const notifications = all.filter(
      (notification) =>
        notification.userId === userId && notification.read === read,
    );

    return Promise.all(
      notifications.map((notification) =>
        this.populateRelations(notification, include),
      ),
    );
  }

  async getNotificationsByTypeAndRead(
    type: NotificationType,
    read: boolean,
    include?: string[],
  ): Promise<Notification[]> {
    const all = await this.database.all();
    const notifications = all.filter(
      (notification) =>
        notification.type === type && notification.read === read,
    );

    return Promise.all(
      notifications.map((notification) =>
        this.populateRelations(notification, include),
      ),
    );
  }

  async getNotificationsByUserTypeAndRead(
    userId: string,
    type: NotificationType,
    read: boolean,
    include?: string[],
  ): Promise<Notification[]> {
    const all = await this.database.all();
    const notifications = all.filter(
      (notification) =>
        notification.userId === userId &&
        notification.type === type &&
        notification.read === read,
    );

    return Promise.all(
      notifications.map((notification) =>
        this.populateRelations(notification, include),
      ),
    );
  }

  private async populateRelations(
    notification: Notification,
    include?: string[],
  ): Promise<Notification> {
    // Clone the notification to avoid modifying the original
    const populatedNotification = { ...notification };

    // Handle user population
    if (include?.includes('user') && notification.userId) {
      try {
        const user = await this.userService.findById(notification.userId);
        if (user) {
          populatedNotification.user = user;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch user for ${notification.userId}`,
          error,
        );
      }
    }

    return populatedNotification;
  }

  async updateNotification(
    id: string,
    notification: NotificationCreateDto,
  ): Promise<Notification> {
    // First check if notification exists
    await this.getNotification(id);

    const now = new Date().toISOString();
    const timestamp = this.generateTimestamp(notification.time);

    // Create updated notification with ID preserved
    const updatedNotification: Notification = {
      id,
      createdAt: now,
      updatedAt: now,
      timestamp,
      ...notification,
    };

    this.logger.log(`Updating notification: ${id}`);
    await this.database.put(updatedNotification);
    return updatedNotification;
  }

  async partialUpdateNotification(
    id: string,
    update: NotificationUpdateDto,
  ): Promise<Notification> {
    const existingNotification = await this.getNotification(id);
    const now = new Date().toISOString();

    // Handle timestamp generation if time field is updated
    let timestamp = existingNotification.timestamp;
    if (update.time) {
      timestamp = this.generateTimestamp(update.time);
    }

    // Create updated notification by merging existing with update
    const updatedNotification = {
      ...existingNotification,
      ...update,
      timestamp,
      updatedAt: now,
    };

    this.logger.log(`Partially updating notification: ${id}`);
    await this.database.put(updatedNotification);
    return updatedNotification;
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    const notification = await this.getNotification(id);
    await this.database.del(id);
    return {
      message: `Notification "${notification.title}" deleted successfully`,
    };
  }

  async markAllAsReadForUser(
    userId: string,
  ): Promise<{ message: string; count: number }> {
    const all = await this.database.all();
    const userNotifications = all.filter((n) => n.userId === userId && !n.read);

    const now = new Date().toISOString();
    for (const notification of userNotifications) {
      await this.database.put({
        ...notification,
        read: true,
        updatedAt: now,
      });
    }

    return {
      message: `Marked ${userNotifications.length} notifications as read for user ${userId}`,
      count: userNotifications.length,
    };
  }

  async markAllAsRead(): Promise<{ message: string; count: number }> {
    const all = await this.database.all();
    const unreadNotifications = all.filter((n) => !n.read);

    const now = new Date().toISOString();
    for (const notification of unreadNotifications) {
      await this.database.put({
        ...notification,
        read: true,
        updatedAt: now,
      });
    }

    return {
      message: `Marked ${unreadNotifications.length} notifications as read`,
      count: unreadNotifications.length,
    };
  }
}
