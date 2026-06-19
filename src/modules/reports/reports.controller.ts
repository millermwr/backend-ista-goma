import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Reports')
@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  @Get('students')
  @ApiOperation({ summary: 'Get student report' })
  @ApiResponse({ status: 200, description: 'Returns student report' })
  async getStudentReport(@Query('programId') programId?: string) {
    return {
      reportType: 'STUDENTS',
      data: {
        totalStudents: 150,
        activeStudents: 145,
        graduatedStudents: 5,
        byProgram: [
          { program: 'Licence Informatique', count: 80 },
          { program: 'Master Gestion', count: 70 }
        ]
      },
      generatedAt: new Date().toISOString()
    };
  }

  @Get('grades')
  @ApiOperation({ summary: 'Get grades report' })
  @ApiResponse({ status: 200, description: 'Returns grades report' })
  async getGradesReport(@Query('semester') semester?: string) {
    return {
      reportType: 'GRADES',
      data: {
        averageGrade: 78.5,
        highestGrade: 98,
        lowestGrade: 45,
        passingRate: 85,
        byCourse: [
          { course: 'Introduction à la Programmation', average: 82 },
          { course: 'Gestion de Projet', average: 75 }
        ]
      },
      generatedAt: new Date().toISOString()
    };
  }

  @Get('financial')
  @ApiOperation({ summary: 'Get financial report' })
  @ApiResponse({ status: 200, description: 'Returns financial report' })
  async getFinancialReport(@Query('month') month?: string) {
    return {
      reportType: 'FINANCIAL',
      data: {
        totalRevenue: 50000000,
        totalExpenses: 30000000,
        netProfit: 20000000,
        pendingPayments: 15000000,
        collectedPayments: 35000000
      },
      generatedAt: new Date().toISOString()
    };
  }

  @Post('custom')
  @ApiOperation({ summary: 'Generate custom report' })
  @ApiResponse({ status: 200, description: 'Returns custom report' })
  async generateCustomReport(@Body() reportConfig: any) {
    return {
      message: 'Custom report generated successfully',
      reportType: 'CUSTOM',
      data: reportConfig,
      generatedAt: new Date().toISOString()
    };
  }
}
