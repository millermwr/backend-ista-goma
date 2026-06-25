import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsString()
  mention: string;

  @IsNotEmpty()
  @IsString()
  niveau: string;

  @IsNotEmpty()
  @IsNumber()
  credits: number;

  @IsNotEmpty()
  @IsString()
  section: string;

  @IsOptional()
  @IsString()
  enseignantId?: string;
}
