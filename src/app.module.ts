import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './shared/database/entities/task.entity';
import { User } from './shared/database/entities/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'root',
      database: 'todo',
      synchronize: true,
      entities: [User, Task],
    }),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
