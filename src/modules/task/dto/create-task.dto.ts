import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Buy bread' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Go to the bakery and buy french bread.' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
