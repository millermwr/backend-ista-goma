import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GradesService } from './grades.service';
import { SaisirCotesDto } from './dto/saisir-cotes.dto';

@ApiTags('Grades')
@ApiBearerAuth()
@Controller('api/v1/grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get('student/:studentId')
  @Roles('DIRECTION', 'FINANCE', 'STUDENT')
  @ApiOperation({ summary: 'Get student grades with financial and administrative validation (double-lock)' })
  async findStudentGrades(@Param('studentId') studentId: string, @Query('anneeAcademique') anneeAcademique?: string) {
    return this.gradesService.findStudentGrades(studentId, anneeAcademique);
  }

  @Get('course/:courseId')
  @Roles('DIRECTION', 'PROFESSOR')
  @ApiOperation({ summary: 'Get all grades for a specific course (for professors)' })
  async findCourseGrades(
    @Param('courseId') courseId: string,
    @Request() req: any,
    @Query('anneeAcademique') anneeAcademique?: string,
  ) {
    const isProfessor = req.user.userType === 'PROFESSOR';
    return this.gradesService.findCourseGrades(courseId, isProfessor ? req.user.id : undefined, anneeAcademique);
  }

  @Get('suivi')
  @Roles('DIRECTION', 'PROFESSOR')
  @ApiOperation({ summary: 'Get encoding progress for courses (for Direction & Professors)' })
  async getSuivi(@Query('mention') mention?: string) {
    return this.gradesService.getSuiviEncodage(mention);
  }

  @Post()
  @Roles('PROFESSOR', 'DIRECTION')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save grades for a course (professor or direction)' })
  async saisirCotes(@Body() saisirCotesDto: SaisirCotesDto, @Request() req) {
    const isProfessor = req.user.userType === 'PROFESSOR';
    return this.gradesService.saisirCotes(saisirCotesDto, isProfessor ? req.user.id : undefined);
  }

  @Post('submit')
  @Roles('PROFESSOR', 'DIRECTION')
  @ApiOperation({ summary: 'Submit grades for validation (Professor only)' })
  async soumettreCotes(
    @Body('coursId') coursId: string,
    @Body('anneeAcademique') anneeAcademique: string,
    @Body('session') session: string,
  ) {
    return this.gradesService.soumettreCotes(coursId, anneeAcademique, session);
  }

  @Post('publish')
  @Roles('DIRECTION')
  @ApiOperation({ summary: 'Publish grades for a mention, level, year and session (Direction only)' })
  async publishGrades(
    @Body('mention') mention: string,
    @Body('niveau') niveau: string,
    @Body('anneeAcademique') anneeAcademique: string,
    @Body('session') session: string,
  ) {
    return this.gradesService.publierCotes(mention, niveau, anneeAcademique, session);
  }

  @Get('my-grades')
  @Roles('STUDENT')
  @ApiOperation({ summary: "Get current student's grades" })
  async findMyGrades(@Request() req: any) {
    const student = await this.gradesService.findStudentByUserId(req.user.id);
    return this.gradesService.findStudentGrades(student.id);
  }
}
