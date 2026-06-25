import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Student } from '../../modules/students/entities/student.entity';
import { Course } from '../../modules/academics/entities/course.entity';
import * as bcrypt from 'bcrypt';

export async function seedInitialData(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const studentRepository = dataSource.getRepository(Student);
  const courseRepository = dataSource.getRepository(Course);

  const userCount = await userRepository.count();
  if (userCount > 0) {
    console.log('🌱 Data already seeded. Skipping initial seeding.');
    return;
  }

  console.log('🌱 Starting initial database seeding...');

  // 1. Create Direction
  const directionPass = await bcrypt.hash('direction123', 10);
  const direction = userRepository.create({
    email: 'direction@istagoma.ac.cd',
    firstName: 'Directeur',
    lastName: 'Académique',
    passwordHash: directionPass,
    userType: 'DIRECTION',
    status: 'ACTIVE',
  });
  await userRepository.save(direction);

  // 2. Create Finance
  const financePass = await bcrypt.hash('finance123', 10);
  const finance = userRepository.create({
    email: 'finance2@istagoma.ac.cd',
    firstName: 'Chef',
    lastName: 'Finances',
    passwordHash: financePass,
    userType: 'FINANCE',
    status: 'ACTIVE',
  });
  await userRepository.save(finance);

  // 3. Create Professor
  const profPass = await bcrypt.hash('prof123', 10);
  const professor = userRepository.create({
    email: 'prof.mutombo@istagoma.ac.cd',
    firstName: 'Mutombo',
    lastName: 'Jean',
    passwordHash: profPass,
    userType: 'PROFESSOR',
    status: 'ACTIVE',
  });
  const savedProf = await userRepository.save(professor);

  // 4. Create Student User & Student entity
  const studentPass = await bcrypt.hash('etudiant123', 10);
  const studentUser = userRepository.create({
    email: 'ista-2026-0001@istagoma.ac.cd', // matricule as email
    firstName: 'Kabongo',
    lastName: 'Etudiant',
    passwordHash: studentPass,
    userType: 'STUDENT',
    isTempPassword: false,
    status: 'ACTIVE',
  });
  const savedStudentUser = await userRepository.save(studentUser);

  const student = studentRepository.create({
    matricule: 'ISTA-2026-0001',
    nom: 'Kabongo',
    prenom: 'Etudiant',
    email: 'etudiant.kabongo@istagoma.ac.cd', // their personal email
    mention: 'Informatique',
    section: 'Sciences Informatiques',
    niveau: 'L3',
    anneeAcademique: '2025-2026',
    statutFinancier: 'IMPAYE',
    motDePasseTemporaire: 'etudiant123',
    user: savedStudentUser,
  });
  await studentRepository.save(student);

  // 5. Seed some initial courses for test
  const coursesData = [
    {
      code: 'NESTJS3',
      nom: 'NestJS Backend Framework',
      mention: 'Informatique',
      niveau: 'L3',
      credits: 6,
      section: 'Sciences Informatiques',
      enseignant: savedProf,
      enseignantId: savedProf.id,
    },
    {
      code: 'JAVAFX3',
      nom: 'JavaFX & Desktop Apps',
      mention: 'Informatique',
      niveau: 'L3',
      credits: 4,
      section: 'Sciences Informatiques',
      enseignant: savedProf,
      enseignantId: savedProf.id,
    },
    {
      code: 'ALGO1',
      nom: 'Algorithmique & Structures de Données',
      mention: 'Informatique',
      niveau: 'L1',
      credits: 5,
      section: 'Sciences Informatiques',
      enseignant: null,
      enseignantId: null,
    },
  ];
  const courses = courseRepository.create(coursesData as any[]);
  await courseRepository.save(courses);

  console.log('🌱 Initial database seeding completed successfully!');
}
