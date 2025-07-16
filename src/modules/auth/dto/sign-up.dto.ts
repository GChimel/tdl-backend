import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'Name Example' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'example@email.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'examplepassword' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
