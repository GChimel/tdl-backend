import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../shared/database/entities/project.entity';
import { Task } from '../../shared/database/entities/task.entity';
import { User } from '../../shared/database/entities/user.entity';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepository: jest.Mocked<Repository<Project>>;
  let taskRepository: jest.Mocked<Repository<Task>>;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            remove: jest.fn(),
          },
        },
        { provide: getRepositoryToken(Task), useValue: {} },
        {
          provide: getRepositoryToken(User),
          useValue: { findOneBy: jest.fn() },
        },
      ],
    }).compile();
    service = module.get(ProjectService);
    projectRepository = module.get(getRepositoryToken(Project));
    taskRepository = module.get(getRepositoryToken(Task));
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should throw if user not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);
      await expect(service.create({ name: 'p' }, 'uid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create and save project', async () => {
      const user = {
        id: 'uid',
        name: 'User',
        email: 'e',
        password: 'p',
        createdAt: new Date(),
        tasks: [],
        projects: [],
      };

      userRepository.findOneBy.mockResolvedValue(user as any);
      const project = {
        id: 'pid',
        name: 'p',
        description: '',
        createdAt: new Date(),
        user,
        tasks: [],
      };

      projectRepository.create.mockReturnValue(project);
      projectRepository.save.mockResolvedValue(project);
      const result = await service.create({ name: 'p' }, 'uid');
      expect(result).toEqual(project);
    });
  });

  describe('findAllByUserId', () => {
    it('should return projects', async () => {
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
        id: '1',
        name: 'p',
        description: '',
        createdAt: new Date(),
        user,
        tasks: [],
      };

      projectRepository.find.mockResolvedValue([project]);
      const result = await service.findAllByUserId('uid');
      expect(result).toEqual({ projects: [project] });
    });
  });

  describe('findById', () => {
    it('should throw if not found', async () => {
      projectRepository.findOne.mockResolvedValue(null);
      await expect(service.findById('uid', 'pid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return project', async () => {
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

      projectRepository.findOne.mockResolvedValue(project);
      const result = await service.findById('uid', 'pid');
      expect(result).toEqual(project);
    });
  });

  describe('update', () => {
    it('should throw if not found', async () => {
      projectRepository.findOne.mockResolvedValue(null);
      await expect(service.update('uid', 'pid', { name: 'n' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update and save project', async () => {
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

      projectRepository.findOne.mockResolvedValue(project);
      projectRepository.merge.mockReturnValue({ ...project, name: 'n' });
      projectRepository.save.mockResolvedValue({ ...project, name: 'n' });
      const result = await service.update('uid', 'pid', { name: 'n' });
      expect(result).toEqual({ ...project, name: 'n' });
    });
  });

  describe('remove', () => {
    it('should throw if not found', async () => {
      projectRepository.findOneBy.mockResolvedValue(null);
      await expect(service.remove('uid', 'pid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should remove project', async () => {
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
      projectRepository.findOneBy.mockResolvedValue(project);
      projectRepository.remove.mockResolvedValue(project);
      const result = await service.remove('uid', 'pid');
      expect(result).toBeNull();
    });
  });
});
