import { All, BadRequestException, GatewayTimeoutException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Cron } from '@nestjs/schedule';
import { MonthInfo } from './entities/month_info.entity';
import { DayInfo } from './entities/day_info.entity';
import { MonthlyUsers } from './entities/monthly_users.entity';
import { UpdateUserAttendanceDto } from '../operator/dto/updateUserAttendance.dto';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';

@Injectable()
export class DbmanagerService {
	constructor(
		@InjectRepository(UserInfo) private usersRepository: Repository<UserInfo>,
		@InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>,
		@InjectRepository(MonthInfo) private monthInfoRepository: Repository<MonthInfo>,
		@InjectRepository(DayInfo) private dayInfoRepository: Repository<DayInfo>,
		@InjectRepository(MonthlyUsers) private monthlyUsersRepository: Repository<MonthlyUsers>,
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
	) { }

	// DB table: User
	async getUserInfo(intraId: string): Promise<UserInfo> {
		const found = await this.usersRepository.findOne({ where: { intraId } });

		return found;
	}


	// DB table: MonthInfo
	async setMonthInfo() {
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth() + 1;
		const totaldate: number = new Date(year, month, 0).getDate(); // todo: consider what 0 means
		const foundThhisMonthInfo = await this.monthInfoRepository.findOne({ where: { year, month } });
		if (foundThhisMonthInfo) {
			throw "이번달 데이터가 이미 있습니다.";
		}
		const monthInfo = this.monthInfoRepository.create({
			year: year,
			month: month,
			totalUserCount: 0,
			totalAttendance: 20,
			currentAttendance: 0,
			perfectUserCount: 0,
		})
		await this.monthInfoRepository.save(monthInfo);
		this.setAllDayInfo(monthInfo, totaldate);
	}

	async setAllDayInfo(monthInfo: MonthInfo, totaldate: number) {
		for(let i = 1; i <= totaldate; i++) {
			const type = this.getDayType(new Date(monthInfo.year, monthInfo.month - 1, i));
			const dayInfo = this.dayInfoRepository.create({
				day: i,
				monthInfo: monthInfo,
				attendUserCount: 0,
				type: type,
				perfectUserCount: 0,
				todayWord: "뀨?",
			})
			await this.dayInfoRepository.save(dayInfo);
		}
	}

	async upDateThisMonthCurrentAttendance() {
		const monthInfo: MonthInfo = await this.getThisMonthInfo();
		monthInfo.currentAttendance += 1;
		this.monthInfoRepository.update(monthInfo.id, {
			currentAttendance: monthInfo.currentAttendance,
		});
	}

	async getMonthInfo(month: number, year: number): Promise<MonthInfo> {
		const monthInfo = await this.monthInfoRepository.findOne({ where: { month, year } });

		return monthInfo;
	}

	async getTodayInfo() {
		const now = new Date();
		const day = now.getDate();
		const month = now.getMonth() + 1;
		const year = now.getFullYear();
		const monthInfo: MonthInfo = await this.getMonthInfo(month, year); // todo: check null
		return await this.dayInfoRepository.findOneBy({ day, monthInfo }) // todo: check null
	}

	async setTodayWord(toDayWord: string) {
		const dayInfo = await this.getTodayInfo();
		dayInfo.todayWord = toDayWord;
		await this.dayInfoRepository.save(dayInfo)
	}

	async attendanceRegistration(userInfo: UserInfo) {
		const now = new Date();
		const dayInfo: DayInfo = await this.getTodayInfo();
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
		return await this.attendanceRepository.findOneBy({ userInfo, dayInfo });
	}

	async getTodayWord(): Promise<string> {
		const todayInfo: DayInfo = await this.getTodayInfo();
		const retTodayWord = todayInfo.todayWord;
		return retTodayWord;
	}

	//setTotalMonthInfo
	async setTotalMonthInfo(userInfo: UserInfo) {
		if (userInfo.isOperator === false) {
			throw new UnauthorizedException("Not Operator");
		}
		console.log("The operator start setMonthInfo()");
		this.setMonthInfo();
	}

	@Cron('0 0 1 1 * *')
	setTotalMonthcron() {
		this.logger.debug("setTotalMonthcron test")
		this.setMonthInfo();
	}

	async getThisMonthInfo() {
		const now = new Date();
		return (await this.monthInfoRepository.findOneBy({month: now.getMonth() + 1, year: now.getFullYear()}));

	}

	async getThisMonthlyUser(userInfo: UserInfo): Promise<MonthlyUsers> {
		const monthInfo: MonthInfo = await this.getThisMonthInfo();
		return await this.monthlyUsersRepository.findOneBy({userInfo, monthInfo});
	}

