import { forwardRef, Module } from '@nestjs/common';

import { DatabaseService } from '../../common/services/database.service';
import { InstructorModule } from '../instructor/instructor.module';
import { StudentModule } from '../student/student.module';
import { AuthController } from './controllers/auth.controller';
import { LocalUsersService } from './services/local-users.service';
import { SupabaseAuthService } from './services/supabase-auth.service';
import { SupabaseService } from './services/supabase.service';

@Module({
  imports: [forwardRef(() => StudentModule), forwardRef(() => InstructorModule)],
  controllers: [AuthController],
  providers: [DatabaseService, SupabaseService, LocalUsersService, SupabaseAuthService],
  exports: [DatabaseService, SupabaseService, LocalUsersService, SupabaseAuthService],
})
export class AuthModule {}
