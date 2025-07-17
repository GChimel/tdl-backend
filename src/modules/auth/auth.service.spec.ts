import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../../shared/database/entities/user.entity';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  describe('signIn', () => {
    it('should return accessToken on valid credentials', async () => {
      const dto: SignInDto = { email: 'test@mail.com', password: 'pass' };
      const user = {
        id: '1',
        email: dto.email,
        password: 'hashed',
        name: 'Test',
        createdAt: new Date(),
        tasks: [],
        projects: [],
      } as User;
      userRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('token');

      const result = await service.signIn(dto);
      expect(result).toEqual({ accessToken: 'token' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(
        service.signIn({ email: 'x', password: 'y' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const user = {
        id: '1',
        email: 'a',
        password: 'hashed',
        name: 'Test',
        createdAt: new Date(),
        tasks: [],
        projects: [],
      } as User;
      userRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      await expect(
        service.signIn({ email: 'a', password: 'b' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signUp', () => {
    it('should create user and return accessToken', async () => {
      const dto: SignUpDto = {
        email: 'a@mail.com',
        name: 'A',
        password: '123456',
      };
      userRepository.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);
      userRepository.create.mockReturnValue({
        ...dto,
        password: 'hashed',
        id: '1',
        createdAt: new Date(),
        tasks: [],
        projects: [],
      });
      userRepository.save.mockResolvedValue({
        ...dto,
        password: 'hashed',
        id: '1',
        createdAt: new Date(),
        tasks: [],
        projects: [],
      });
      (jwtService.signAsync as jest.Mock).mockResolvedValue('token');

      const result = await service.signUp(dto);
      expect(result).toEqual({ accessToken: 'token' });
    });

    it('should throw ConflictException if email is taken', async () => {
      userRepository.findOne.mockResolvedValue({
        id: '1',
        email: 'a',
        password: 'hashed',
        name: 'Test',
        createdAt: new Date(),
        tasks: [],
        projects: [],
      } as User);
      await expect(
        service.signUp({ email: 'a', name: 'b', password: 'cdefgh' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
