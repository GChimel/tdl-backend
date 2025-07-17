import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty({ example: 'Running Project' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Running plan' })
  @IsString()
  @IsOptional()
  description?: string;
}
