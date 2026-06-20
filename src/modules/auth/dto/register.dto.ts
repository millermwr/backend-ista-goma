import { IsEmail, IsNotEmpty, MinLength, IsIn } from 'class-validator';

// Rôles LMD RDC
const USER_TYPES = [
  'admin',
  'direction',
  'scolarite',
  'inscription',
  'notes',
  'finance',
  'rh',
  'emploi_du_temps',
  'attestations',
  'professor',
  'student'
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
}
