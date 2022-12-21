import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { MonthInfo } from '../dbmanager/entities/month_info.entity';
import { DayInfo } from '../dbmanager/entities/day_info.entity';
import { Attendance } from 'src/dbmanager/entities/attendance.entity';
import { MonthlyUsers } from 'src/dbmanager/entities/monthly_users.entity';
import { AttendanceService } from '../attendance/attendance.service';
import { OperatorService } from '../operator/operator.service';
import { StatisticService } from 'src/statistic/statistic.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [UserInfo, Attendance, DayInfo, MonthInfo, MonthlyUsers]
    )
  ],
  controllers: [UserController],
  providers: [UserService, DbmanagerService, AttendanceService, OperatorService, StatisticService]
})
export class UserModule {}
