import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { Attendance } from 'src/dbmanager/entities/attendance.entity';
import { User } from 'src/dbmanager/entities/user.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { DayInfo } from '../dbmanager/entities/day.info.entity';
import { MonthInfo } from '../dbmanager/entities/month.info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, DayInfo, MonthInfo, Attendance])],
  controllers: [AttendanceController],
  providers: [AttendanceService, DbmanagerService]
})
export class AttendanceModule {}
