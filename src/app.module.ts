import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AttendanceModule } from './attendance/attendance.module';
import { OperatorModule } from './operator/operator.module';
import { StatisticModule } from './statistic/statistic.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { DbmanagerModule } from './dbmanager/dbmanager.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DbmanagerService } from './dbmanager/dbmanager.service';
import { User } from './dbmanager/entities/user.entity';
import { MonthInfo } from './dbmanager/entities/month.info.entity';
import { DayInfo } from './dbmanager/entities/day.info.entity';
import { Attendance } from './dbmanager/entities/attendance.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig), 
    TypeOrmModule.forFeature([User, MonthInfo, DayInfo, Attendance]),
    UserModule, 
    AttendanceModule, 
    OperatorModule, 
    StatisticModule,
    DbmanagerModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, DbmanagerService],
})
export class AppModule {}
