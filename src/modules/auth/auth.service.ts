import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      passwordHash: hashedPassword,
      userType: registerDto.userType || 'STUDENT',
      status: 'ACTIVE',
    });

    const savedUser = await this.usersRepository.save(user);
    return {
      message: 'User registered successfully',
      userId: savedUser.id,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      id: user.id,
      email: user.email,
      userType: user.userType,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
      },
    };
  }

  async refresh(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      id: user.id,
      email: user.email,
      userType: user.userType,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string) {
    return this.usersRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phoneNumber',
        'userType',
        'status',
      ],
    });
  }

  async validateUser(id: string) {
    return this.usersRepository.findOne({
      where: { id },
    });
  }
}
