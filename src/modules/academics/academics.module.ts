import { Module } from '@nestjs/common';
import { AcademicsController } from './academics.controller';
import { AcademicsService } from './academics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, User])],
  controllers: [AcademicsController],
  providers: [AcademicsService],
  exports: [AcademicsService],
})
export class AcademicsModule {}
