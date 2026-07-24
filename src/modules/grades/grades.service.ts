import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { Student } from '../students/entities/student.entity';
import { Course } from '../academics/entities/course.entity';
import { User } from '../users/entities/user.entity';
import { SaisirCotesDto } from './dto/saisir-cotes.dto';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findStudentGrades(studentIdOrMatricule: string, anneeAcademique?: string) {
    // 1. Find student
    const student = await this.studentRepository.findOne({
      where: [
        { id: studentIdOrMatricule },
        { matricule: studentIdOrMatricule }
      ]
    });
    if (!student) {
      throw new NotFoundException(`Étudiant non trouvé`);
    }

    // 2. Check financial status
    if (student.statutFinancier !== 'PAYE') {
      return {
        success: false,
        message: 'Accès refusé : Veuillez régulariser vos frais à la comptabilité',
        code: 'FINANCIAL_BLOCK'
      };
    }

    // 3. Find published grades for specified academic year
    const targetAnnee = anneeAcademique || student.anneeAcademique;
    const grades = await this.gradeRepository.find({
      where: { etudiantId: student.id, estPublie: true, anneeAcademique: targetAnnee },
      relations: ['course']
    });

    if (grades.length === 0) {
      return {
        success: false,
        message: 'Résultats non encore disponibles : Délibération en cours au niveau de la section',
        code: 'ADMINISTRATIVE_BLOCK'
      };
    }

    // Calculate deliberation metrics
    let average = 0;
    let decision = 'EN_COURS';
    let mentionDeliberation = 'Ajourné';
    
    if (grades.length > 0) {
      const sum = grades.reduce((acc, g) => acc + g.noteFinale, 0);
      average = sum / grades.length;
      if (average >= 10) {
        decision = 'RÉUSSI';
        if (average >= 16) mentionDeliberation = 'Grande Distinction';
        else if (average >= 14) mentionDeliberation = 'Distinction';
        else mentionDeliberation = 'Satisfaction';
      } else {
        decision = 'ÉCHOUÉ';
        mentionDeliberation = 'Ajourné';
      }
    }

    return {
      success: true,
      message: 'Accès autorisé',
      studentName: `${student.prenom} ${student.nom}`,
      matricule: student.matricule,
      mention: student.mention,
      niveau: student.niveau,
      anneeAcademique: targetAnnee,
      statutFinancier: student.statutFinancier,
      average: Math.round(average * 100) / 100,
      decision,
      mentionDeliberation,
      data: grades.map(g => ({
        id: g.id,
        studentId: g.etudiantId,
        courseId: g.coursId,
        courseName: g.nomCours,
        courseCode: g.course?.code || null,
        courseCredits: g.course?.credits || 5,
        tpGrade: g.noteTP,
        examGrade: g.noteExamen,
        finalGrade: g.noteFinale,
        mention: g.mention,
        session: g.session,
        status: 'PUBLISHED'
      }))
    };
  }

  async findCourseGrades(courseId: string, professorId?: string, anneeAcademique?: string, session?: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['enseignant']
    });
    if (!course) {
      throw new NotFoundException(`Cours non trouvé`);
    }

    if (professorId && course.enseignantId !== professorId) {
      throw new ForbiddenException(`Vous n'êtes pas autorisé à accéder aux notes de ce cours.`);
    }

    const targetAnnee = anneeAcademique || '2025-2026';
    const targetSession = session || 'Normale';

    const isPrep = course.niveau === 'L0 (Préparatoire)';
    
    // Find all students enrolled in this course's mention, level, and specific academic year
    const students = await this.studentRepository.find({
      where: isPrep
        ? [
            { mention: 'Tronc Commun', niveau: course.niveau, anneeAcademique: targetAnnee },
            { mention: 'N/A', niveau: course.niveau, anneeAcademique: targetAnnee }
          ]
        : { mention: course.mention, niveau: course.niveau, anneeAcademique: targetAnnee },
      order: { nom: 'ASC', prenom: 'ASC' }
    });

    if (targetSession === 'Rattrapage') {
      // For Rattrapage: fetch Normale session grades to determine pass/fail
      const normaleGrades = await this.gradeRepository.find({
        where: { coursId: course.id, anneeAcademique: targetAnnee, session: 'Normale' }
      });
      // Also fetch existing Rattrapage grades
      const rattrapageGrades = await this.gradeRepository.find({
        where: { coursId: course.id, anneeAcademique: targetAnnee, session: 'Rattrapage' }
      });

      return students.map(student => {
        const normaleGrade = normaleGrades.find(g => g.etudiantId === student.id);
        const rattrapageGrade = rattrapageGrades.find(g => g.etudiantId === student.id);
        const normaleFinale = normaleGrade?.noteFinale ?? 0;
        const passed = normaleFinale >= 10;

        if (passed) {
          // Student passed in Normale: show their Normale final grade, read-only
          return {
            id: normaleGrade?.id || null,
            studentId: student.id,
            studentName: `${student.prenom} ${student.nom}`,
            matricule: student.matricule,
            courseId: course.id,
            courseCode: course.code,
            courseName: course.nom,
            mention: student.mention,
            niveau: student.niveau,
            tpGrade: normaleGrade?.noteTP ?? 0,
            examGrade: normaleGrade?.noteExamen ?? 0,
            finalGrade: normaleFinale,
            notePresence: normaleGrade?.notePresence ?? 0,
            estSoumis: true,
            session: 'Rattrapage',
            passedNormale: true,
            status: 'PASSED'
          };
        } else {
          // Student failed in Normale: show rattrapage grades (exam only)
          return {
            id: rattrapageGrade?.id || null,
            studentId: student.id,
            studentName: `${student.prenom} ${student.nom}`,
            matricule: student.matricule,
            courseId: course.id,
            courseCode: course.code,
            courseName: course.nom,
            mention: student.mention,
            niveau: student.niveau,
            tpGrade: 0,
            examGrade: rattrapageGrade?.noteExamen ?? 0,
            finalGrade: rattrapageGrade?.noteFinale ?? 0,
            notePresence: 0,
            estSoumis: rattrapageGrade?.estSoumis ?? false,
            session: 'Rattrapage',
            passedNormale: false,
            status: rattrapageGrade ? (rattrapageGrade.estPublie ? 'PUBLISHED' : 'ENCODED') : 'NOT_ENCODED'
          };
        }
      });
    }

    // Normal session
    const grades = await this.gradeRepository.find({
      where: { coursId: course.id, anneeAcademique: targetAnnee, session: targetSession }
    });

    return students.map(student => {
      const grade = grades.find(g => g.etudiantId === student.id);
      return {
        id: grade?.id || null,
        studentId: student.id,
        studentName: `${student.prenom} ${student.nom}`,
        matricule: student.matricule,
        courseId: course.id,
        courseCode: course.code,
        courseName: course.nom,
        mention: student.mention,
        niveau: student.niveau,
        tpGrade: grade?.noteTP ?? 0,
        examGrade: grade?.noteExamen ?? 0,
        finalGrade: grade?.noteFinale ?? 0,
        notePresence: grade?.notePresence ?? 0,
        estSoumis: grade?.estSoumis ?? false,
        session: targetSession,
        passedNormale: false,
        status: grade ? (grade.estPublie ? 'PUBLISHED' : 'ENCODED') : 'NOT_ENCODED'
      };
    });
  }

  async saisirCotes(dto: SaisirCotesDto, professorId?: string) {
    const course = await this.courseRepository.findOne({ where: { id: dto.coursId } });
    if (!course) {
      throw new NotFoundException(`Cours non trouvé`);
    }

    if (professorId && course.enseignantId !== professorId) {
      throw new ForbiddenException(`Vous n'êtes pas autorisé à encoder les notes de ce cours.`);
    }

    for (const entry of dto.grades) {
      const student = await this.studentRepository.findOne({ where: { id: entry.etudiantId } });
      if (!student) {
        throw new NotFoundException(`Étudiant avec l'ID ${entry.etudiantId} non trouvé`);
      }

      let grade = await this.gradeRepository.findOne({
        where: { coursId: course.id, etudiantId: student.id, anneeAcademique: dto.anneeAcademique, session: dto.session }
      });
      let noteFinale = 0;
      if (entry.noteFinale !== undefined && entry.noteFinale !== null) {
        noteFinale = entry.noteFinale;
      } else if (dto.session === 'Rattrapage') {
        noteFinale = entry.noteExamen;
      } else {
        noteFinale = Math.round(((entry.noteTP + entry.noteExamen + (entry.notePresence || 0)) / 3) * 10) / 10;
      }
      let mention = 'EC';
      if (noteFinale >= 16) mention = 'TB';
      else if (noteFinale >= 14) mention = 'B';
      else if (noteFinale >= 12) mention = 'AB';
      else if (noteFinale >= 10) mention = 'P';

      if (grade) {
        grade.noteTP = entry.noteTP;
        grade.noteExamen = entry.noteExamen;
        grade.notePresence = entry.notePresence || 0;
        grade.noteFinale = noteFinale;
        grade.mention = mention;
        grade.estPublie = false; // Reset publication status on change
        grade.estSoumis = false; // Reset submission status on change
        if (professorId) grade.enseignantId = professorId;
      } else {
        grade = this.gradeRepository.create({
          coursId: course.id,
          nomCours: course.nom,
          etudiantId: student.id,
          enseignantId: professorId || course.enseignantId,
          noteTP: entry.noteTP,
          noteExamen: entry.noteExamen,
          notePresence: entry.notePresence || 0,
          noteFinale,
          mention,
          estPublie: false,
          estSoumis: false,
          session: dto.session,
          anneeAcademique: dto.anneeAcademique
        });
      }

      await this.gradeRepository.save(grade);
    }

    return { message: 'Cotes enregistrées avec succès' };
  }

  async soumettreCotes(coursId: string, anneeAcademique: string, session: string) {
    const grades = await this.gradeRepository.find({
      where: { coursId, anneeAcademique, session }
    });
    if (grades.length === 0) {
      throw new NotFoundException(`Aucune cote trouvée pour ce cours, cette année et cette session`);
    }
    for (const grade of grades) {
      grade.estSoumis = true;
      await this.gradeRepository.save(grade);
    }
    return { message: 'Cotes soumises pour validation avec succès' };
  }

  async publierCotes(mention: string, niveau: string, anneeAcademique: string, session: string) {
    const isPrep = niveau === 'L0 (Préparatoire)';
    
    // 1. Fetch students of this mention and niveau
    const students = await this.studentRepository.find({
      where: isPrep
        ? [
            { mention: 'Tronc Commun', niveau, anneeAcademique },
            { mention: 'N/A', niveau, anneeAcademique }
          ]
        : { mention, niveau, anneeAcademique }
    });

    if (students.length === 0) {
      return { message: 'Aucun étudiant trouvé pour cette mention, ce niveau et cette année académique' };
    }

    const studentIds = students.map(s => s.id);

    // 2. Publish all grades for these students in this session
    await this.gradeRepository.createQueryBuilder()
      .update(Grade)
      .set({ estPublie: true, estSoumis: true })
      .where('etudiantId IN (:...studentIds)', { studentIds })
      .andWhere('session = :session', { session })
      .execute();

    return { message: `Cotes de la mention ${mention} (${niveau}, ${anneeAcademique}, session ${session}) publiées avec succès` };
  }

  async getSuiviEncodage(mention?: string) {
    const where: any = {};
    if (mention) where.mention = mention;

    const courses = await this.courseRepository.find({
      where,
      relations: ['enseignant']
    });

    const students = await this.studentRepository.find({
      select: ['mention', 'niveau']
    });

    const studentCounts = new Map<string, number>();
    for (const student of students) {
      const key = `${student.mention}|${student.niveau}`;
      studentCounts.set(key, (studentCounts.get(key) || 0) + 1);
    }

    const gradesCounts = await this.gradeRepository
      .createQueryBuilder('grade')
      .select('grade.coursId', 'coursId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('grade.coursId')
      .getRawMany();

    const gradesCountMap = new Map<string, number>();
    for (const row of gradesCounts) {
      gradesCountMap.set(row.coursId, parseInt(row.count, 10));
    }

    const publishedCounts = await this.gradeRepository
      .createQueryBuilder('grade')
      .select('grade.coursId', 'coursId')
      .addSelect('COUNT(*)', 'count')
      .where('grade.estPublie = :estPublie', { estPublie: true })
      .groupBy('grade.coursId')
      .getRawMany();

    const publishedCountMap = new Map<string, number>();
    for (const row of publishedCounts) {
      publishedCountMap.set(row.coursId, parseInt(row.count, 10));
    }

    const results: any[] = [];
    for (const course of courses) {
      const key = `${course.mention}|${course.niveau}`;
      const isL0 = course.niveau === 'L0 (Préparatoire)';
      const studentsCount = isL0 
        ? ((studentCounts.get(`Tronc Commun|${course.niveau}`) || 0) + (studentCounts.get(`N/A|${course.niveau}`) || 0))
        : (studentCounts.get(key) || 0);
      const gradesCount = gradesCountMap.get(course.id) || 0;
      const publishedCount = publishedCountMap.get(course.id) || 0;

      results.push({
        courseId: course.id,
        courseCode: course.code,
        courseName: course.nom,
        mention: course.mention,
        niveau: course.niveau,
        professorName: course.enseignant ? `${course.enseignant.firstName} ${course.enseignant.lastName}` : 'Non assigné',
        studentsCount,
        gradedCount: gradesCount,
        publishedCount,
        progress: studentsCount > 0 ? Math.round((gradesCount / studentsCount) * 100) : 0
      });
    }

    return results;
  }

  async findStudentByUserId(userId: string) {
    const student = await this.studentRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!student) {
      throw new NotFoundException(`Etudiant non trouve pour l'utilisateur ${userId}`);
    }
    return student;
  }
}
