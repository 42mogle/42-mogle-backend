import { Module } from '@nestjs/common';
import { OperatorController } from './operator.controller';
import { OperatorService } from './operator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { Attendance } from '../dbmanager/entities/attendance.entity';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { MonthInfo } from '../dbmanager/entities/month_info.entity';
import { DayInfo } from '../dbmanager/entities/day_info.entity';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';
import { StatisticService } from 'src/statistic/statistic.service';
import { AttendanceService } from '../attendance/attendance.service';

@Module({
  imports: [TypeOrmModule.forFeature(
    [
      UserInfo, 
      MonthInfo, 
      DayInfo,
      Attendance,
      MonthlyUsers
    ])
  ],
  controllers: [OperatorController],
  providers: [OperatorService, DbmanagerService, StatisticService, AttendanceService]
})
export class OperatorModule {}
