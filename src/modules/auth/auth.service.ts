import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Student } from '../students/entities/student.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { FirstTimeSetupDto, ChangePasswordDto, VerifyFirstTimeDto } from './dto/setup-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
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

  async firstTimeSetup(firstTimeSetupDto: FirstTimeSetupDto) {
    const student = await this.studentRepository.findOne({
      where: { matricule: firstTimeSetupDto.matricule.toUpperCase() },
      relations: ['user'],
    });

    if (!student) {
      throw new BadRequestException('Matricule incorrect ou etudiant non trouve');
    }

    // Check if the provided email matches either the user account email or the student's personal email
    const providedEmail = firstTimeSetupDto.email.toLowerCase();
    const matchesUserEmail = student.user && student.user.email.toLowerCase() === providedEmail;
    const matchesStudentEmail = student.email && student.email.toLowerCase() === providedEmail;

    if (!student.user || (!matchesUserEmail && !matchesStudentEmail)) {
      throw new BadRequestException('Adresse email ne correspond pas au matricule fourni');
    }

    if (!student.user.isTempPassword) {
      throw new BadRequestException('Le mot de passe a deja ete configure pour cet etudiant');
    }

    const hashedPassword = await bcrypt.hash(firstTimeSetupDto.newPassword, 10);
    
    // Save personal email as user login email and save new password
    student.user.email = providedEmail;
    student.user.passwordHash = hashedPassword;
    student.user.isTempPassword = false;
    await this.usersRepository.save(student.user);

    // Automatically generate token and log the user in after setup
    const payload = {
      id: student.user.id,
      email: student.user.email,
      userType: student.user.userType,
    };

    return {
      message: 'Mot de passe configure avec succes',
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
      user: {
        id: student.user.id,
        email: student.user.email,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        userType: student.user.userType,
      },
    };
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { email: changePasswordDto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouve');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("L'ancien mot de passe est incorrect");
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.passwordHash = hashedPassword;
    await this.usersRepository.save(user);

    return { message: 'Mot de passe modifie avec succes' };
  }

  async verifyFirstTime(verifyFirstTimeDto: VerifyFirstTimeDto) {
    const student = await this.studentRepository.findOne({
      where: { matricule: verifyFirstTimeDto.matricule.toUpperCase() },
      relations: ['user'],
    });

    if (!student) {
      throw new BadRequestException('Matricule incorrect ou etudiant non trouve');
    }

    const providedEmail = verifyFirstTimeDto.email.toLowerCase();
    const matchesUserEmail = student.user && student.user.email.toLowerCase() === providedEmail;
    const matchesStudentEmail = student.email && student.email.toLowerCase() === providedEmail;

    if (!student.user || (!matchesUserEmail && !matchesStudentEmail)) {
      throw new BadRequestException('Adresse email ne correspond pas au matricule fourni');
    }

    if (!student.user.isTempPassword) {
      throw new BadRequestException('Cet etudiant a deja configure son mot de passe');
    }

    return { success: true, message: 'Informations validees' };
  }
}
