import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';

@ApiTags('Students')
@ApiBearerAuth()
@Controller('api/v1/students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('me')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get current student profile' })
  async getMyProfile(@Request() req: any) {
    const student = await this.studentsService.findByUserId(req.user.id);
    return {
      id: student.id,
      matricule: student.matricule,
      nom: student.nom,
      postnom: student.postnom,
      prenom: student.prenom,
      fullName: `${student.prenom} ${student.nom}`,
      email: student.user?.email || student.email,
      mention: student.mention,
      section: student.section,
      niveau: student.niveau,
      anneeAcademique: student.anneeAcademique,
      statutFinancier: student.statutFinancier,
      telephone: student.telephone,
      adresse: student.adresse
    };
  }

  @Put('me')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Update current student profile' })
  async updateMyProfile(@Request() req: any, @Body() updateDto: any) {
    const student = await this.studentsService.findByUserId(req.user.id);
    return this.studentsService.update(student.id, updateDto);
  }

  @Get()
  @Roles('DIRECTION', 'FINANCE')
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'Returns list of students' })
  async findAll(
    @Query('mention') mention?: string,
    @Query('niveau') niveau?: string,
    @Query('search') search?: string,
    @Query('anneeAcademique') anneeAcademique?: string,
  ) {
    return this.studentsService.findAll(mention, niveau, search, anneeAcademique);
  }

  @Get('academic-years')
  @Roles('DIRECTION', 'FINANCE', 'PROFESSOR', 'STUDENT')
  @ApiOperation({ summary: 'Get all active academic years' })
  @ApiResponse({ status: 200, description: 'Returns distinct list of academic years' })
  async getAcademicYears() {
    return this.studentsService.getAcademicYears();
  }

  @Get('matricule/:matricule')
  @Roles('DIRECTION', 'FINANCE', 'PROFESSOR', 'STUDENT')
  @ApiOperation({ summary: 'Get student by matricule' })
  @ApiResponse({ status: 200, description: 'Returns student details' })
  async findByMatricule(@Param('matricule') matricule: string) {
    return this.studentsService.findByMatricule(matricule);
  }

  @Get(':id')
  @Roles('DIRECTION', 'FINANCE', 'STUDENT')
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({ status: 200, description: 'Returns student details' })
  async findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  @Roles('FINANCE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create (inscrire) new student' })
  @ApiResponse({ status: 201, description: 'Student created successfully' })
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Put(':id')
  @Roles('FINANCE', 'DIRECTION')
  @ApiOperation({ summary: 'Update student information' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  async update(@Param('id') id: string, @Body() updateStudentDto: any) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles('DIRECTION', 'FINANCE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete student' })
  @ApiResponse({ status: 204, description: 'Student deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
