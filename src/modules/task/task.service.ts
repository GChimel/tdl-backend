import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Task, TaskStatus } from 'src/shared/database/entities/task.entity';
import { User } from 'src/shared/database/entities/user.entity';
import { Repository } from 'typeorm';
import { NotificationService } from '../notification/notification.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private getCacheKey(userId: string) {
    return `tasks:${userId}`;
  }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const { description, title } = createTaskDto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const task = this.taskRepository.create({
      title,
      description,
      status: TaskStatus.PENDING,
      user,
    });

    await this.taskRepository.save(task);

    // Notificar via RabbitMQ
    await this.notificationService.notifyTaskCreated({
      id: task.id,
      title: task.title,
      description: task.description,
      userId: user.id,
      createdAt: task.createdAt,
    });

    // Invalida cache
    await this.cacheManager.del(this.getCacheKey(userId));

    return;
  }

  async findAllByUserId(userId: string) {
    const cacheKey = this.getCacheKey(userId);
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return { tasks: cached };
    }
    const tasks = await this.taskRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
    await this.cacheManager.set(cacheKey, tasks, 60); // 60 segundos
    return { tasks };
  }

  async update(userId: string, taskId: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
        user: {
          id: userId,
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const updatedTask = this.taskRepository.merge(task, updateTaskDto);
    const result = await this.taskRepository.save(updatedTask);
    await this.cacheManager.del(this.getCacheKey(userId));
    return result;
  }

  async remove(userId: string, taskId: string) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
        user: {
          id: userId,
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.taskRepository.remove(task);
    await this.cacheManager.del(this.getCacheKey(userId));
    return null;
  }
}
