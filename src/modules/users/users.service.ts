import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { User } from 'src/shared/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, name, password } = createUserDto;

    // Verify if email is already taken
    const emailTaken = await this.userRepository.findOne({ where: { email } });

    if (emailTaken) {
      throw new ConflictException('This email is already in use');
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    const user = this.userRepository.create({
      email,
      name,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }
}
