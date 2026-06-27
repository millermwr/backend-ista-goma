import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

export class VerifyFirstTimeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  matricule: string;
}

export class FirstTimeSetupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  matricule: string;

  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class ChangePasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
