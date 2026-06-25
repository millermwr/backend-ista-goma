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

  async create(createPaymentDto: CreatePaymentDto) {
    // 1. Find student
    const student = await this.studentRepository.findOne({
      where: [
        { id: createPaymentDto.etudiantId },
        { matricule: createPaymentDto.etudiantId }
      ]
    });
    if (!student) {
      throw new NotFoundException(`Étudiant avec l'identifiant ${createPaymentDto.etudiantId} non trouvé`);
    }

    // 2. Check reference
    const existingPayment = await this.paymentRepository.findOne({
      where: { reference: createPaymentDto.reference }
    });
    if (existingPayment) {
      throw new ConflictException(`Un paiement avec la référence ${createPaymentDto.reference} existe déjà`);
    }

    // 3. Create payment
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      etudiantId: student.id, // always store student's UUID
      statut: 'PAYE',
    });
    const savedPayment = await this.paymentRepository.save(payment);

    // 4. Update student financial status
    const allPayments = await this.paymentRepository.find({
      where: { etudiantId: student.id, statut: 'PAYE' }
    });

    const hasSoldeOrTranche2 = allPayments.some(
      p => p.typePaiement === 'SOLDE' || p.typePaiement === 'TRANCHE_2'
    );

    if (hasSoldeOrTranche2) {
      student.statutFinancier = 'PAYE';
    } else if (allPayments.length > 0) {
      student.statutFinancier = 'PARTIEL';
    } else {
      student.statutFinancier = 'IMPAYE';
    }

    await this.studentRepository.save(student);

    return savedPayment;
  }

  async findAll() {
    return this.paymentRepository.find({
      relations: ['student'],
      order: { datePaiement: 'DESC' }
    });
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

  async getStatutFinancier(studentId: string) {
    const student = await this.studentRepository.findOne({
      where: [{ id: studentId }, { matricule: studentId }]
    });
    if (!student) {
      throw new NotFoundException(`Étudiant non trouvé`);
    }
    return {
      studentId: student.id,
      matricule: student.matricule,
      nom: student.nom,
      prenom: student.prenom,
      statutFinancier: student.statutFinancier
    };
  }

  async remove(id: string) {
    const payment = await this.findOne(id);
    const studentId = payment.etudiantId;
    await this.paymentRepository.remove(payment);

    // Recalculate student financial status
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (student) {
      const allPayments = await this.paymentRepository.find({
        where: { etudiantId: student.id, statut: 'PAYE' }
      });
      const hasSoldeOrTranche2 = allPayments.some(
        p => p.typePaiement === 'SOLDE' || p.typePaiement === 'TRANCHE_2'
      );
      if (hasSoldeOrTranche2) {
        student.statutFinancier = 'PAYE';
      } else if (allPayments.length > 0) {
        student.statutFinancier = 'PARTIEL';
      } else {
        student.statutFinancier = 'IMPAYE';
      }
      await this.studentRepository.save(student);
    }

    return { message: 'Paiement supprimé avec succès' };
  }
}
