import { Module, forwardRef } from '@nestjs/common';
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
import { DbmanagerModule } from 'src/dbmanager/dbmanager.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { OperatorModule } from 'src/operator/operator.module';
import { StatisticModule } from 'src/statistic/statistic.module';

@Module({
  imports: [
    DbmanagerModule, forwardRef(() => AttendanceModule), forwardRef(() => OperatorModule), forwardRef(() => StatisticModule)
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
