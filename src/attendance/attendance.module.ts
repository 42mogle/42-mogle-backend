import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { Attendance } from 'src/dbmanager/entities/attendance.entity';
import { DayInfo } from 'src/dbmanager/entities/day_info.entity';
import { MonthInfo } from 'src/dbmanager/entities/month_info.entity';
import { MonthlyUsers } from 'src/dbmanager/entities/monthly_users.entity';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { OperatorService } from '../operator/operator.service';
import { StatisticService } from 'src/statistic/statistic.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserInfo,
      Attendance,
      DayInfo,
      MonthInfo,
      MonthlyUsers
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, DbmanagerService, OperatorService, StatisticService]
})
export class AttendanceModule {}
