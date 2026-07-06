import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './modules/admin/admin.module';
import { AuditorModule } from './modules/auditor/auditor.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InstructorModule } from './modules/instructor/instructor.module';
import { AuthModule } from './modules/auth/auth.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { StudentModule } from './modules/student/student.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
    }),
    AuthModule,
    MessagingModule,
    StudentModule,
    InstructorModule,
    AdminModule,
    AuditorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
