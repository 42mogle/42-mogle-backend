import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { OperatorService } from '../operator/operator.service';
import { StatisticService } from '../statistic/statistic.service';
import { DbmanagerModule } from '../dbmanager/dbmanager.module';
import { DbmanagerService } from '../dbmanager/dbmanager.service';

@Module({
  imports: [
    DbmanagerModule
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, OperatorService, StatisticService]
})
export class AttendanceModule {}
