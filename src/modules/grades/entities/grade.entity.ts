import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../academics/entities/course.entity';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  etudiantId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'etudiantId' })
  student: Student;

  @Column({ nullable: true })
  enseignantId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'enseignantId' })
  enseignant: User | null;

  @Column()
  coursId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coursId' })
  course: Course;

  @Column()
  nomCours: string;

  @Column({ type: 'float', default: 0 })
  noteTP: number;

  @Column({ type: 'float', default: 0 })
  noteExamen: number;

  @Column({ type: 'float', default: 0 })
  noteFinale: number;

  @Column({ type: 'float', default: 0 })
  notePresence: number;

  @Column({ default: false })
  estSoumis: boolean;

  @Column({ nullable: true })
  mention: string; // TB, B, AB, P, EC

  @Column({ default: false })
  estPublie: boolean;

  @Column()
  session: string;

  @Column({ default: '2025-2026' })
  anneeAcademique: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
