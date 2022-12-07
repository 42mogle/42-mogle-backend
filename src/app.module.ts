import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttendanceModule } from './attendance/attendance.module';
import { OperatorModule } from './operator/operator.module';
import { StatisticModule } from './statistic/statistic.module';
import { typeORMConfig } from './configs/typeorm.config';
import { DbmanagerModule } from './dbmanager/dbmanager.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UserInfo } from './dbmanager/entities/user_info.entity';
import { Attendance } from './dbmanager/entities/attendance.entity';
import { DayInfo } from './dbmanager/entities/day_info.entity';
import { MonthInfo } from './dbmanager/entities/month_info.entity';
import { MonthlyUsers } from './dbmanager/entities/monthly_users.entity';
import { DbmanagerService } from './dbmanager/dbmanager.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
// import { HttpModule } from '@nestjs/axios';
//import { BoardsController } from './boards/boards.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig), 
    TypeOrmModule.forFeature(
      [UserInfo, Attendance, DayInfo, MonthInfo, MonthlyUsers]
    ),
    AuthModule,
    UserModule, 
    AttendanceModule, 
    OperatorModule, 
    StatisticModule,
    DbmanagerModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }
    ),
  ],
  controllers: [AppController],
  providers: [AppService, DbmanagerService],
})
export class AppModule {}
