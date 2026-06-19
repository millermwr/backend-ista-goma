import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('api/v1/payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Returns list of payments' })
  async findAll() {
    return {
      data: [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Jean Mutombo',
          amount: 500000,
          currency: 'CDF',
          paymentDate: '2024-01-15',
          status: 'PAID',
          type: 'TUITION'
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'Marie Kabongo',
          amount: 750000,
          currency: 'CDF',
          paymentDate: '2024-02-20',
          status: 'PENDING',
          type: 'TUITION'
        }
      ],
      total: 2
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Returns payment details' })
  async findOne(@Param('id') id: string) {
    return {
      id: id,
      studentId: 'STU001',
      studentName: 'Jean Mutombo',
      amount: 500000,
      currency: 'CDF',
      paymentDate: '2024-01-15',
      status: 'PAID',
      type: 'TUITION'
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  async create(@Body() createPaymentDto: any) {
    return {
      message: 'Payment created successfully',
      data: {
        id: '3',
        ...createPaymentDto
      }
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update payment' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  async update(@Param('id') id: string, @Body() updatePaymentDto: any) {
    return {
      message: 'Payment updated successfully',
      data: {
        id: id,
        ...updatePaymentDto
      }
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payment' })
  @ApiResponse({ status: 204, description: 'Payment deleted successfully' })
  async delete(@Param('id') id: string) {
    return;
  }
}
