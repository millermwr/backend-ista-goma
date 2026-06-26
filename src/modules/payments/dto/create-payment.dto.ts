import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  etudiantId: string; // can be student UUID or matricule

  @IsNotEmpty()
  @IsNumber()
  montant: number;

  @IsNotEmpty()
  @IsString()
  typePaiement: string;

  @IsOptional()
  @IsString()
  reference?: string;
}
