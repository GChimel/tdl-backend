import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/shared/database/database.module';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
