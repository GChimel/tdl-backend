import { plainToClass } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  validateSync,
} from 'class-validator';
import { config } from 'dotenv';

config();

class Env {
  @IsString()
  @IsNotEmpty()
  jwtSecret: string;

  @IsString()
  @IsNotEmpty()
  databaseHost: string;

  @IsNumberString()
  @IsNotEmpty()
  databasePort: string;

  @IsString()
  @IsNotEmpty()
  databaseUser: string;

  @IsString()
  @IsNotEmpty()
  databasePassword: string;

  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @IsString()
  @IsNotEmpty()
  redisHost: string;

  @IsNumberString()
  @IsNotEmpty()
  redisPort: string;

  @IsString()
  @IsNotEmpty()
  rabbitmqHost: string;

  @IsNumberString()
  @IsNotEmpty()
  rabbitmqPort: string;

  @IsNumberString()
  @IsNotEmpty()
  port: string;
}

export const env: Env = plainToClass(Env, {
  jwtSecret: process.env.JWT_SECRET,
  databaseHost: process.env.DATABASE_HOST,
  databasePort: process.env.DATABASE_PORT,
  databaseUser: process.env.DATABASE_USER,
  databasePassword: process.env.DATABASE_PASSWORD,
  databaseName: process.env.DATABASE_NAME,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  rabbitmqHost: process.env.RABBITMQ_HOST,
  rabbitmqPort: process.env.RABBITMQ_PORT,
  port: process.env.PORT,
});

const erros = validateSync(env);

if (erros.length > 0) {
  throw new Error(JSON.stringify(erros, null, 2));
}
