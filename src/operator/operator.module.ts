import { Module } from '@nestjs/common';
import { OperatorController } from './operator.controller';
import { OperatorService } from './operator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../dbmanager/entities/user.entity';
import { MonthInfo } from '../dbmanager/entities/month.info.entity';
import { DayInfo } from '../dbmanager/entities/day.info.entity';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { Attendance } from '../dbmanager/entities/attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature(
    [
      User, 
      MonthInfo, 
      DayInfo,
      Attendance
    ])
  ],
  controllers: [OperatorController],
  providers: [OperatorService, DbmanagerService]
})
export class OperatorModule {}
