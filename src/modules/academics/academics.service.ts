import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { User } from '../users/entities/user.entity';
import { CourseSchedule } from './entities/course-schedule.entity';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class AcademicsService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CourseSchedule)
    private readonly scheduleRepository: Repository<CourseSchedule>,
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

  async createSchedule(dto: any) {
    const course = await this.findOne(dto.coursId);
    const schedule = this.scheduleRepository.create({
      coursId: dto.coursId,
      course,
      anneeAcademique: dto.anneeAcademique,
      semaineDebut: dto.semaineDebut,
      semaineFin: dto.semaineFin,
      dateCours: dto.dateCours,
      heureDebut: dto.heureDebut,
      heureFin: dto.heureFin,
      salle: dto.salle,
      mention: dto.mention,
      niveau: dto.niveau,
    });
    return this.scheduleRepository.save(schedule);
  }

  async findSchedules(annee?: string, semaineDebut?: string, mention?: string, niveau?: string) {
    const where: any = {};
    if (annee) where.anneeAcademique = annee;
    if (semaineDebut) where.semaineDebut = semaineDebut;
    if (mention) where.mention = mention;
    if (niveau) where.niveau = niveau;

    return this.scheduleRepository.find({
      where,
      relations: ['course', 'course.enseignant'],
      order: { dateCours: 'ASC', heureDebut: 'ASC' }
    });
  }

  async deleteSchedule(id: string) {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException(`Horaire avec l'ID ${id} non trouvé`);
    }
    await this.scheduleRepository.remove(schedule);
    return { message: 'Horaire supprimé avec succès' };
  }
}
