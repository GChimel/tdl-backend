import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { env } from 'src/shared/config/env';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [],
      uri: `amqp://${env.rabbitmqHost}:${env.rabbitmqPort}`,
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
