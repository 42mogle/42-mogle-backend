import { Inject, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Cron } from '@nestjs/schedule';
import { MonthInfo } from './entities/month_info.entity';
import { DayInfo } from './entities/day_info.entity';
import { MonthlyUsers } from './entities/monthly_users.entity';
import { UpdateUserAttendanceDto } from '../operator/dto/updateUserAttendance.dto';
import { WinstonLogger, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { userInfo } from 'os';

@Injectable()
export class DbmanagerService {
	constructor(
		@InjectRepository(UserInfo) private usersRepository: Repository<UserInfo>,
		@InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>,
		@InjectRepository(MonthInfo) private monthInfoRepository: Repository<MonthInfo>,
		@InjectRepository(DayInfo) private dayInfoRepository: Repository<DayInfo>,
		@InjectRepository(MonthlyUsers) private monthlyUsersRepository: Repository<MonthlyUsers>,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: WinstonLogger,
	) { }

	/******************************************************
	 * todo: set in DbUserInfoManager
	 */
	async getUserInfo(intraId: string): Promise<UserInfo> {
		const found = await this.usersRepository.findOne({ where: { intraId } });
		return found;
	}

	async getAllUsersInfo(): Promise<UserInfo[]> {
		return await this.usersRepository.find();
	}

	/******************************************************
	 * todo: set in DbMonthAndDayInfoManager
	 */
	async saveMonthInfoTable(monthInfo: MonthInfo) {
		return (await this.monthInfoRepository.save(monthInfo));
	}

	async setAllDayInfosInThisMonth(monthInfo: MonthInfo, lastDatetimeInMonth: Date) {
		let dayType: number;
		let eachNewDayInfo: DayInfo;
		const totalDate: number = lastDatetimeInMonth.getDate();
		for(let eachDate = 1; eachDate <= totalDate; ++eachDate) {
			dayType = this.getDayType(new Date(monthInfo.year, monthInfo.month - 1, eachDate)); // search: how to be more efficient ?
			eachNewDayInfo = this.dayInfoRepository.create({
				day: eachDate,
				monthInfo: monthInfo,
				type: dayType,
				attendUserCount: 0,
				perfectUserCount: 0,
				todayWord: "뀨?", // todo: set In .env
			})
			await this.dayInfoRepository.save(eachNewDayInfo);
		}
		return ;
	}

	async setMonthInfoWithDayInfos(monthIndexed: number, year: number) {
		const lastDatetimeInMonth: Date = new Date(year, monthIndexed, 0);
		let newMonthInfo: MonthInfo = this.monthInfoRepository.create({
			month: monthIndexed + 1,
			year,
			currentAttendance: 0,
			totalAttendance: 20,
			perfectUserCount: 0,
			totalUserCount: 0,
		});
		newMonthInfo = await this.monthInfoRepository.save(newMonthInfo);
		await this.setAllDayInfosInThisMonth(newMonthInfo, lastDatetimeInMonth);
		return newMonthInfo;
	}

	// todo: implement getCountDayTypeWeekdayInThisMonth

	// todo: replace to setMonthInfoWithDayInfos
	async setMonthInfo() {
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth() + 1;
		const totaldate: number = new Date(year, month, 0).getDate(); // todo: consider what 0 means
		const foundThhisMonthInfo = await this.monthInfoRepository.findOne({ where: { year, month } });
		if (foundThhisMonthInfo) {
			throw new BadRequestException("이번달 데이터가 이미 있습니다.")
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

	// todo: replace to setAllDayInfosInThisMonth
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

	async getCountOfThisMonthCurrentAttendance(monthInfo: MonthInfo, currentDate: number): Promise<number> {
		const countOfThisMonthCurrentAttendance = await this.dayInfoRepository.count({
			where: {
				monthInfo,
				day: LessThanOrEqual(currentDate),
				type: 0,
			}
		});
		return countOfThisMonthCurrentAttendance;
	}

	async getCountOfThisMonthTotalAttendance(monthInfo: MonthInfo): Promise<number> {
		const countOfThisMonthTotalAttendance = await this.dayInfoRepository.count({
			where: {
				monthInfo,
				type: 0,
			}
		});
		return countOfThisMonthTotalAttendance;
	}

	async getMonthInfo(month: number, year: number): Promise<MonthInfo> {
		const monthInfo = await this.monthInfoRepository.findOne({
			where: {
				month,
				year,
			}
		});
		return monthInfo;
	}

	async getDayInfo(day: number, monthInfo: MonthInfo): Promise<DayInfo> {
		const dayInfo = await this.dayInfoRepository.findOne({ where: { day, monthInfo}});

		return dayInfo;
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

	/******************************************************
	 * todo: set in DbAttendanceManager
	 */
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

	async getAttendance(userInfo: UserInfo, dayInfo: DayInfo): Promise<Attendance> {
		return await this.attendanceRepository.findOneBy({ userInfo, dayInfo });
	}

	async setAttendance(userInfo: UserInfo, dayInfo: DayInfo, datetime: Date) {
		const attendanceToSet = this.attendanceRepository.create({
			timelog: datetime,
			userInfo,
			dayInfo
		});
		return await this.attendanceRepository.save(attendanceToSet);
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

	async getThisMonthDayList(monthInfo: MonthInfo): Promise<DayInfo[]>  {
		return await this.dayInfoRepository.findBy({monthInfo});
	}

	async getAttendanceList(userInfo: UserInfo): Promise<Attendance[]> {
		const monthinfo = await this.getThisMonthInfo();
		const dayInfo: DayInfo[] = await this.getThisMonthDayList(monthinfo);
		return await this.attendanceRepository.findBy({userInfo, dayInfo})
	}

	async getAttendanceListByMonthInfo(userInfo: UserInfo, monthInfo: MonthInfo): Promise<Attendance[]> {
		const dayInfo: DayInfo[] = await this.getThisMonthDayList(monthInfo)
		return await this.attendanceRepository.findBy({userInfo, dayInfo})
	}


	async getSpecificDayInfo(monthInfo: MonthInfo, day: number) {
		return await this.dayInfoRepository.findOneBy({monthInfo, day});
	}

	async getSpecificMonthInfo(year: number, month: number): Promise<MonthInfo> {
		return await this.monthInfoRepository.findOneBy({year, month});
	}

	async getCountFromAttendanceOfUserInMonth(userInfo: UserInfo, monthInfo: MonthInfo) {
		const countFromAttendanceOfUserInMonth = await this.attendanceRepository.count({
			relations: {
				dayInfo: true,
			},
			where: {
				userInfo,
				dayInfo: {
					monthInfo,
					type: 0, // todo: replace to normal_day
				}
			}
		});
		return countFromAttendanceOfUserInMonth;
	}

	/******************************************************
	 * todo: set in DbMonthlyUsersManager
	 */

	async getAllMonthlyUsersInMonth(monthInfo: MonthInfo) {
		const monthlyUsersInTheMonth = this.monthlyUsersRepository.find({
			select: {
				userInfo: {
					intraId: true,
				},
				totalPerfectCount: true,
				isPerfect: true,
				attendanceCount: true
			},
			relations: {
				userInfo: true,
			},
			where: {
				monthInfo,
			},
			//select: ['userInfo','totalPerfectCount','isPerfect'],
		});
		return monthlyUsersInTheMonth;
		
	}

	async getCountOfTotalThisMonthlyUsers(monthInfo: MonthInfo) {
		const countOfTotalThisMonthlyUsers = await this.monthlyUsersRepository.count({
			where: {
				monthInfo,
			}
		});
		return countOfTotalThisMonthlyUsers;
	}

	async getCountOfPerfectThisMonthlyUsers(monthInfo: MonthInfo) {
		const countOfTotalThisMonthlyUsers = await this.monthlyUsersRepository.count({
			where: {
				monthInfo,
				isPerfect: true,
			}
		});
		return countOfTotalThisMonthlyUsers;
	}

	async getThisMonthlyUser(userInfo: UserInfo): Promise<MonthlyUsers> {
		const monthInfo: MonthInfo = await this.getThisMonthInfo();
		return await this.monthlyUsersRepository.findOneBy({userInfo, monthInfo});
	}

	async getMonthlyUser(userInfo: UserInfo, monthInfo: MonthInfo) {
		return await this.monthlyUsersRepository.findOneBy({userInfo, monthInfo})
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

	async createMonthlyUserByMonthInfo(userInfo: UserInfo, monthInfo: MonthInfo): Promise<MonthlyUsers> {
		const monthlyUser = this.monthlyUsersRepository.create({
			attendanceCount: 0,
			isPerfect: false,
			totalPerfectCount: 0,
			monthInfo: monthInfo,
			userInfo: userInfo
		})
		await this.monthlyUsersRepository.save(monthlyUser)
		return monthlyUser
	}

	// todo: set async and await
	updateMonthlyUser(monthlyUser: MonthlyUsers, date: Date) {
		this.updateMonthlyUserAttendanceCount(monthlyUser, date);
	}

	updateMonthlyUserAttendanceCount(monthlyuser: MonthlyUsers, date: Date) {
		if (!this.isWeekend(date))
		{
			monthlyuser.attendanceCount += 1;
			// todo: save랑 update 둘 중에 하나만 하기 : 일단 save지워봤습니다
			this.monthlyUsersRepository.update(monthlyuser.id, {
				attendanceCount: monthlyuser.attendanceCount,
			});
		}
	}

	async getThisMonthStatus(userInfo: UserInfo) {
		return await this.getThisMonthlyUser(userInfo);
	}

	async getSpecificMonthlyuserInfo(monthInfo: MonthInfo, userInfo: UserInfo): Promise<MonthlyUsers> {
		return await this.monthlyUsersRepository.findOneBy({monthInfo, userInfo})
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

	async attendanceLogAdd(userInfo: UserInfo, dayInfo: DayInfo ,date: Date) {
		const attendanceinfo = this.attendanceRepository.create(
			{
				timelog: date,
				userInfo,
				dayInfo
			}
		)
		return await this.attendanceRepository.save(attendanceinfo);
	}

	/**************************************
	 * 			util 함수 목록            *
	 * ********************************* */

	// todo: to use day_info enum
	getDayType(now: Date): number {
		const day: number = now.getDay();
		if (day !== 0 && day !== 6)
			return (0);
		else
			return (1);
	}

	isWeekend(date: Date): boolean {
		if (date.getDay() === 6 || date.getDay() === 0)
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

	
	async updateAtendanceInfo(userInfo: UserInfo, dayInfo: DayInfo, InfoDto: UpdateUserAttendanceDto) {
		const timelog = new Date(InfoDto.year, InfoDto.month - 1, InfoDto.day, 8, 30, 0);
		const userAttendance = this.attendanceRepository.create({
			userInfo,
			dayInfo,
			timelog,
		});
		await this.attendanceRepository.save(userAttendance);
	}

	async getAllDayInfo(monthInfo: MonthInfo) {
		return this.dayInfoRepository.findBy({monthInfo})
	}
}
