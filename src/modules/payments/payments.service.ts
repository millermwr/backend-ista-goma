import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Student } from '../students/entities/student.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  private getStudentTotalFees(niveau: string): number {
    let totalFees = 395; // Default for L1/L2
    const niveauLower = (niveau || '').toLowerCase().trim();
    if (niveauLower.includes('l0') || niveauLower.includes('prép') || niveauLower.includes('prep')) {
      totalFees = 355;
    } else if (niveauLower.includes('l1') || niveauLower.includes('l2')) {
      totalFees = 395;
    } else if (niveauLower.includes('l3')) {
      totalFees = 566;
    } else if (niveauLower.includes('m1') || niveauLower.includes('doctorat 1') || niveauLower.includes('doctorat1') || niveauLower.includes('d1')) {
      totalFees = 655;
    } else if (niveauLower.includes('m2') || niveauLower.includes('doctorat 2') || niveauLower.includes('doctorat2') || niveauLower.includes('d2')) {
      totalFees = 1275;
    }
    return totalFees;
  }

  private generateReference(): string {
    return 'REF' + Date.now().toString().slice(-9);
  }

  async recalculateStudentFinancialStatus(studentId: string) {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) return;

    const allPayments = await this.paymentRepository.find({
      where: { etudiantId: student.id, statut: 'PAYE' }
    });

    const totalPaid = allPayments.reduce((acc, p) => acc + p.montant, 0);
    const totalFees = this.getStudentTotalFees(student.niveau);

    if (totalPaid >= totalFees) {
      student.statutFinancier = 'PAYE';
    } else if (totalPaid > 0) {
      student.statutFinancier = 'PARTIEL';
    } else {
      student.statutFinancier = 'IMPAYE';
    }

    await this.studentRepository.save(student);
  }

  async create(createPaymentDto: CreatePaymentDto) {
    // 1. Find student
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(createPaymentDto.etudiantId);
    const student = await this.studentRepository.findOne({
      where: isUuid
        ? { id: createPaymentDto.etudiantId }
        : { matricule: createPaymentDto.etudiantId }
    });
    if (!student) {
      throw new NotFoundException(`Étudiant avec l'identifiant ${createPaymentDto.etudiantId} non trouvé`);
    }

    // 2. Generate or verify reference
    let reference = createPaymentDto.reference;
    if (!reference || reference.trim() === '') {
      reference = this.generateReference();
    } else {
      const existingPayment = await this.paymentRepository.findOne({
        where: { reference }
      });
      if (existingPayment) {
        throw new ConflictException(`Un paiement avec la référence ${reference} existe déjà`);
      }
    }

    // 3. Create payment
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      reference,
      etudiantId: student.id, // always store student's UUID
      statut: 'PAYE',
    });
    const savedPayment = await this.paymentRepository.save(payment);

    // 4. Update student financial status
    await this.recalculateStudentFinancialStatus(student.id);

    return savedPayment;
  }

  async findAll(anneeAcademique?: string, mention?: string, niveau?: string) {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .orderBy('payment.datePaiement', 'DESC');

    if (anneeAcademique) {
      queryBuilder.andWhere('student.anneeAcademique = :anneeAcademique', { anneeAcademique });
    }
    if (mention) {
      queryBuilder.andWhere('student.mention = :mention', { mention });
    }
    if (niveau) {
      queryBuilder.andWhere('student.niveau = :niveau', { niveau });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['student']
    });
    if (!payment) {
      throw new NotFoundException(`Paiement avec l'ID ${id} non trouvé`);
    }
    return payment;
  }

  async findByReference(reference: string) {
    const payment = await this.paymentRepository.findOne({
      where: { reference },
      relations: ['student']
    });
    if (!payment) {
      throw new NotFoundException(`Paiement avec la référence ${reference} non trouvé`);
    }
    return payment;
  }

  async findByStudent(studentId: string) {
    const student = await this.studentRepository.findOne({
      where: [{ id: studentId }, { matricule: studentId }]
    });
    if (!student) {
      throw new NotFoundException(`Étudiant non trouvé`);
    }
    return this.paymentRepository.find({
      where: { etudiantId: student.id },
      order: { datePaiement: 'DESC' }
    });
  }

  async getStatutFinancier(studentId: string, anneeAcademique?: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);
    let student: Student | null = null;
    if (anneeAcademique) {
      student = await this.studentRepository.findOne({
        where: isUuid 
          ? { id: studentId, anneeAcademique } 
          : { matricule: studentId, anneeAcademique }
      });
    } else {
      student = await this.studentRepository.findOne({
        where: isUuid
          ? { id: studentId }
          : { matricule: studentId },
        order: { createdAt: 'DESC' }
      });
    }

    if (!student) {
      throw new NotFoundException(`Étudiant non trouvé`);
    }

    const allPayments = await this.paymentRepository.find({
      where: { etudiantId: student.id, statut: 'PAYE' }
    });

    const totalPaid = allPayments.reduce((acc, p) => acc + p.montant, 0);
    const totalFees = this.getStudentTotalFees(student.niveau);
    const remaining = totalFees - totalPaid;
    const isEnRegle = remaining <= 0;

    return {
      studentId: student.id,
      matricule: student.matricule,
      nom: student.nom,
      postnom: student.postnom,
      prenom: student.prenom,
      niveau: student.niveau,
      mention: student.mention,
      anneeAcademique: student.anneeAcademique,
      statutFinancier: student.statutFinancier,
      totalPaid,
      totalFees,
      remaining: remaining < 0 ? 0 : remaining,
      isEnRegle
    };
  }

  async update(id: string, updateDto: any) {
    const payment = await this.findOne(id);
    
    if (updateDto.montant !== undefined) payment.montant = updateDto.montant;
    if (updateDto.typePaiement !== undefined) payment.typePaiement = updateDto.typePaiement;
    if (updateDto.reference !== undefined) payment.reference = updateDto.reference;
    if (updateDto.statut !== undefined) payment.statut = updateDto.statut;
    
    const savedPayment = await this.paymentRepository.save(payment);
    await this.recalculateStudentFinancialStatus(payment.etudiantId);
    return savedPayment;
  }

  async remove(id: string) {
    const payment = await this.findOne(id);
    const studentId = payment.etudiantId;
    await this.paymentRepository.remove(payment);
    await this.recalculateStudentFinancialStatus(studentId);
    return { message: 'Paiement supprimé avec succès' };
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
