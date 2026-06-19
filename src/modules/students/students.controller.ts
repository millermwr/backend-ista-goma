import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Students')
@Controller('api/v1/students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  @Get()
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'Returns list of students' })
  async findAll() {
    return {
      data: [
        {
          id: '1',
          firstName: 'Jean',
          lastName: 'Mutombo',
          email: 'jean.mutombo@istagoma.ac.cd',
          studentId: 'STU001',
          program: 'Licence Informatique',
          year: 2,
          status: 'ACTIVE'
        },
        {
          id: '2',
          firstName: 'Marie',
          lastName: 'Kabongo',
          email: 'marie.kabongo@istagoma.ac.cd',
          studentId: 'STU002',
          program: 'Master Gestion',
          year: 1,
          status: 'ACTIVE'
        }
      ],
      total: 2
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({ status: 200, description: 'Returns student details' })
  async findOne(@Param('id') id: string) {
    return {
      id: id,
      firstName: 'Jean',
      lastName: 'Mutombo',
      email: 'jean.mutombo@istagoma.ac.cd',
      studentId: 'STU001',
      program: 'Licence Informatique',
      year: 2,
      status: 'ACTIVE'
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new student' })
  @ApiResponse({ status: 201, description: 'Student created successfully' })
  async create(@Body() createStudentDto: any) {
    return {
      message: 'Student created successfully',
      data: {
        id: '3',
        ...createStudentDto
      }
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update student' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  async update(@Param('id') id: string, @Body() updateStudentDto: any) {
    return {
      message: 'Student updated successfully',
      data: {
        id: id,
        ...updateStudentDto
      }
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete student' })
  @ApiResponse({ status: 204, description: 'Student deleted successfully' })
  async delete(@Param('id') id: string) {
    return;
  }
}
