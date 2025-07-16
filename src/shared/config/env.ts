import { plainToClass } from 'class-transformer';
import { IsNotEmpty, IsString, validateSync } from 'class-validator';
import { config } from 'dotenv';

config();

class Env {
  @IsString()
  @IsNotEmpty()
  jwtSecret: string;
}

export const env: Env = plainToClass(Env, {
  jwtSecret: process.env.JWT_SECRET,
});

const erros = validateSync(env);

if (erros.length > 0) {
  throw new Error(JSON.stringify(erros, null, 2));
}
