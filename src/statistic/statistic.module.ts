import { Module } from '@nestjs/common';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { Attendance } from '../dbmanager/entities/attendance.entity';
import { DayInfo } from '../dbmanager/entities/day_info.entity';
import { MonthInfo } from '../dbmanager/entities/month_info.entity';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';
import { DbmanagerService } from '../dbmanager/dbmanager.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [UserInfo, Attendance, DayInfo, MonthInfo, MonthlyUsers]
    )
  ],
  controllers: [StatisticController],
  providers: [StatisticService, DbmanagerService]
})
export class StatisticModule {}
