import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttendanceModule } from './attendance/attendance.module';
import { OperatorModule } from './operator/operator.module';
import { StatisticModule } from './statistic/statistic.module';
import { typeOrmConfig } from './configs/typeorm.config';
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
import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const level = 'silly'
const format = winston.format.combine(
  winston.format.timestamp(),
  utilities.format.nestLike('log', { prettyPrint: true })
)

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: level,
          format: format
        }),
        new winston.transports.File({
          dirname: 'Log',
          filename: 'history.log',
          level: level,
          format: format,
        }),
      ],
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
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
      envFilePath: ['.env', '.env.api'],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
