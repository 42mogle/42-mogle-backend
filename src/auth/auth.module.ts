import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import * as config from 'config';
import * as winston from 'winston';
import { utilities } from 'nest-winston';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { Attendance } from '../dbmanager/entities/attendance.entity';
import { DayInfo } from '../dbmanager/entities/day_info.entity';
import { MonthInfo } from '../dbmanager/entities/month_info.entity';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';

const jwtConfig = config.get('jwt');

const level = process.env.Node_ENV === 'production' ? 'error' : 'silly';
const format = winston.format.combine(
  winston.format.timestamp(),
  utilities.format.nestLike('log', { prettyPrint: true })
)

@Module({
  imports: [
    HttpModule,
    PassportModule,
    TypeOrmModule.forFeature([UserInfo, Attendance, DayInfo, MonthInfo, MonthlyUsers]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || jwtConfig.secret,
      signOptions:{
        expiresIn: jwtConfig.expiresIn
      }
    })
  ],

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, DbmanagerService]
})
export class AuthModule {}
