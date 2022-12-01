import { All, BadRequestException, GatewayTimeoutException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { Repository, ReturningStatementNotSupportedError } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Cron, Interval } from '@nestjs/schedule';
import { MonthInfo } from './entities/month_info.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { DayInfo } from './entities/day_info.entity';
import { userInfo } from 'os';
import * as request from 'supertest';
import { MonthlyUsers } from './entities/monthly_users.entity';
import { UpdateUserAttendanceDto } from '../operator/dto/updateUserAttendance.dto';
import { create } from 'domain';

@Injectable()
export class DbmanagerService {
	constructor(
		@InjectRepository(UserInfo) private usersRepository: Repository<UserInfo>,
		@InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>,
		@InjectRepository(MonthInfo) private monthInfoRepository: Repository<MonthInfo>,
		@InjectRepository(DayInfo) private dayInfoRepository: Repository<DayInfo>,
		@InjectRepository(MonthlyUsers) private monthlyUsersRepository: Repository<MonthlyUsers> 
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
			isOperator: false,
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

	async getUserInfoByUserId(userId: number) {
		return await this.usersRepository.findOneBy({ id: userId })
	}

	// DB table: MonthInfo
	async setMonthInfo() {
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth() + 1;
		const totalAttendance = new Date(year, month, 0).getDate(); //bolck
		const found = await this.monthInfoRepository.findOne({ where: { year, month } });
		if (found)
			throw "이번달 데이터가 이미 있습니다.";
		const monthInfo = this.monthInfoRepository.create({
			year: year,
			month: month,
			failUserCount: 0,
			totalAttendance: totalAttendance,
			currentAttendance: 0,
			perfectUserCount: 0,
		})
		await this.monthInfoRepository.save(monthInfo);
		this.setAllDayInfo(monthInfo);
	}

	async setAllDayInfo(monthInfo: MonthInfo) {
		for(let i = 1; i <= monthInfo.totalAttendance; i++) {
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
		this.monthInfoRepository.update(monthInfo.id, {
			totalAttendance: 20
		})
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
		const ret = found.todayWord;
		console.log("todayWord in server:", ret);
		return ret;
	}

	//setTotalMonthInfo
	async setTotalMonthInfo(intra_id: string) {
		if (!this.isAdmin(intra_id)) {
			return "permission denied";
		}
		this.setMonthInfo();
	}

	@Cron('0 0 1 1 * *')
	setTotalMonthcron() {
		this.setMonthInfo();
	}

	async getThisMonthInfo() {
		const now = new Date();
		return (await this.monthInfoRepository.findOneBy({month: now.getMonth() + 1, year: now.getFullYear()}));

	}

	async getThisMonthlyUser(intraId: string) {
		const userInfo: UserInfo = await this.getUserInfo(intraId);
		const monthInfo: MonthInfo = await this.getThisMonthInfo();
		return await this.monthlyUsersRepository.findOneBy({userInfo, monthInfo});
	}

	async createMonthlyUser(intraId: string): Promise<MonthlyUsers> {
		const monthInfo = await this.getThisMonthInfo();
		const userInfo = await this.getUserInfo(intraId);
		const monthlyUser = this.monthlyUsersRepository.create({
			attendanceCount: 0,
			isPerfect: true,
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

	async getAttendanceListByintraId(intraId: string): Promise<Attendance[]> {
		const userInfo = await this.getUserInfo(intraId);
		const monthinfo = await this.getThisMonthInfo();
		const dayInfo: DayInfo[] = await this.getThisMonthDayList(monthinfo);
		return await this.attendanceRepository.findBy({userInfo, dayInfo})
	}

	updateMonthlyUser(monthlyUser: MonthlyUsers) {
		this.updateMonthlyUserAttendanceCount(monthlyUser);
		//this.updateMonthlyUserPerfectInfo(monthlyUser);
	}



	updateMonthlyUserAttendanceCount(monthlyuser: MonthlyUsers) {

		if (!this.isWeekend())
		{
			monthlyuser.attendanceCount += 1;
			this.monthlyUsersRepository.save(monthlyuser);
			this.monthlyUsersRepository.update(monthlyuser.id, {
				attendanceCount: monthlyuser.attendanceCount,
			});
		}
	}

	async getThisMonthStatus(intraId: string) {
		return await this.getThisMonthlyUser(intraId);
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

	async getAllMonthlyUser(allUserInfo: UserInfo[], monthInfo: MonthInfo) {
		return await this.monthlyUsersRepository.findBy({userInfo: allUserInfo, monthInfo});
	}

	updateAttendanceCountThisMonth(monthlyuser: MonthlyUsers) {
		monthlyuser.attendanceCount += 1;
		this.monthlyUsersRepository.update(monthlyuser.id, {
			attendanceCount: monthlyuser.attendanceCount
		})
	}

	updateAtendanceInfo(userInfo: UserInfo, dayInfo: DayInfo, InfoDto: UpdateUserAttendanceDto) {
		const timelog = new Date(InfoDto.year, InfoDto.month - 1, InfoDto.day, 8, 30, 0);
		const userAttendance = this.attendanceRepository.create({
			userInfo,
			dayInfo,
			timelog,
		});
		this.attendanceRepository.save(userAttendance);
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

 	async isAdmin(intraId: string): Promise<boolean> {
		const user: UserInfo = await this.usersRepository.findOneBy({intraId});
		if(user.isOperator)
			return (true);
		else
			return (false);
	}

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

	async createMockUp() {
		const intraId: string[] = ["minsukan", "joonhan", "samin", "mgo", "susong"]
		const passWord: string = "42mogle";
		///
		intraId.forEach( (user) => {
			const abc = this.usersRepository.create({
				intraId: user,
				password: passWord,
				isOperator: true,
			})
			this.usersRepository.save(abc);
		})
		

		this.setTotalMonthInfo("minsuakn");
		const monthInfo: MonthInfo = await this.getThisMonthInfo();
		const dayinfo: DayInfo[] = await this.getAllDayInfo(monthInfo);
		const allUserInfo: UserInfo[] = await this.getAllUsersInfo();
		allUserInfo.forEach((user) => {
			let i = 1;
			dayinfo.forEach((dayInfo) => {
				const date = new Date(2022, 11, i, 8, 30);
				this.attendanceRepository.create({
					timelog: date,
					userInfo: user,
					dayInfo: dayInfo
				})
				i++;
			})
		})
	 }

	 async atc(intraId: string, num: number) {
		const userInfo: UserInfo = await this.getUserInfo(intraId);
		const monthInfo: MonthInfo = await this.getThisMonthInfo();
		const monthly: MonthlyUsers = await this.getThisMonthlyUser(intraId);
		monthly.attendanceCount = num;
		this.monthlyUsersRepository.save(monthly);
	 }


}
