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

  // async testDBTables(): Promise<any> {
  //   const originDate = new Date();

  //   // UserInfo
  //   let testUser;
  //   // testUser = this.userInfoRepo.create({
  //   //   intraId: "testUser", 
  //   //   isAdmin: true,
  //   //   password: "pwd1234",
  //   // });
  //   // await this.userInfoRepo.save(testUser);
  //   testUser = await this.userInfoRepo.findOneBy({
  //       intraId: "testUser",
  //   });
  //   console.log("testUser", testUser);

  //   // MonthInfo
  //   let testMonth;
  //   // testMonth = this.monthInfoRepo.create({
  //   //   month: originDate.getMonth() + 1,
  //   //   year: originDate.getFullYear(),
  //   //   totalAttendance: 20,
  //   //   failUserCount: 30,
  //   //   perfectUserCount: 10,
  //   // })
  //   // await this.monthInfoRepo.save(testMonth);
  //   testMonth = await this.monthInfoRepo.findOneBy({
  //     month: originDate.getMonth() + 1,
  //   })
  //   console.log("testMonth:", testMonth);

  //   // DayInfo
  //   let testDayInfo;
  //   // testDayInfo = this.dayInfoRepo.create({
  //   //   day: originDate.getDay(),
  //   //   type: 1,
  //   //   attendUserCount: 20,
  //   //   perfectUserCount: 10,
  //   //   monthInfo: testMonth,
  //   //   todayWord: "minsukan is the best smoker"
  //   // })
  //   // await this.dayInfoRepo.save(testDayInfo);
  //   testDayInfo = await this.dayInfoRepo.findOneBy({
  //     day: originDate.getDay(),
  //   })
  //   console.log("testDayInfo:", testDayInfo);

  //   // Attendance
  //   let testAttendance;
  //   // testAttendance = this.attendanceRepo.create({
  //   //   timelog: originDate,
  //   //   userInfo: testUser,
  //   //   dayInfo: testDayInfo
  //   // })
  //   // await this.attendanceRepo.save(testAttendance);
  //   testAttendance = await this.attendanceRepo.findOneBy({
  //     dayInfo: testDayInfo,
  //   });
  //   console.log("testAttendance:", testAttendance);
    
  //   // MonthlyUsers
  //   let testMonthlyUsers;
  //   // testMonthlyUsers = this.monthlyUsersRepo.create({
  //   //   attendanceCount: 20,
  //   //   isPerfect: true,
  //   //   totalPerfectCount: 3,
  //   //   monthInfo: testMonth,
  //   //   userInfo: testUser,
  //   // })
  //   // await this.monthlyUsersRepo.save(testMonthlyUsers);
  //   testMonthlyUsers = await this.monthlyUsersRepo.findOneBy({
  //     userInfo: testUser,
  //   })
  //   console.log(testMonthlyUsers);

  //   return ;
  // }

  getHello(): string {
    return 'Hello 42mogle!';
  }
}
