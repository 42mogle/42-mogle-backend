import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AttendanceModule } from './attendance/attendance.module';
import { OperatorModule } from './operator/operator.module';

@Module({
  imports: [UserModule, AttendanceModule, OperatorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
