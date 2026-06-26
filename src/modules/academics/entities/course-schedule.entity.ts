import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.entity';

@Entity('course_schedules')
export class CourseSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  coursId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coursId' })
  course: Course;

  @Column()
  anneeAcademique: string;

  @Column()
  semaineDebut: string; // ex: "2026-06-22" (date du lundi de la semaine)

  @Column()
  semaineFin: string; // ex: "2026-06-28" (date du dimanche de la semaine)

  @Column()
  dateCours: string; // ex: "2026-06-25" (date exacte du cours)

  @Column()
  heureDebut: string; // ex: "08:30"

  @Column()
  heureFin: string; // ex: "11:00"

  @Column()
  salle: string; // ex: "Salle 5"

  @Column()
  mention: string; // ex: "Informatique"

  @Column()
  niveau: string; // ex: "L1"

  @Column({ default: false })
  estPublie: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
