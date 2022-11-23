import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { Attendance } from 'src/dbmanager/entities/attendance.entity';
import { User } from 'src/dbmanager/entities/user.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AttendanceController],
  providers: [AttendanceService, DbmanagerService]
})
export class AttendanceModule {}
