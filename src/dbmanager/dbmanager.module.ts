import { Module } from '@nestjs/common';
import { DbmanagerService } from './dbmanager.service';
import { DbmanagerController } from './dbmanager.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { MonthInfo } from './entities/month_info.entity';
import { DayInfo } from './entities/day_info.entity';
import { Attendance } from './entities/attendance.entity';
import { MonthlyUsers } from './entities/monthly_users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [UserInfo, Attendance, DayInfo, MonthInfo, MonthlyUsers]
    ),
  ],
  controllers: [DbmanagerController],
  providers: [DbmanagerService]
})
export class DbmanagerModule {}
