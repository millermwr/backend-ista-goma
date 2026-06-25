import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { User } from '../users/entities/user.entity';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class AcademicsService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    const course = this.courseRepository.create(createCourseDto);
    if (createCourseDto.enseignantId) {
      const professor = await this.userRepository.findOne({
        where: { id: createCourseDto.enseignantId, userType: 'PROFESSOR' }
      });
      if (!professor) {
        throw new NotFoundException(`Professeur avec l'ID ${createCourseDto.enseignantId} non trouvé`);
      }
      course.enseignant = professor;
    }
    return this.courseRepository.save(course);
  }

  async findAll(mention?: string, niveau?: string, section?: string) {
    const where: any = {};
    if (mention) where.mention = mention;
    if (niveau) where.niveau = niveau;
    if (section) where.section = section;

    return this.courseRepository.find({
      where,
      relations: ['enseignant'],
      order: { code: 'ASC' }
    });
  }

  async findOne(id: string) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['enseignant']
    });
    if (!course) {
      throw new NotFoundException(`Cours avec l'ID ${id} non trouvé`);
    }
    return course;
  }

  async findMesCours(professorId: string) {
    return this.courseRepository.find({
      where: { enseignantId: professorId },
      order: { code: 'ASC' }
    });
  }

  async assignProfessor(courseId: string, professorId: string | null) {
    const course = await this.findOne(courseId);
    
    if (!professorId) {
      course.enseignant = null;
      course.enseignantId = null;
    } else {
      const professor = await this.userRepository.findOne({
        where: { id: professorId, userType: 'PROFESSOR' }
      });
      if (!professor) {
        throw new NotFoundException(`Professeur avec l'ID ${professorId} non trouvé`);
      }
      course.enseignant = professor;
      course.enseignantId = professorId;
    }

    return this.courseRepository.save(course);
  }

  async findProfessors() {
    return this.userRepository.find({
      where: { userType: 'PROFESSOR', status: 'ACTIVE' },
      select: ['id', 'email', 'firstName', 'lastName'],
      order: { lastName: 'ASC', firstName: 'ASC' }
    });
  }

  async remove(id: string) {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
    return { message: 'Cours supprimé avec succès' };
  }
}
