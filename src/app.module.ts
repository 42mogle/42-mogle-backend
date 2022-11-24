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
import { UserInfo } from './dbmanager/entities/user_info.entity';
import { Attendance } from './dbmanager/entities/attendance.entity';
import { DayInfo } from './dbmanager/entities/day_info.entity';
import { MonthInfo } from './dbmanager/entities/month_info.entity';
import { MonthlyUsers } from './dbmanager/entities/monthly_users.entity';
import { DbmanagerService } from './dbmanager/dbmanager.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig), 
    TypeOrmModule.forFeature(
      [UserInfo, Attendance, DayInfo, MonthInfo, MonthlyUsers]
    ),
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
