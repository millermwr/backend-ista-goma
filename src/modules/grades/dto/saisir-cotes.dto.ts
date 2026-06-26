import { IsNotEmpty, IsString, IsArray, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GradeEntryDto {
  @IsNotEmpty()
  @IsString()
  etudiantId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(20)
  noteTP: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(20)
  noteExamen: number;

  @IsNumber()
  @Min(0)
  @Max(20)
  notePresence?: number;
}

export class SaisirCotesDto {
  @IsNotEmpty()
  @IsString()
  coursId: string;

  @IsNotEmpty()
  @IsString()
  session: string;

  @IsNotEmpty()
  @IsString()
  anneeAcademique: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeEntryDto)
  grades: GradeEntryDto[];
}
