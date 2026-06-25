import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { AcademicsModule } from './modules/academics/academics.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { GradesModule } from './modules/grades/grades.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/database/migrations/*.js'],
      migrationsRun: process.env.MIGRATIONS_RUN === 'true' || process.env.NODE_ENV === 'development',
      ssl: process.env.DB_SSL === 'true',
      synchronize: process.env.SYNCHRONIZE === 'true' || process.env.NODE_ENV === 'development',
      logging: process.env.LOG_LEVEL === 'debug',
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    AcademicsModule,
    PaymentsModule,
    GradesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
