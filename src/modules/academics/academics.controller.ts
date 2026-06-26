import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AcademicsService } from './academics.service';
import { CreateCourseDto } from './dto/create-course.dto';

@ApiTags('Academics')
@ApiBearerAuth()
@Controller('api/v1/academics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  @Get('courses')
  @Roles('DIRECTION', 'FINANCE', 'PROFESSOR', 'STUDENT')
  @ApiOperation({ summary: 'Get all courses' })
  async findCourses(
    @Query('mention') mention?: string,
    @Query('niveau') niveau?: string,
    @Query('section') section?: string,
  ) {
    return this.academicsService.findAll(mention, niveau, section);
  }

  @Get('mes-cours')
  @Roles('PROFESSOR')
  @ApiOperation({ summary: 'Get courses assigned to the current professor' })
  async findMesCours(@Request() req) {
    return this.academicsService.findMesCours(req.user.id);
  }

  @Get('professors')
  @Roles('DIRECTION')
  @ApiOperation({ summary: 'Get list of active professors' })
  async findProfessors() {
    return this.academicsService.findProfessors();
  }

  @Get('courses/:id')
  @Roles('DIRECTION', 'PROFESSOR')
  @ApiOperation({ summary: 'Get course details by ID' })
  async findOneCourse(@Param('id') id: string) {
    return this.academicsService.findOne(id);
  }

  @Post('courses')
  @Roles('DIRECTION')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new course' })
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.academicsService.create(createCourseDto);
  }

  @Post('courses/:courseId/assign')
  @Roles('DIRECTION')
  @ApiOperation({ summary: 'Assign a professor to a course' })
  async assignProfessor(
    @Param('courseId') courseId: string,
    @Body('enseignantId') enseignantId: string | null,
  ) {
    return this.academicsService.assignProfessor(courseId, enseignantId);
  }

  @Delete('courses/:id')
  @Roles('DIRECTION')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a course' })
  async deleteCourse(@Param('id') id: string) {
    return this.academicsService.remove(id);
  }

  @Post('schedules')
  @Roles('DIRECTION')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a weekly course schedule' })
  async createSchedule(@Body() dto: any) {
    return this.academicsService.createSchedule(dto);
  }

  @Get('schedules')
  @Roles('DIRECTION', 'PROFESSOR', 'STUDENT')
  @ApiOperation({ summary: 'Get course schedules' })
  async findSchedules(
    @Query('anneeAcademique') anneeAcademique?: string,
    @Query('semaineDebut') semaineDebut?: string,
    @Query('mention') mention?: string,
    @Query('niveau') niveau?: string,
  ) {
    return this.academicsService.findSchedules(anneeAcademique, semaineDebut, mention, niveau);
  }

  @Delete('schedules/:id')
  @Roles('DIRECTION')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a weekly course schedule' })
  async deleteSchedule(@Param('id') id: string) {
    return this.academicsService.deleteSchedule(id);
  }

  @Put('courses/:id')
  @Roles('DIRECTION')
  @ApiOperation({ summary: 'Update a course' })
  async updateCourse(@Param('id') id: string, @Body() updateCourseDto: any) {
    return this.academicsService.update(id, updateCourseDto);
  }

  @Delete('schedules/week/:semaineDebut')
  @Roles('DIRECTION')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all weekly schedules for a week' })
  async deleteWeekSchedules(
    @Param('semaineDebut') semaineDebut: string,
    @Query('anneeAcademique') anneeAcademique?: string,
    @Query('mention') mention?: string,
    @Query('niveau') niveau?: string,
  ) {
    return this.academicsService.deleteWeekSchedules(semaineDebut, anneeAcademique, mention, niveau);
  }

  @Post('schedules/publish')
  @Roles('DIRECTION')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish weekly course schedules' })
  async publishSchedules(
    @Body('semaineDebut') semaineDebut: string,
    @Body('anneeAcademique') anneeAcademique?: string,
    @Body('mention') mention?: string,
    @Body('niveau') niveau?: string,
  ) {
    return this.academicsService.publishSchedules(semaineDebut, anneeAcademique, mention, niveau);
  }
}
