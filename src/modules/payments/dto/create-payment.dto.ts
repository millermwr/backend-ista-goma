import { IsNotEmpty, IsString, IsNumber, IsIn } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  etudiantId: string; // can be student UUID or matricule

  @IsNotEmpty()
  @IsNumber()
  montant: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['INSCRIPTION', 'TRANCHE_1', 'TRANCHE_2', 'SOLDE'])
  typePaiement: string;

  @IsNotEmpty()
  @IsString()
  reference: string;
}
