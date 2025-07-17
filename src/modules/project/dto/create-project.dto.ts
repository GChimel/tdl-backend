import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Work project' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Write back-end tests' })
  @IsString()
  @IsOptional()
  description?: string;
}
