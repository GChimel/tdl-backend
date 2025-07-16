import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async notifyTaskCreated(task: any) {
    await this.amqpConnection.publish('', 'tasks_notifications', task);
  }
}
