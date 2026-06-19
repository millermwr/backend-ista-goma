import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Grades')
@Controller('api/v1/grades')
@UseGuards(JwtAuthGuard)
export class GradesController {
  @Get()
  @ApiOperation({ summary: 'Get all grades' })
  @ApiResponse({ status: 200, description: 'Returns list of grades' })
  async findAll() {
    return {
      data: [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Jean Mutombo',
          courseId: 'CS101',
          courseName: 'Introduction à la Programmation',
          grade: 85,
          semester: '2024-1',
          status: 'VALIDATED'
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'Marie Kabongo',
          courseId: 'MG201',
          courseName: 'Gestion de Projet',
          grade: 92,
          semester: '2024-1',
          status: 'VALIDATED'
        }
      ],
      total: 2
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get grade by ID' })
  @ApiResponse({ status: 200, description: 'Returns grade details' })
  async findOne(@Param('id') id: string) {
    return {
      id: id,
      studentId: 'STU001',
      studentName: 'Jean Mutombo',
      courseId: 'CS101',
      courseName: 'Introduction à la Programmation',
      grade: 85,
      semester: '2024-1',
      status: 'VALIDATED'
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new grade' })
  @ApiResponse({ status: 201, description: 'Grade created successfully' })
  async create(@Body() createGradeDto: any) {
    return {
      message: 'Grade created successfully',
      data: {
        id: '3',
        ...createGradeDto
      }
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update grade' })
  @ApiResponse({ status: 200, description: 'Grade updated successfully' })
  async update(@Param('id') id: string, @Body() updateGradeDto: any) {
    return {
      message: 'Grade updated successfully',
      data: {
        id: id,
        ...updateGradeDto
      }
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete grade' })
  @ApiResponse({ status: 204, description: 'Grade deleted successfully' })
  async delete(@Param('id') id: string) {
    return;
  }
}
