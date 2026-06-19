import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Academics')
@Controller('api/v1/academics')
@UseGuards(JwtAuthGuard)
export class AcademicsController {
  @Get()
  @ApiOperation({ summary: 'Get all academic programs' })
  @ApiResponse({ status: 200, description: 'Returns list of academic programs' })
  async findAll() {
    return {
      data: [
        {
          id: '1',
          name: 'Licence Informatique',
          code: 'L-INF',
          duration: 3,
          description: 'Programme de licence en informatique',
          status: 'ACTIVE'
        },
        {
          id: '2',
          name: 'Master Gestion',
          code: 'M-GEST',
          duration: 2,
          description: 'Programme de master en gestion',
          status: 'ACTIVE'
        }
      ],
      total: 2
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get academic program by ID' })
  @ApiResponse({ status: 200, description: 'Returns academic program details' })
  async findOne(@Param('id') id: string) {
    return {
      id: id,
      name: 'Licence Informatique',
      code: 'L-INF',
      duration: 3,
      description: 'Programme de licence en informatique',
      status: 'ACTIVE'
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new academic program' })
  @ApiResponse({ status: 201, description: 'Academic program created successfully' })
  async create(@Body() createAcademicDto: any) {
    return {
      message: 'Academic program created successfully',
      data: {
        id: '3',
        ...createAcademicDto
      }
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update academic program' })
  @ApiResponse({ status: 200, description: 'Academic program updated successfully' })
  async update(@Param('id') id: string, @Body() updateAcademicDto: any) {
    return {
      message: 'Academic program updated successfully',
      data: {
        id: id,
        ...updateAcademicDto
      }
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete academic program' })
  @ApiResponse({ status: 204, description: 'Academic program deleted successfully' })
  async delete(@Param('id') id: string) {
    return;
  }
}
