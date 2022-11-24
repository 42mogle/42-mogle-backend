import { ForbiddenException, GatewayTimeoutException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Cron, Interval } from '@nestjs/schedule';
import { MonthInfo } from './entities/month_info.entity';
import { NotFoundError, sample } from 'rxjs';
import { DayInfo } from './entities/day_info.entity';

@Injectable()
export class DbmanagerService {
  constructor(
    @InjectRepository(UserInfo) private usersRepository: Repository<UserInfo>,
    @InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>,
	  @InjectRepository(MonthInfo) private monthRepository: Repository<MonthInfo>,
	  @InjectRepository(DayInfo) private dayInfoRepository: Repository<DayInfo>
  ) {}

  /* Examples
  findOne(id: number) {
    return `This action returns a #${id} dbmanager`;
  }

  update(id: number, updateDbmanagerDto: UpdateDbmanagerDto) {
    return `This action updates a #${id} dbmanager`;
  }

  remove(id: number) {
    return `This action removes a #${id} dbmanager`;
  }
  */

  // DB table: User
  async findUser(intraId: string): Promise<UserInfo> {
    const found = await this.usersRepository.findOne({where: { intraId }});

    return found;
  }

  createUser(createUserDto: CreateUserDto) {
    console.log(createUserDto);
    const user = new UserInfo();
    //user.intraId = createUserDto.intraId;
    user.password = createUserDto.password;
    //user.isAdmin = false;
    //user.photoUrl = "abc";
    this.usersRepository.create(user);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<UserInfo[]> {
    return await this.usersRepository.find();
  }

  async getUserId(intraId: string) {
    const user = await this.usersRepository.findOne({where: {intraId}});
    return user.id;
  }

  //findMonthInfo(year: number, month: number)
  
  // DB table: MonthInfo
  async setMonthInfo(): Promise<any> {
    const	now = new Date();
    const	year = now.getFullYear();
    const	month = now.getMonth() + 1;
    const	found = await this.monthRepository.findOne({where: {year, month}});
    if (found)
      throw new NotFoundException("이미 있슴;;");
    const monthinfo = new MonthInfo();
    monthinfo.year = year
    monthinfo.month = month;
    //monthinfo.failUserCount = 0;
    //monthinfo.totalAttendance = 0;
    //monthinfo.perfcetUserCount = 0;
    this.monthRepository.create(monthinfo);
    return this.monthRepository.save(monthinfo);
  }

  async getMonthId(month: number, year: number): Promise<number> {
    const monthinfo = await this.monthRepository.findOne({where: {month, year}});
  
    return monthinfo.id;
  }

  // DB table: DayInfo
  async setDayInfo() {
	  const now: Date = new Date();
	  const day: number = now.getDate();
	  const monthId: number = await this.getMonthId(now.getMonth() + 1, now.getFullYear());
	  
	  const found = await this.dayInfoRepository.findOne({where: {day, id: monthId}}); 
	  if(found)
	  	throw new GatewayTimeoutException("일일 데이터가 이미 있습니다");
	  const dayinfo = new DayInfo();
	  dayinfo.day = day;
	  //dayinfo.monthId = monthId;
	  dayinfo.type = this.getDayType(now);
	  dayinfo.todayWord = "뀨?";
	  dayinfo.attendUserCount = 0;
	  dayinfo.perfectUserCount = 0;
	  this.dayInfoRepository.create(dayinfo);
	  return this.dayInfoRepository.save(dayinfo);
  }

  async getDayInfo(day: number, month: number, year: number) {
	const monthId: number = await this.getMonthId(month + 1, year);
	return await this.dayInfoRepository.findOne({where: {day, id: monthId}})
  }

  async setToDayWord(toDayWord: string) {
	const now = new Date();
	const dayInfo = await this.getDayInfo(now.getDate(), now.getMonth(), now.getFullYear());
	dayInfo.todayWord = toDayWord;
	await this.dayInfoRepository.save(dayInfo)
  }

  async getDayId(day: number, month: number, year: number): Promise<number> {
    const monthId: number = await this.getMonthId(month, year);
    const dayInfo: DayInfo = await this.dayInfoRepository.findOne({where: {day, id: monthId}});
    return dayInfo.id;
  }

  /**************************************
   * 			util 함수 목록            *
   * ********************************* */ 

	getDayType(now: Date): number {
		const day: number = now.getDay();
		if (day <= 5)
			return (0);
		else
			return (1);
	}

  // DB table: Attendance
  async getUserDailyAttendance(intraId: string, day: number, month: number, year: number) {
    const userId: number = await this.getUserId(intraId);
    const dayId: number = await this.getDayId(day, month, year);

    return dayId; //tmp

    //const found: Attendance = await this.attendanceRepository.findOne({where: { id: dayId, userId: userId }});
    //return found;
  }
}
