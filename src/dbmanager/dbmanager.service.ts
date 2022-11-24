import { GatewayTimeoutException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Cron, Interval } from '@nestjs/schedule';
import { MonthInfo } from './entities/month_info.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { DayInfo } from './entities/day_info.entity';
import { userInfo } from 'os';

@Injectable()
export class DbmanagerService {
	constructor(
		@InjectRepository(UserInfo) private usersRepository: Repository<UserInfo>,
		@InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>,
		@InjectRepository(MonthInfo) private monthRepository: Repository<MonthInfo>,
		@InjectRepository(DayInfo) private dayInfoRepository: Repository<DayInfo>
	) { }

	// DB table: User
	async getUserInfo(intraId: string): Promise<UserInfo> {
		const found = await this.usersRepository.findOne({ where: { intraId } });

		return found;
	}

	createUser(createUserDto: CreateUserDto) {
		const user = this.usersRepository.create({
			intraId: createUserDto.intraId,
			password: createUserDto.password,
			isAdmin: false,
			photoUrl: "minsu!!",
		});
		return this.usersRepository.save(user);
	}

	async findAll(): Promise<UserInfo[]> {
		return await this.usersRepository.find();
	}

	async getUserId(intraId: string) {
		const user = await this.usersRepository.findOne({ where: { intraId } });
		return user.id;
	}

	//findMonthInfo(year: number, month: number)

	// DB table: MonthInfo
	async setMonthInfo(): Promise<MonthInfo> {
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth() + 1;
		const found = await this.monthRepository.findOne({ where: { year, month } });
		if (found)
			throw new NotFoundException("이미 있슴;;");
		const monthInfo = this.monthRepository.create({
			year: year,
			month: month,
			failUserCount: 0,
			totalAttendance: 0,
			perfectUserCount: 0,
		})
		return this.monthRepository.save(monthInfo);
	}

	async getMonthInfo(month: number, year: number): Promise<MonthInfo> {
		const monthInfo = await this.monthRepository.findOne({ where: { month, year } });

		return monthInfo;
	}

	// DB table: DayInfo
	async setDayInfo() {
		const now: Date = new Date();
		const day: number = now.getDate();
		const monthInfo: MonthInfo = await this.getMonthInfo(now.getMonth() + 1, now.getFullYear());

		const found = await this.dayInfoRepository.findOneBy({
			day,
			monthInfo
		});
		if (found)
			throw new GatewayTimeoutException("일일 데이터가 이미 있습니다");

		const dayInfo = this.dayInfoRepository.create({
			day: day,
			type: this.getDayType(now),
			todayWord: "뀨?",
			attendUserCount: 0,
			perfectUserCount: 0,
			monthInfo,
		});
		return this.dayInfoRepository.save(dayInfo);
	}

	async getDayInfo() {
		const now = new Date();
		const day = now.getDate();
		const month = now.getMonth() + 1;
		const year = now.getFullYear();
		const monthInfo: MonthInfo = await this.getMonthInfo(month + 1, year);
		return await this.dayInfoRepository.findOneBy({ day, monthInfo })
	}

	async setToDayWord(toDayWord: string) {
		const now = new Date();
		const dayInfo = await this.getDayInfo();
		dayInfo.todayWord = toDayWord;
		await this.dayInfoRepository.save(dayInfo)
	}

	async attendanceRegistration(attendinfo: CreateAttendanceDto) {
		const now = new Date();
		const userInfo: UserInfo = await this.getUserInfo(attendinfo.intraId);
		const dayInfo: DayInfo = await this.getDayInfo();
		const attendanceinfo = this.attendanceRepository.create(
			{
				timelog: now,
				userInfo,
				dayInfo
			}
		)
		return await this.attendanceRepository.save(attendanceinfo);
	}

	async getAttendanceUserInfo(userInfo: UserInfo, dayInfo: DayInfo): Promise<Attendance> {
		return await this.attendanceRepository.findOneBy({ userInfo, dayInfo }); // using userInfo, dayInfo
	}

	async getToDayWord(): Promise<string> {
		const found: DayInfo = await this.getDayInfo();
		return found.todayWord;
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
