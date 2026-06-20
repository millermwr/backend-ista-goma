import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Grades')
@Controller('api/v1/grades')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GradesController {
  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get student grades with financial and administrative validation' })
  @ApiResponse({ status: 200, description: 'Returns student grades if conditions met' })
  @ApiResponse({ status: 403, description: 'Access denied: Financial or administrative conditions not met' })
  async findStudentGrades(@Param('studentId') studentId: string, @Request() req) {
    const userId = req.user?.id;
    
    // Simulation de la vérification financière
    const financialStatus = await this.checkFinancialStatus(studentId);
    if (!financialStatus.isPaid) {
      return {
        success: false,
        message: 'Accès refusé : Veuillez régulariser vos frais à la comptabilité',
        code: 'FINANCIAL_BLOCK'
      };
    }
    
    // Simulation de la vérification administrative (publication)
    const administrativeStatus = await this.checkAdministrativeStatus(studentId);
    if (!administrativeStatus.isPublished) {
      return {
        success: false,
        message: 'Résultats non encore disponibles : Délibération en cours au niveau de la section',
        code: 'ADMINISTRATIVE_BLOCK'
      };
    }
    
    // Si les deux conditions sont remplies, renvoyer les notes
    return {
      success: true,
      message: 'Accès autorisé',
      data: [
        {
          id: '1',
          studentId: studentId,
          courseId: 'CS101',
          courseName: 'Introduction à la Programmation',
          tpGrade: 16,
          examGrade: 18,
          finalGrade: 17,
          mention: 'Très Bien',
          credits: 6,
          semester: '2024-1',
          status: 'PUBLISHED'
        },
        {
          id: '2',
          studentId: studentId,
          courseId: 'CS102',
          courseName: 'Structures de Données',
          tpGrade: 14,
          examGrade: 15,
          finalGrade: 14.5,
          mention: 'Bien',
          credits: 5,
          semester: '2024-1',
          status: 'PUBLISHED'
        }
      ]
    };
  }
  
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all grades for a specific course (for professors)' })
  @ApiResponse({ status: 200, description: 'Returns course grades' })
  async findCourseGrades(@Param('courseId') courseId: string, @Request() req) {
    const userRole = req.user?.userType;
    
    // Vérifier que l'utilisateur est un enseignant ou admin
    if (userRole !== 'professor' && userRole !== 'admin' && userRole !== 'scolarite') {
      return {
        success: false,
        message: 'Accès non autorisé'
      };
    }
    
    return {
      success: true,
      data: [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Jean Mutombo',
          matricule: 'MAT2024001',
          tpGrade: 16,
          examGrade: 18,
          finalGrade: 17,
          mention: 'Très Bien',
          status: 'ENCODED'
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'Marie Kabongo',
          matricule: 'MAT2024002',
          tpGrade: 14,
          examGrade: 15,
          finalGrade: 14.5,
          mention: 'Bien',
          status: 'ENCODED'
        }
      ]
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all grades (admin only)' })
  @ApiResponse({ status: 200, description: 'Returns list of grades' })
  async findAll(@Request() req) {
    const userRole = req.user?.userType;
    
    // Seuls admin, scolarité et direction peuvent voir toutes les notes
    if (userRole !== 'admin' && userRole !== 'scolarite' && userRole !== 'direction') {
      return {
        success: false,
        message: 'Accès non autorisé'
      };
    }
    
    return {
      data: [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Jean Mutombo',
          courseId: 'CS101',
          courseName: 'Introduction à la Programmation',
          tpGrade: 16,
          examGrade: 18,
          finalGrade: 17,
          mention: 'Très Bien',
          semester: '2024-1',
          status: 'PUBLISHED'
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'Marie Kabongo',
          courseId: 'MG201',
          courseName: 'Gestion de Projet',
          tpGrade: 15,
          examGrade: 17,
          finalGrade: 16,
          mention: 'Très Bien',
          semester: '2024-1',
          status: 'PUBLISHED'
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
      tpGrade: 16,
      examGrade: 18,
      finalGrade: 17,
      mention: 'Très Bien',
      semester: '2024-1',
      status: 'PUBLISHED'
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new grade (professor only)' })
  @ApiResponse({ status: 201, description: 'Grade created successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async create(@Body() createGradeDto: any, @Request() req) {
    const userRole = req.user?.userType;
    
    // Seuls les enseignants et admin peuvent créer des notes
    if (userRole !== 'professor' && userRole !== 'admin') {
      return {
        success: false,
        message: 'Accès non autorisé'
      };
    }
    
    return {
      message: 'Grade created successfully',
      data: {
        id: '3',
        ...createGradeDto,
        status: 'ENCODED',
        isPublished: false
      }
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update grade (professor only)' })
  @ApiResponse({ status: 200, description: 'Grade updated successfully' })
  async update(@Param('id') id: string, @Body() updateGradeDto: any, @Request() req) {
    const userRole = req.user?.userType;
    
    // Seuls les enseignants et admin peuvent modifier des notes
    if (userRole !== 'professor' && userRole !== 'admin') {
      return {
        success: false,
        message: 'Accès non autorisé'
      };
    }
    
    return {
      message: 'Grade updated successfully',
      data: {
        id: id,
        ...updateGradeDto
      }
    };
  }
  
  @Put(':id/publish')
  @ApiOperation({ summary: 'Publish grades (section/admin only)' })
  @ApiResponse({ status: 200, description: 'Grades published successfully' })
  async publishGrades(@Param('id') id: string, @Request() req) {
    const userRole = req.user?.userType;
    
    // Seuls admin, direction et scolarité peuvent publier les notes
    if (userRole !== 'admin' && userRole !== 'direction' && userRole !== 'scolarite') {
      return {
        success: false,
        message: 'Accès non autorisé'
      };
    }
    
    return {
      message: 'Grades published successfully',
      data: {
        id: id,
        isPublished: true,
        publishedAt: new Date().toISOString()
      }
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete grade (admin only)' })
  @ApiResponse({ status: 204, description: 'Grade deleted successfully' })
  async delete(@Param('id') id: string, @Request() req) {
    const userRole = req.user?.userType;
    
    // Seul admin peut supprimer des notes
    if (userRole !== 'admin') {
      return {
        success: false,
        message: 'Accès non autorisé'
      };
    }
    
    return;
  }
  
  // Méthodes utilitaires pour la vérification (à implémenter avec la base de données)
  private async checkFinancialStatus(studentId: string): Promise<{ isPaid: boolean; message?: string }> {
    // Simulation - à remplacer par une vraie requête à la base de données
    return { isPaid: true };
  }
  
  private async checkAdministrativeStatus(studentId: string): Promise<{ isPublished: boolean; message?: string }> {
    // Simulation - à remplacer par une vraie requête à la base de données
    return { isPublished: true };
  }
}
