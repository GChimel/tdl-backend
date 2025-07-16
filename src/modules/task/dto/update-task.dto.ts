import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from 'src/shared/database/entities/task.entity';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends CreateTaskDto {
  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
