import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { AuthGuard } from './modules/auth/auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { TaskModule } from './modules/task/task.module';
import { UsersModule } from './modules/users/users.module';
import { env } from './shared/config/env';
import { Task } from './shared/database/entities/task.entity';
import { User } from './shared/database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.databaseHost,
      port: parseInt(env.databasePort),
      username: env.databaseUser,
      password: env.databasePassword,
      database: env.databaseName,
      synchronize: true,
      entities: [User, Task],
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      url: `redis://${env.redisHost}:${env.redisPort}`,
    }),
    UsersModule,
    AuthModule,
    TaskModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
