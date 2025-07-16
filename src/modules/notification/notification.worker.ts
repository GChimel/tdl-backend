import { RabbitMQModule, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

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
      uri: 'amqp://localhost:5672',
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
