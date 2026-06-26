import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  postnom?: string;

  @IsNotEmpty()
  @IsString()
  prenom: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNotEmpty()
  @IsString()
  mention: string; // Informatique, Mécanique, Électricité

  @IsNotEmpty()
  @IsString()
  section: string; // Sciences Appliquées, Sciences Informatiques

  @IsNotEmpty()
  @IsString()
  niveau: string; // L1, L2, L3, M1, M2

  @IsNotEmpty()
  @IsString()
  anneeAcademique: string;
}
