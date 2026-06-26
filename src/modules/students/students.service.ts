import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Student } from './entities/student.entity';
import { User } from '../users/entities/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    // 1. Generate unique matricule
    const yearPart = createStudentDto.anneeAcademique.split('-')[0] || new Date().getFullYear().toString();
    let matricule = '';
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      const count = await this.studentRepository.count({
        where: { anneeAcademique: createStudentDto.anneeAcademique }
      });
      const sequence = String(count + 1 + attempts).padStart(4, '0');
      matricule = `ISTA-${yearPart}-${sequence}`;
      
      const existing = await this.studentRepository.findOne({ where: { matricule } });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new ConflictException("Impossible de générer un matricule unique");
    }

    // 2. Generate temporary password
    const tempPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 3. Create User
    const userEmail = `${matricule.toLowerCase()}@istagoma.ac.cd`;
    const user = this.userRepository.create({
      email: userEmail,
      firstName: createStudentDto.prenom,
      lastName: createStudentDto.nom,
      passwordHash: hashedPassword,
      userType: 'STUDENT',
      isTempPassword: true,
      status: 'ACTIVE',
    });
    const savedUser = await this.userRepository.save(user);

    // 4. Create Student
    const student = this.studentRepository.create({
      ...createStudentDto,
      matricule,
      statutFinancier: 'IMPAYE',
      motDePasseTemporaire: tempPassword,
      user: savedUser,
    });
    
    return this.studentRepository.save(student);
  }

  async findAll(mention?: string, niveau?: string, search?: string, anneeAcademique?: string) {
    const queryBuilder = this.studentRepository.createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user');

    if (mention) {
      queryBuilder.andWhere('student.mention = :mention', { mention });
    }

    if (niveau) {
      queryBuilder.andWhere('student.niveau = :niveau', { niveau });
    }

    if (anneeAcademique) {
      queryBuilder.andWhere('student.anneeAcademique = :anneeAcademique', { anneeAcademique });
    }

    if (search) {
      queryBuilder.andWhere(
        '(student.nom ILIKE :search OR student.prenom ILIKE :search OR student.matricule ILIKE :search OR student.postnom ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['user']
    });
    if (!student) {
      throw new NotFoundException(`Étudiant avec l'ID ${id} non trouvé`);
    }
    return student;
  }

  async findByMatricule(matricule: string) {
    const student = await this.studentRepository.findOne({
      where: { matricule },
      relations: ['user']
    });
    if (!student) {
      throw new NotFoundException(`Étudiant avec le matricule ${matricule} non trouvé`);
    }
    return student;
  }

  async update(id: string, updateDto: any) {
    const student = await this.findOne(id);
    
    // Update student fields
    Object.assign(student, updateDto);
    
    // If nom/prenom changed, also update linked User entity
    if (student.user) {
      if (updateDto.nom) student.user.lastName = updateDto.nom;
      if (updateDto.prenom) student.user.firstName = updateDto.prenom;
      await this.userRepository.save(student.user);
    }

    return this.studentRepository.save(student);
  }

  async remove(id: string) {
    const student = await this.findOne(id);
    // Delete student, cascade will delete user
    await this.studentRepository.remove(student);
    return { message: 'Étudiant supprimé avec succès' };
  }

  async getAcademicYears() {
    const results = await this.studentRepository
      .createQueryBuilder('student')
      .select('DISTINCT student.anneeAcademique', 'anneeAcademique')
      .getRawMany();
    
    const years = results.map(r => r.anneeAcademique).filter(Boolean);
    
    const defaults = ['2025-2026', '2026-2027'];
    defaults.forEach(d => {
      if (!years.includes(d)) {
        years.push(d);
      }
    });
    
    return years.sort();
  }
}