	async createMonthlyUser(userInfo: UserInfo): Promise<MonthlyUsers> {
		const monthInfo = await this.getThisMonthInfo();
		const monthlyUser = this.monthlyUsersRepository.create({
			attendanceCount: 0,
			isPerfect: false,
			totalPerfectCount: 0,
			monthInfo: monthInfo,
			userInfo: userInfo
		})
		await this.monthlyUsersRepository.save(monthlyUser);
		return (monthlyUser)
	}

	async getThisMonthDayList(monthInfo: MonthInfo): Promise<DayInfo[]>  {
		return await this.dayInfoRepository.findBy({monthInfo});
	}

	async getAttendanceList(userInfo: UserInfo): Promise<Attendance[]> {
		const monthinfo = await this.getThisMonthInfo();
		const dayInfo: DayInfo[] = await this.getThisMonthDayList(monthinfo);
		return await this.attendanceRepository.findBy({userInfo, dayInfo})
	}

	updateMonthlyUser(monthlyUser: MonthlyUsers) {
		this.updateMonthlyUserAttendanceCount(monthlyUser);
	}



	updateMonthlyUserAttendanceCount(monthlyuser: MonthlyUsers) {

		if (!this.isWeekend())
		{
			monthlyuser.attendanceCount += 1;
			// todo: save랑 update 둘 중에 하나만 하기
			this.monthlyUsersRepository.save(monthlyuser);
			this.monthlyUsersRepository.update(monthlyuser.id, {
				attendanceCount: monthlyuser.attendanceCount,
			});
		}
	}

	async getThisMonthStatus(userInfo: UserInfo) {
		return await this.getThisMonthlyUser(userInfo);
	}

	async getSpecificDayInfo(monthInfo: MonthInfo, day: number) {
		return await this.dayInfoRepository.findOneBy({monthInfo, day});
	}

	async getSpecificMonthInfo(year: number, month: number): Promise<MonthInfo> {
		return await this.monthInfoRepository.findOneBy({year, month});
	}

	async getSpecificMonthlyuserInfo(monthInfo: MonthInfo, userInfo: UserInfo): Promise<MonthlyUsers> {
		return await this.monthlyUsersRepository.findOneBy({monthInfo, userInfo})
	}

	async getAllUsersInfo(): Promise<UserInfo[]> {
		return await this.usersRepository.find();
	}

	// todo: consider for only using MonthInfo
	async getAllMonthlyUser(allUserInfo: UserInfo[], monthInfo: MonthInfo) {
		return await this.monthlyUsersRepository.findBy({userInfo: allUserInfo, monthInfo});
	}

	async updateAttendanceCountThisMonth(monthlyuser: MonthlyUsers) {
		monthlyuser.attendanceCount += 1;
		await this.monthlyUsersRepository.update(monthlyuser.id, {
			attendanceCount: monthlyuser.attendanceCount
		})
	}

	async updateAtendanceInfo(userInfo: UserInfo, dayInfo: DayInfo, InfoDto: UpdateUserAttendanceDto) {
		const timelog = new Date(InfoDto.year, InfoDto.month - 1, InfoDto.day, 8, 30, 0);
		const userAttendance = this.attendanceRepository.create({
			userInfo,
			dayInfo,
			timelog,
		});
		await this.attendanceRepository.save(userAttendance);
	}

	changeIsPerfect(monthlyUserInfo: MonthlyUsers, status: boolean) {
		this.monthlyUsersRepository.update(monthlyUserInfo.id, {
			isPerfect: status
		})
	}

	async updateThisMonthCurrentCount() {
		const monthInfo: MonthInfo = await this.getThisMonthInfo();
		this.monthInfoRepository.update(monthInfo.id, {
			currentAttendance: monthInfo.currentAttendance + 1
		})
	}

	/**************************************
	 * 			util 함수 목록            *
	 * ********************************* */

	getDayType(now: Date): number {
		const day: number = now.getDay();
		if (day !== 0 && day !== 6)
			return (0);
		else
			return (1);
	}

	isWeekend(): boolean {
		const Today = new Date();
		if (Today.getDay() === 6 || Today.getDay() === 0)
			return true;
		else
			return false;
	}

	getTodayType(): number {
		const Today = new Date();
		return Today.getDay();
	}

	/**************************************
	 * 			test 함수 목록            *
	 * ********************************* */

	async getAllDayInfo(monthInfo: MonthInfo) {
		return this.dayInfoRepository.findBy({monthInfo})
	}
}
