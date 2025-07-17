import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Project } from 'src/shared/database/entities/project.entity';
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
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
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
    const { description, title, projectId } = createTaskDto;

    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let project: Project | null = null;

    if (projectId) {
      project = await this.projectRepository.findOne({
        where: { id: projectId, user: { id: userId } },
      });

      if (!project) throw new NotFoundException('Project not found');
    }

    const task = this.taskRepository.create({
      title,
      description,
      status: TaskStatus.PENDING,
      user,
      project: project ? project : undefined,
    });

    await this.taskRepository.save(task);

    // RabbitMQ
    await this.notificationService.notifyTaskCreated({
      id: task.id,
      title: task.title,
      description: task.description,
      userId: user.id,
      createdAt: task.createdAt,
    });

    // Invalidate cache
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
      relations: ['project'],
    });
    const tasksWithProjectId = tasks.map((task) => ({
      ...task,
      project: task.project ? { id: task.project.id } : undefined,
    }));
    await this.cacheManager.set(cacheKey, tasksWithProjectId, 60);
    return { tasks: tasksWithProjectId };
  }

  async findById(userId: string, taskId: string) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
        user: {
          id: userId,
        },
      },
      relations: ['project'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(userId: string, taskId: string, updateTaskDto: UpdateTaskDto) {
    const { projectId, ...rest } = updateTaskDto;

    const task = await this.taskRepository.findOne({
      where: { id: taskId, user: { id: userId } },
      relations: ['project'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (Object.prototype.hasOwnProperty.call(updateTaskDto, 'projectId')) {
      if (projectId === null) {
        task.project = null;
      } else if (projectId) {
        const project = await this.projectRepository.findOne({
          where: { id: projectId, user: { id: userId } },
        });

        if (!project) {
          throw new NotFoundException('Project not found or unauthorized');
        }

        task.project = project;
      }
    }

    Object.assign(task, rest);

    const result = await this.taskRepository.save(task);
    await this.cacheManager.del(this.getCacheKey(userId));
    return result;
  }

  async remove(userId: string, taskId: string) {
    const task = await this.taskRepository.findOneBy({
      id: taskId,
      user: {
        id: userId,
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
