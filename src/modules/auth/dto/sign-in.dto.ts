import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'example@email.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'examplepassword' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
