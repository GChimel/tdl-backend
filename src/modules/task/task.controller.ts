import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ActiveUserId } from 'src/shared/decorators/activeUserId';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @ActiveUserId() userId: string) {
    return this.taskService.create(createTaskDto, userId);
  }

  @Get()
  findAll(@ActiveUserId() userId: string) {
    return this.taskService.findAllByUserId(userId);
  }

  @Patch(':taskId')
  update(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @ActiveUserId() userId: string,
  ) {
    return this.taskService.update(userId, taskId, updateTaskDto);
  }

  @Delete(':taskId')
  @HttpCode(204)
  remove(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @ActiveUserId() userId: string,
  ) {
    return this.taskService.remove(userId, taskId);
  }
}
