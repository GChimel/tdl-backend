import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/shared/database/entities/project.entity';
import { Task } from 'src/shared/database/entities/task.entity';
import { User } from 'src/shared/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new NotFoundException('User not found');

    const project = this.projectRepository.create({
      ...createProjectDto,
      user,
    });

    return this.projectRepository.save(project);
  }

  async findAllByUserId(userId: string) {
    const projects = await this.projectRepository.findBy({
      user: {
        id: userId,
      },
    });

    return { projects };
  }

  async update(
    userId: string,
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ) {
    const project = await this.projectRepository.findOne({
      where: {
        id: projectId,
        user: {
          id: userId,
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updatedProject = this.projectRepository.merge(
      project,
      updateProjectDto,
    );
    const result = await this.projectRepository.save(updatedProject);

    return result;
  }

  async remove(userId: string, projectId: string) {
    const project = await this.projectRepository.findOneBy({
      id: projectId,
      user: {
        id: userId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.projectRepository.remove(project);
    return null;
  }
}
