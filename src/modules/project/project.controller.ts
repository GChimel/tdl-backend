import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ActiveUserId } from 'src/shared/decorators/activeUserId';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    @ActiveUserId() userId: string,
  ) {
    return this.projectService.create(createProjectDto, userId);
  }

  @Get()
  findAll(@ActiveUserId() userId: string) {
    return this.projectService.findAllByUserId(userId);
  }

  @Patch(':projectId')
  update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @ActiveUserId() userId: string,
  ) {
    return this.projectService.update(userId, projectId, updateProjectDto);
  }

  @Delete(':projectId')
  remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @ActiveUserId() userId: string,
  ) {
    return this.projectService.remove(userId, projectId);
  }
}
