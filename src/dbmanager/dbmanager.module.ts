import { Module } from '@nestjs/common';
import { DbmanagerService } from './dbmanager.service';
import { DbmanagerController } from './dbmanager.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/dbmanager/entities/user.entity';
import { MonthInfo } from './entities/month.info.entity';
import { DayInfo } from './entities/day.info.entity';
import { Attendance } from './entities/attendance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User, MonthInfo, DayInfo, Attendance]
    ),
  ],
  controllers: [DbmanagerController],
  providers: [DbmanagerService]
})
export class DbmanagerModule {}
