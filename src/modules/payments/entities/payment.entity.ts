import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  etudiantId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'etudiantId' })
  student: Student;

  @Column({ type: 'float' })
  montant: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  datePaiement: Date;

  @Column()
  typePaiement: string; // INSCRIPTION, TRANCHE_1, TRANCHE_2, SOLDE

  @Column({ default: 'PAYE' })
  statut: string; // PAYE, EN_ATTENTE, ANNULE

  @Column({ unique: true })
  reference: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
