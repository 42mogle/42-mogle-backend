import { Module, forwardRef } from '@nestjs/common';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { Attendance } from '../dbmanager/entities/attendance.entity';
import { DayInfo } from '../dbmanager/entities/day_info.entity';
import { MonthInfo } from '../dbmanager/entities/month_info.entity';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { AttendanceService } from 'src/attendance/attendance.service';
import { OperatorService } from '../operator/operator.service';
import { DbmanagerModule } from 'src/dbmanager/dbmanager.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { OperatorModule } from 'src/operator/operator.module';

@Module({
  imports: [
    DbmanagerModule, forwardRef(() => AttendanceModule), forwardRef(() => OperatorModule)
  ],
  controllers: [StatisticController],
  providers: [StatisticService],
  exports: [StatisticService]
})
export class StatisticModule {}
