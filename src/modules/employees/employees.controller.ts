import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Employees')
@Controller('api/v1/employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'Returns list of employees' })
  async findAll() {
    return {
      data: [
        {
          id: '1',
          firstName: 'Pierre',
          lastName: 'Lumbu',
          email: 'pierre.lumbu@istagoma.ac.cd',
          position: 'Professeur',
          department: 'Informatique',
          hireDate: '2020-09-01',
          status: 'ACTIVE'
        },
        {
          id: '2',
          firstName: 'Anne',
          lastName: 'Mukendi',
          email: 'anne.mukendi@istagoma.ac.cd',
          position: 'Comptable',
          department: 'Finance',
          hireDate: '2021-03-15',
          status: 'ACTIVE'
        }
      ],
      total: 2
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Returns employee details' })
  async findOne(@Param('id') id: string) {
    return {
      id: id,
      firstName: 'Pierre',
      lastName: 'Lumbu',
      email: 'pierre.lumbu@istagoma.ac.cd',
      position: 'Professeur',
      department: 'Informatique',
      hireDate: '2020-09-01',
      status: 'ACTIVE'
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  async create(@Body() createEmployeeDto: any) {
    return {
      message: 'Employee created successfully',
      data: {
        id: '3',
        ...createEmployeeDto
      }
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  async update(@Param('id') id: string, @Body() updateEmployeeDto: any) {
    return {
      message: 'Employee updated successfully',
      data: {
        id: id,
        ...updateEmployeeDto
      }
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete employee' })
  @ApiResponse({ status: 204, description: 'Employee deleted successfully' })
  async delete(@Param('id') id: string) {
    return;
  }
}
