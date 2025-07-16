import { RabbitMQModule, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { env } from 'src/shared/config/env';

@Injectable()
class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  @RabbitSubscribe({
    queue: 'tasks_notifications',
  })
  public async handleTaskCreated(message: any) {
    this.logger.log(`Notificação recebida: ${JSON.stringify(message)}`);
  }
}

@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [],
      uri: `amqp://${env.rabbitmqHost}:${env.rabbitmqPort}`,
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [NotificationConsumer],
})
class NotificationWorkerModule {}

async function bootstrap() {
  await NestFactory.createApplicationContext(NotificationWorkerModule);
  Logger.log('Notification worker is listening for task_created events...');
}

bootstrap();
