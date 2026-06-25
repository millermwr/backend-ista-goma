import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'User email address or matricule' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ 
    description: 'User type',
    enum: ['STUDENT', 'PROFESSOR', 'STAFF', 'ADMIN', 'FINANCE'],
    default: 'STUDENT'
  })
  @IsOptional()
  @IsEnum(['STUDENT', 'PROFESSOR', 'STAFF', 'ADMIN', 'FINANCE'])
  userType?: string;
}
