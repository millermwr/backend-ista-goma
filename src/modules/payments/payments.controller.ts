import { Controller, Get, Post, Put, Body, Param, Delete, HttpCode, HttpStatus, UseGuards, Query, Request } from '@nestjs/common';
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
  async findAll(
    @Query('anneeAcademique') anneeAcademique?: string,
    @Query('mention') mention?: string,
    @Query('niveau') niveau?: string,
  ) {
    return this.paymentsService.findAll(anneeAcademique, mention, niveau);
  }

  @Get('student/:studentId')
  @Roles('DIRECTION', 'FINANCE', 'STUDENT')
  @ApiOperation({ summary: 'Get payment history for a student' })
  @ApiResponse({ status: 200, description: 'Returns list of payments' })
  async findByStudent(@Param('studentId') studentId: string) {
    return this.paymentsService.findByStudent(studentId);
  }

  @Get('reference/:reference')
  @Roles('DIRECTION', 'FINANCE')
  @ApiOperation({ summary: 'Get payment details by reference' })
  @ApiResponse({ status: 200, description: 'Returns payment details' })
  async findByReference(@Param('reference') reference: string) {
    return this.paymentsService.findByReference(reference);
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

  @Put(':id')
  @Roles('FINANCE')
  @ApiOperation({ summary: 'Modify an existing payment' })
  @ApiResponse({ status: 200, description: 'Payment modified successfully' })
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.paymentsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('DIRECTION')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete/cancel a payment' })
  @ApiResponse({ status: 204, description: 'Payment deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }

  @Get('history')
  @Roles('STUDENT')
  @ApiOperation({ summary: "Get current student's payment history" })
  async getMyPaymentHistory(@Request() req: any) {
    const student = await this.paymentsService.findStudentByUserId(req.user.id);
    return this.paymentsService.findByStudent(student.id);
  }
}
