import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
@Index(['email'])
@Index(['userType'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column({ default: 'ACTIVE' })
  status: string; // ACTIVE, INACTIVE, SUSPENDED, DELETED

  @Column({
    type: 'enum',
    enum: ['STUDENT', 'PROFESSOR', 'STAFF', 'ADMIN', 'FINANCE'],
    default: 'STUDENT',
  })
  userType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLogin: Date;

  // Virtual properties for response
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
