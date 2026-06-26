import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  matricule: string;

  @Column()
  nom: string;

  @Column({ name: 'postnom', nullable: true })
  postnom: string;

  @Column()
  prenom: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  mention: string; // Informatique, Mécanique, Électricité

  @Column()
  section: string; // Sciences Appliquées, Sciences Informatiques

  @Column()
  niveau: string; // L1, L2, L3, M1, M2

  @Column()
  anneeAcademique: string;

  @Column({
    type: 'varchar',
    default: 'IMPAYE',
  })
  statutFinancier: string; // PAYE, IMPAYE, PARTIEL

  @Column({ nullable: true })
  motDePasseTemporaire: string;

  @OneToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
