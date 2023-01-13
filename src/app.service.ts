import { Get, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteDateColumn, Repository } from 'typeorm';
import { Attendance } from './dbmanager/entities/attendance.entity';
import { DayInfo } from './dbmanager/entities/day_info.entity';
import { MonthlyUsers } from './dbmanager/entities/monthly_users.entity';
import { MonthInfo } from './dbmanager/entities/month_info.entity';
import { UserInfo } from './dbmanager/entities/user_info.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(UserInfo)
    private userInfoRepo: Repository<UserInfo>,
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    @InjectRepository(DayInfo)
    private dayInfoRepo: Repository<DayInfo>,
    @InjectRepository(MonthInfo)
    private monthInfoRepo: Repository<MonthInfo>,
    @InjectRepository(MonthlyUsers)
    private monthlyUsersRepo: Repository<MonthlyUsers>,
  ) {}

  getDefault(): string {
    return "서버 켜져있어용 ㅎㅎㅎ";
  }

  getHello(): string {
    const str_test = process.env.ENV_TEST;
    console.log(`.env.ENV_TEST: ${str_test}`);
    const test_env_api = process.env.PAYLOAD_CLIENT_ID;
    console.log(`.env.api: ${test_env_api}`);
    return str_test;
  }
}
