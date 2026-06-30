import { IsEmail, IsNotEmpty, MinLength, IsIn } from 'class-validator';

// Rôles LMD RDC
const USER_TYPES = [
  'DIRECTION',
  'FINANCE',
  'PROFESSOR',
  'STUDENT'
] as const;

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsIn(USER_TYPES)
  userType: string;

  phoneNumber?: string;
}
