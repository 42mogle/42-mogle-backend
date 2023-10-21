import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import * as config from 'config';
import * as winston from 'winston';
import { utilities } from 'nest-winston';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { Attendance } from 'src/dbmanager/entities/attendance.entity';
import { DayInfo } from 'src/dbmanager/entities/day_info.entity';
import { MonthInfo } from 'src/dbmanager/entities/month_info.entity';
import { MonthlyUsers } from 'src/dbmanager/entities/monthly_users.entity';
import { DbmanagerModule } from 'src/dbmanager/dbmanager.module';

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
    DbmanagerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || jwtConfig.secret,
      signOptions:{
        expiresIn: jwtConfig.expiresIn
      }
    })
  ],

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
