import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/shared/database/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findById(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['name', 'email', 'createdAt'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
