import { Module } from '@nestjs/common';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entities/grade.entity';
import { Student } from '../students/entities/student.entity';
import { Course } from '../academics/entities/course.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grade, Student, Course, User])],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}
