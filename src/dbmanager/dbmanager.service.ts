import { ForbiddenException, GatewayTimeoutException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDbmanagerDto } from './dto/create-dbmanager.dto';
import { UpdateDbmanagerDto } from './dto/update-dbmanager.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/dbmanager/entities/user.entity';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Cron, Interval } from '@nestjs/schedule';
import { MonthInfo } from './entities/month.info.entity';
import { NotFoundError, sample } from 'rxjs';
import { DayInfo } from './entities/day.info.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class DbmanagerService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
	@InjectRepository(MonthInfo) private monthRepository: Repository<MonthInfo>,
	@InjectRepository(DayInfo) private dayInfoRepository: Repository<DayInfo>,
	@InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>
  ) {}

  async findUser(intraId: string) {
    const found = await this.usersRepository.findOne({where: { intraId }});

    return found;
  }

  createUser(createUserDto: CreateUserDto) {
    console.log(createUserDto);
    const user = new User();
    user.intraId = createUserDto.intraId;
    user.password = createUserDto.password;
    user.isAdmin = false;
    user.photoURL = "abc";
    this.usersRepository.create(user);
    return this.usersRepository.save(user);
  }

  create(createDbmanagerDto: CreateDbmanagerDto) {
    return 'This action adds a new dbmanager';
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} dbmanager`;
  }

  update(id: number, updateDbmanagerDto: UpdateDbmanagerDto) {
    return `This action updates a #${id} dbmanager`;
  }

  remove(id: number) {
    return `This action removes a #${id} dbmanager`;
  }

  //findMonthInfo(year: number, month: number)
  

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
	monthinfo.failUserCount = 0;
	monthinfo.totalAttendance = 0;
	monthinfo.perfcetUserCount = 0;
	this.monthRepository.create(monthinfo);
	return this.monthRepository.save(monthinfo);
  }

  async getMonthId(month: number, year: number): Promise<number> {
	const monthinfo = await this.monthRepository.findOne({where: {month, year}});
	console.log(month, year);
	return await monthinfo.monthId;
  }

  async setDayInfo() {
	  const now: Date = new Date();
	  const day: number = now.getDate();
	  const monthId: number = await this.getMonthId(now.getMonth() + 1, now.getFullYear());

	  const found = await this.dayInfoRepository.findOne({ where: { day, monthId } });
	  if (found)
		  throw new GatewayTimeoutException("일일 데이터가 이미 있습니다");

	  const dayinfo = this.dayInfoRepository.create({
		  day: day,
		  monthId: monthId,
		  type: this.getDayType(now),
		  today_word: "뀨?",
		  attendUserCount: 0,
		  perfectUserCount: 0
	  });
	  return this.dayInfoRepository.save(dayinfo);
  }

  async getDayInfo(day: number, month: number, year: number) {
	const monthId: number = await this.getMonthId(month + 1, year);
	return await this.dayInfoRepository.findOne({where: { day, monthId }})
  }

  async setToDayWord(toDayWord: string) {
	const now = new Date();
	const dayInfo = await this.getDayInfo(now.getDate(), now.getMonth(), now.getFullYear());
	dayInfo.today_word = toDayWord;
	await this.dayInfoRepository.save(dayInfo)
  }

	async getUserId(intraId: string): Promise<number> {
		const found = await this.usersRepository.findOne({where: { intraId }});
		return found.userId;
	}

	async getDayId() {
		const now = new Date();
		const day = now.getDate();
		const monthId: number = await this.getMonthId(now.getMonth() + 1, now.getFullYear());
		const found = await this.dayInfoRepository.findOne({where: {day, monthId}})
		return found.dayId;
	}

	async	attendanceRegistration(attendinfo: CreateAttendanceDto) {
		const now = new Date();
		const userId = await this.getUserId(attendinfo.intraId);
		const dayId = await this.getDayId();
		const attendanceinfo = this.attendanceRepository.create(
			{
				time_log: now,
				user_id: userId,
				day_id: dayId
			}
		)
		return await this.attendanceRepository.save(attendanceinfo);
  }

  async getAttendanceUserInfo(user_id: number, day_id: number): Promise<Attendance> {
	return await this.attendanceRepository.findOne({where: {user_id, day_id}});
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
}
