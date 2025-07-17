import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../shared/database/entities/project.entity';
import { Task, TaskStatus } from '../../shared/database/entities/task.entity';
import { User } from '../../shared/database/entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: jest.Mocked<Repository<Task>>;
  let projectRepository: jest.Mocked<Repository<Project>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let notificationService: NotificationService;
  let cacheManager: any;

  beforeEach(async () => {
    notificationService = { notifyTaskCreated: jest.fn() } as any;
    cacheManager = { del: jest.fn(), get: jest.fn(), set: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Project),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(User),
          useValue: { findOneBy: jest.fn(), findOne: jest.fn() },
        },
        { provide: NotificationService, useValue: notificationService },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get(TaskService);

    taskRepository = module.get(getRepositoryToken(Task));
    projectRepository = module.get(getRepositoryToken(Project));
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should throw if user not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);
      await expect(
        service.create({ title: 't', description: 'd' }, 'uid'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if projectId is given and not found', async () => {
      const user = {
        id: 'uid',
        name: 'User',
        email: 'e',
        password: 'p',
        createdAt: new Date(),
        tasks: [],
        projects: [],
      };
      userRepository.findOneBy.mockResolvedValue(user);
      projectRepository.findOne.mockResolvedValue(null);
      await expect(
        service.create(
          { title: 't', description: 'd', projectId: 'pid' },
          'uid',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create and save task', async () => {
      const user = {
        id: 'uid',
        name: 'User',
        email: 'e',
        password: 'p',
        createdAt: new Date(),
        tasks: [],
        projects: [],
      };

      const project = {
        id: 'pid',
        name: 'p',
        description: '',
        createdAt: new Date(),
        user,
        tasks: [],
      };

      userRepository.findOneBy.mockResolvedValue(user);
      projectRepository.findOne.mockResolvedValue(project);

      const task = {
        id: 'tid',
        title: 't',
        description: 'd',
        user,
        project,
        status: TaskStatus.PENDING,
        createdAt: new Date(),
      };

      taskRepository.create.mockReturnValue(task);
      taskRepository.save.mockResolvedValue(task);

      await service.create(
        { title: 't', description: 'd', projectId: 'pid' },
        'uid',
      );

      expect(notificationService.notifyTaskCreated).toHaveBeenCalled();
      expect(cacheManager.del).toHaveBeenCalled();
    });
  });

  describe('findAllByUserId', () => {
    it('should return cached tasks if present', async () => {
      cacheManager.get.mockResolvedValue([{ id: 'tid' }]);
      const result = await service.findAllByUserId('uid');
      expect(result).toEqual({ tasks: [{ id: 'tid' }] });
    });
  });

  describe('findById', () => {
    it('should throw if not found', async () => {
      taskRepository.findOne.mockResolvedValue(null);
      await expect(service.findById('uid', 'tid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return task', async () => {
      const user = {
        id: 'uid',
        name: 'User',
        email: 'e',
        password: 'p',
        createdAt: new Date(),
        tasks: [],
        projects: [],
      };
      const project = {
        id: 'pid',
        name: 'p',
        description: '',
        createdAt: new Date(),
        user,
        tasks: [],
      };
      const task = {
        id: 'tid',
        title: 't',
        description: 'd',
        user,
        project,
        status: TaskStatus.PENDING,
        createdAt: new Date(),
      };
      taskRepository.findOne.mockResolvedValue(task);
      const result = await service.findById('uid', 'tid');
      expect(result).toEqual(task);
    });
  });

  describe('update', () => {
    it('should throw if not found', async () => {
      taskRepository.findOne.mockResolvedValue(null);
      await expect(
        service.update('uid', 'tid', {
          title: 'n',
          status: TaskStatus.PENDING,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update and save task', async () => {
      const user = {
        id: 'uid',
        name: 'User',
        email: 'e',
        password: 'p',
        createdAt: new Date(),
        tasks: [],
        projects: [],
      };

      const project = {
        id: 'pid',
        name: 'p',
        description: '',
        createdAt: new Date(),
        user,
        tasks: [],
      };

      const task = {
        id: 'tid',
        title: 't',
        description: 'd',
        user,
        project,
        status: TaskStatus.PENDING,
        createdAt: new Date(),
      };

      taskRepository.findOne.mockResolvedValue(task);
      projectRepository.findOne.mockResolvedValue(project);
      taskRepository.save.mockResolvedValue({ ...task, title: 'n' });

      const result = await service.update('uid', 'tid', {
        title: 'n',
        projectId: 'pid',
        status: TaskStatus.PENDING,
      });

      expect(result).toEqual({ ...task, title: 'n' });
      expect(cacheManager.del).toHaveBeenCalled();
    });
  });
});
