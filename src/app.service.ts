import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Système Académique ISTAG Oma - API v1.0.0 - Deploy V3';
  }

  getStatus() {
    return {
      status: 'operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      modules: [
        'Authentication',
        'User Management',
        'Student Management',
        'Academic Programs',
        'Payments',
        'Grades & Results',
        'Employee Management',
        'Reports',
      ],
    };
  }
}
