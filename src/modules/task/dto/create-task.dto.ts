import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Buy bread' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Go to the bakery and buy french bread.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  projectId?: string | null;
}
