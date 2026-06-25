import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('api/v1/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles('DIRECTION', 'FINANCE')
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Returns list of payments' })
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get('student/:studentId')
  @Roles('DIRECTION', 'FINANCE', 'STUDENT')
  @ApiOperation({ summary: 'Get payment history for a student' })
  @ApiResponse({ status: 200, description: 'Returns list of payments' })
  async findByStudent(@Param('studentId') studentId: string) {
    return this.paymentsService.findByStudent(studentId);
  }

  @Get('statut/:studentId')
  @Roles('DIRECTION', 'FINANCE', 'STUDENT')
  @ApiOperation({ summary: 'Get student financial status' })
  @ApiResponse({ status: 200, description: 'Returns financial status details' })
  async getStatutFinancier(@Param('studentId') studentId: string, @Query('anneeAcademique') anneeAcademique?: string) {
    return this.paymentsService.getStatutFinancier(studentId, anneeAcademique);
  }

  @Get(':id')
  @Roles('DIRECTION', 'FINANCE')
  @ApiOperation({ summary: 'Get payment details' })
  @ApiResponse({ status: 200, description: 'Returns payment details' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  @Roles('FINANCE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a new payment' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Delete(':id')
  @Roles('DIRECTION')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete/cancel a payment' })
  @ApiResponse({ status: 204, description: 'Payment deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
