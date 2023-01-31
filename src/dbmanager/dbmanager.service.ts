import { Inject, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { Between, LessThan, LessThanOrEqual, Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Cron } from '@nestjs/schedule';
import { MonthInfo } from './entities/month_info.entity';
import { DayInfo } from './entities/day_info.entity';
import { MonthlyUsers } from './entities/monthly_users.entity';
import { UpdateUserAttendanceDto } from '../operator/dto/updateUserAttendance.dto';
import { WinstonLogger, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UserBasicInfo } from 'src/auth/dto/userInfo.dto';

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
	async createAndSaveUserInfo(intraIdAndPhotoUrl: UserBasicInfo) {
		const defaultImage: string =
			"https://i.ytimg.com/vi/AwrFPJk_BGU/maxresdefault.jpg";
		const newUserInfo: UserInfo = this.usersRepository.create({
		  intraId: intraIdAndPhotoUrl.intraId,
		  password: null,
		  isOperator: false,
		  photoUrl: (intraIdAndPhotoUrl.photoUrl === null ? 
			defaultImage : intraIdAndPhotoUrl.photoUrl),
		  isSignedUp: false,
		});
		return (await this.usersRepository.save(newUserInfo));
	}

	async getUserInfo(intraId: string): Promise<UserInfo> {
		const found = await this.usersRepository.findOne({ where: { intraId } });
		return found;
	}

	async getAllUsersInfo(): Promise<UserInfo[]> {
		return await this.usersRepository.find();
	}

	async getUserInfoByMonthlyUser(monthlyUser: MonthlyUsers) {
		const joinedMonthlyUserWithUserInfo = await this.monthlyUsersRepository.findOne({
			relations: {
				userInfo: true,
			},
			where: {
				id: monthlyUser.id,
			}
		});
		const userInfo: UserInfo = await this.usersRepository.findOne({
			where: {
				id: joinedMonthlyUserWithUserInfo.userInfo.id,
			}
		});
		return userInfo;
	}

	async saveUserInfo(userInfo: UserInfo) {
		return (await this.usersRepository.save(userInfo));
	}

	async updateUserInfoPassword(userInfo: UserInfo, encryptedPassword: string) {
		await this.usersRepository.update(userInfo.id, {
			password: encryptedPassword,
		});
		return userInfo;
	}

	/******************************************************
	 * todo: set in DbMonthAndDayInfoManager
	 */
	async getMonthInfoByMonthlyUser(monthlyUser: MonthlyUsers) {
		const joinedMonthlyUserWithMonthInfo = await this.monthlyUsersRepository.findOne({
			relations: {
				monthInfo: true,
			},
			where: {
				id: monthlyUser.id,
			}
		});
		const monthInfo = await this.monthInfoRepository.findOne({
			where: {
				id: joinedMonthlyUserWithMonthInfo.monthInfo.id
			}
		});
		return monthInfo;
	}

	async getFirstWeekdayDayInfoInAMonth(monthInfo: MonthInfo) {
		const firstDayInfoInAMonth = await this.dayInfoRepository.findOne({
			where: {
				monthInfo,
				type: 0,
			}
		});
		return firstDayInfoInAMonth;
	}

	async getADayInfoHavingSpecificDay(monthInfo: MonthInfo, specificDay: number) {
		const dayInfoHavingSpecificDay = await this.dayInfoRepository.findOne({
			where: {
				monthInfo,
				day: specificDay,
			}
		});
		return dayInfoHavingSpecificDay;
	}

	async getMonthInfoByDayInfo(dayInfo: DayInfo) {
		const joinedDayInfoWithMonthInfo = await this.dayInfoRepository.findOne({
			relations: {
				monthInfo: true,
			},
			where: {
				id: dayInfo.id,
			}
		});
		const monthInfo: MonthInfo = await this.monthInfoRepository.findOne({
			where: {
				id: joinedDayInfoWithMonthInfo.monthInfo.id,
			}
		});
		return monthInfo;
	}

	async getDayInfoListSameMonthWeek(dayInfo: DayInfo): Promise<DayInfo[]> {
		const monthInfoThisDay: MonthInfo = await this.getMonthInfoByDayInfo(dayInfo);
		const datetimeThisDay = new Date(
			monthInfoThisDay.year, monthInfoThisDay.month - 1, dayInfo.day, 9, 0, 0
		);
		let dayType: number = datetimeThisDay.getDay();
		if (dayType === 0)
			dayType = 7;
		let firstDateThisWeek: number = dayInfo.day - (dayType - 1); // 여기서는 월요일을 한주의 시작으로 생각한다.
		if (firstDateThisWeek < 1) {
			firstDateThisWeek = 1;
		}
		const lastDateThisWeek: number = dayInfo.day + (7 - dayType);
		const dayInfoList = await this.dayInfoRepository.find({
			where: {
				day: Between(firstDateThisWeek, lastDateThisWeek), // Between은 인자들을 포함한다.
				monthInfo: monthInfoThisDay,
			},
			order: {
				day: "ASC",
			}
		});
		return dayInfoList;
	}

	async saveMonthInfoTable(monthInfo: MonthInfo) {
		return (await this.monthInfoRepository.save(monthInfo));
	}

	async setAllDayInfosInThisMonth(monthInfo: MonthInfo, lastDatetimeInMonth: Date) {
		let dayType: number;
		let eachNewDayInfo: DayInfo;
		const totalDate: number = lastDatetimeInMonth.getDate();
		for(let eachDate = 1; eachDate <= totalDate; ++eachDate) {
			dayType = this.getDayType(new Date(monthInfo.year, monthInfo.month - 1, eachDate));
			eachNewDayInfo = this.dayInfoRepository.create({
				day: eachDate,
				monthInfo: monthInfo,
				type: dayType,
				attendUserCount: 0,
				perfectUserCount: 0,
				todayWord: process.env.TODAY_WORD || "뀨?",
			})
			await this.dayInfoRepository.save(eachNewDayInfo);
		}
		return ;
	}

	async setMonthInfoWithDayInfos(monthNotIndexed: number, year: number) {
		let newMonthInfo: MonthInfo = this.monthInfoRepository.create({
			month: monthNotIndexed,
			year,
			currentAttendance: 0,
			totalAttendance: 20,
			perfectUserCount: 0,
			totalUserCount: 0,
		});
		newMonthInfo = await this.monthInfoRepository.save(newMonthInfo);
		const lastDatetimeInMonth: Date = new Date(year, monthNotIndexed, 0);
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
				todayWord: process.env.TODAY_WORD || "뀨?",
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
	//attendanceRegistration
	async attendanceRegistration(userInfo: UserInfo, currDatetime: Date) {
		const dayInfo: DayInfo = await this.getTodayInfo();
		const attendanceinfo = this.attendanceRepository.create({
			timelog: currDatetime,
			userInfo,
			dayInfo
		});
		return await this.attendanceRepository.save(attendanceinfo);
	}

	async getAttendance(userInfo: UserInfo, dayInfo: DayInfo): Promise<Attendance> {
		return await this.attendanceRepository.findOneBy({ userInfo, dayInfo });
	}

	async getCountOfWeekdayAttendancesOfAUserInAMonth(monthlyUser: MonthlyUsers): Promise<number> {
		const userInfo: UserInfo = await this.getUserInfoByMonthlyUser(monthlyUser);
		const monthInfo: MonthInfo = await this.getMonthInfoByMonthlyUser(monthlyUser);
		const countOfWeekdayAttendancesOfAUserInAMonth: number = await this.attendanceRepository.count({
			relations: {
				dayInfo: true,
			},
			where: {
				userInfo,
				dayInfo: {
					monthInfo,
					type: 0,
				}
			}
		});
		return countOfWeekdayAttendancesOfAUserInAMonth;
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

	@Cron('0 1 0 1 * *')
	setTotalMonthcron() {
		//this.logger.debug("setTotalMonthcron test")
		//this.setMonthInfo();
		this.logger.log("pid = " + process.pid, "check setTotalMonthCron");
		const currDatetime = new Date();
		let monthNotIndexed = currDatetime.getMonth() + 1;
		const year = currDatetime.getFullYear();
		this.setMonthInfoWithDayInfos(monthNotIndexed, year);
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
	async updateMonthlyUserAttendanceCount(monthlyUser: MonthlyUsers, attendanceCount: number) {
		return (await this.monthlyUsersRepository.update(monthlyUser.id, {
			attendanceCount,
		}));
	}

	async updateMonthlyUserPerfectStatus(monthlyUser: MonthlyUsers, isPerfect: boolean) {
		await this.monthlyUsersRepository.update(monthlyUser.id, {
			isPerfect,
		});
		return monthlyUser;
	}

	updateMonthlyUserTotalPerfectCount(monthlyUser: MonthlyUsers, totalPerfectCount: number) {
		this.monthlyUsersRepository.update(monthlyUser.id, {
			totalPerfectCount,
		});
		return ;
	}

	async getAllMonthlyUsersInAMonth(monthInfo: MonthInfo): Promise<MonthlyUsers[]> {
		const allMonthlyUsersInAMonth: MonthlyUsers[] = await this.monthlyUsersRepository.find({
			where: {
				monthInfo,
			}
		});
		return allMonthlyUsersInAMonth;
	}

	async getAllMonthlyUsersInMonthWithIntraId(monthInfo: MonthInfo) {
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

	async getMonthlylUsersOfAUserInLastMonthes(userInfo: UserInfo, currMonthInfo: MonthInfo) {
		const lastYearMonthlyUser = await this.monthlyUsersRepository.find({
			relations: {
				//userInfo: true,
				monthInfo: true,
			},
			where: {
				userInfo: userInfo,
				monthInfo: {
					year: LessThan(currMonthInfo.year),
				}
			}
		});
		const lastMonthSameYearMonthlyUser = await this.monthlyUsersRepository.find({
			relations: {
				//userInfo: true,
				monthInfo: true,
			},
			where: {
				userInfo: userInfo,
				monthInfo: {
					year: currMonthInfo.year,
					month: LessThan(currMonthInfo.month),
				}
			}
		});
		const ret = lastYearMonthlyUser.concat(lastMonthSameYearMonthlyUser);
		return ret;
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

	async saveMonthlyUser(monthlyUser: MonthlyUsers): Promise<MonthlyUsers> {
		return (await this.monthlyUsersRepository.save(monthlyUser));
	}

	async getThisMonthlyUser(userInfo: UserInfo): Promise<MonthlyUsers> {
		const monthInfo: MonthInfo = await this.getThisMonthInfo();
		return await this.monthlyUsersRepository.findOneBy({userInfo, monthInfo});
	}

	async getMonthlyUser(userInfo: UserInfo, monthInfo: MonthInfo) {
		return await this.monthlyUsersRepository.findOneBy({userInfo, monthInfo})
	}

	async createMonthlyUserInThisMonth(userInfo: UserInfo): Promise<MonthlyUsers> {
		const monthInfo = await this.getThisMonthInfo();
		const monthlyUser = this.monthlyUsersRepository.create({
			attendanceCount: 0,
			isPerfect: false,
			totalPerfectCount: 0,
			monthInfo: monthInfo,
			userInfo: userInfo
		});
		return (await this.monthlyUsersRepository.save(monthlyUser));
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
		this.increaseOneToMonthlyUserAttendanceCount(monthlyUser, date);
	}

	decreaseMonthlyUser(monthlyUser: MonthlyUsers, date: Date) {
		if (monthlyUser.attendanceCount > 0 && !this.isWeekend(date)) {
			this.monthlyUsersRepository.update(monthlyUser.id, {
				attendanceCount: monthlyUser.attendanceCount - 1
			})
		}
	}

	async increaseOneToMonthlyUserAttendanceCount(monthlyuser: MonthlyUsers, date: Date) {
		// TODO: isWeekend 검증하는 부분 제거 (비즈니스 로직은 dbmanager에서 빼자.)
		if (this.isWeekend(date) === false) {
			monthlyuser.attendanceCount += 1;
			await this.monthlyUsersRepository.update(monthlyuser.id, {
				attendanceCount: monthlyuser.attendanceCount,
			});
		}
		// todo: implement weekend attendance logic
		return ;
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

	changeMonthlyUserPerfectStatus(monthlyUserInfo: MonthlyUsers, status: boolean) {
		this.monthlyUsersRepository.update(monthlyUserInfo.id, {
			isPerfect: status
		})
		return ;
	}

	// buff

	async updateMonthInfoCurrentAttendance(monthInfo: MonthInfo, currentAttendance: number) {
		this.monthInfoRepository.update(monthInfo.id, {
			currentAttendance: currentAttendance,
		})
	}

	async attendanceLogAdd(userInfo: UserInfo, dayInfo: DayInfo, date: Date) {
		const attendanceInfo = this.attendanceRepository.create(
			{
				timelog: date,
				userInfo,
				dayInfo
			}
		)
		return await this.attendanceRepository.save(attendanceInfo);
	}

	async attendanceLogDelete(userInfo: UserInfo, dayInfo: DayInfo): Promise<boolean> {
		const attendanceInfo = await this.attendanceRepository.findOneBy({userInfo, dayInfo})
		if (!attendanceInfo) {
			return false
		}
		else {
			await this.attendanceRepository.delete(attendanceInfo)
			return true
		}
	}

	async updateUserInfoIsOper(userInfo: UserInfo, isOperator: boolean) {
		this.usersRepository.update(userInfo.id, {
			isOperator: isOperator
		})
		return
	}

	updateUserPhotoUrl(userInfo: UserInfo, photoUrl: string) {
		this.usersRepository.update(userInfo.id, {
			photoUrl: photoUrl
		})
	}

	/**************************************
	 * 			util 함수 목록            *
	 * ********************************* */

	// todo: to use day_info enum
	getDayType(date: Date): number {
		const day: number = date.getDay();
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