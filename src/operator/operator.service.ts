import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { SetTodayWordDto } from './dto/today_Word.dto';
import { UpdateUserAttendanceDto } from './dto/updateUserAttendance.dto';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { DayInfo } from '../dbmanager/entities/day_info.entity';
import { MonthInfo } from '../dbmanager/entities/month_info.entity';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';
import { Cron } from '@nestjs/schedule';
import { WinstonLogger, WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston'
import { GsheetAttendanceDto } from './dto/gsheetAttendance.dto'
import { StatisticService } from 'src/statistic/statistic.service'
import { DataListDto } from './dto/dataList.dto'
import { AttendanceData } from './dto/attendnaceData.dto'
import { Attendance } from '../dbmanager/entities/attendance.entity'
import { GsheetTotalPerfectCount } from './dto/gsheetTotalPerfectCount.dto';

@Injectable()
export class OperatorService {
	@Inject(DbmanagerService) private readonly dbmanagerService: DbmanagerService
	@Inject(StatisticService) private readonly statisticService: StatisticService

	constructor(
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: WinstonLogger,
	) {}

	setTodayWord(TodayWordDto: SetTodayWordDto, userInfo: UserInfo) {
		if (userInfo.isOperator === true) {
			this.dbmanagerService.setTodayWord(TodayWordDto.todayWord);
			return "오늘의 단어 설정 성공"
		}
		else {
			throw new UnauthorizedException("Not Operator");
		}
	}

	async updateUserAttendance(updateUserAttendanceDto: UpdateUserAttendanceDto): Promise<string> {
		const userInfo: UserInfo = await this.dbmanagerService.getUserInfo(updateUserAttendanceDto.intraId);
		const monthInfo: MonthInfo = await this.dbmanagerService.getSpecificMonthInfo(
			updateUserAttendanceDto.year,
			updateUserAttendanceDto.month
		);
		if (!monthInfo) {
			return "잘못된 입력입니다: monthInfo"
		}
		const dayInfo: DayInfo = await this.dbmanagerService.getSpecificDayInfo(
			monthInfo,
			updateUserAttendanceDto.day
		);
		if (!dayInfo) {
			return "잘못된 입력입니다: dayInfo";
		}
		else if (!userInfo) {
			return "잘못된 입력입니다: userInfo";
		}
		const attendanceInfo = await this.dbmanagerService.getAttendance(userInfo, dayInfo);
		if (!attendanceInfo) {
			await this.dbmanagerService.updateAtendanceInfo(userInfo, dayInfo, updateUserAttendanceDto);
			let monthlyUserInfo : MonthlyUsers = await this.dbmanagerService.getSpecificMonthlyuserInfo(monthInfo, userInfo);
			if (!monthlyUserInfo)
				monthlyUserInfo = await this.dbmanagerService.createMonthlyUserInThisMonth(userInfo);
			await this.dbmanagerService.updateAttendanceCountThisMonth(monthlyUserInfo)
			return "출석체크 완료";
		} else {
			return "이미 출석체크가 되었습니다."
		}
	}

	@Cron('0 10 9 * * 0-6')
	async updateUsersAttendanceInfo() {
		this.logger.log("check updateUsersAttendanceInfo");
		const allUsersInfo: UserInfo[] = await this.dbmanagerService.getAllUsersInfo();
		const monthInfo: MonthInfo = await this.dbmanagerService.getThisMonthInfo();
		const AllmonthlyUser: MonthlyUsers[] = await this.dbmanagerService.getAllMonthlyUser(allUsersInfo, monthInfo);
		AllmonthlyUser.forEach((user) => {
			this.updatePerfectStatus(user, monthInfo.currentAttendance);
		})
	}

	// todo: set async and await
	updatePerfectStatus(monthlyUserInfo: MonthlyUsers, currentAttendance: number) {
		if (monthlyUserInfo.attendanceCount < currentAttendance && monthlyUserInfo.isPerfect === true)
			this.dbmanagerService.changeMonthlyUserPerfectStatus(monthlyUserInfo, false);
		else if (monthlyUserInfo.attendanceCount === currentAttendance && monthlyUserInfo.isPerfect === false)
			this.dbmanagerService.changeMonthlyUserPerfectStatus(monthlyUserInfo, true);
	}

	@Cron('0 0 1 * * 0-6')
	async updateThisMonthCurrentAttendance() {
		this.logger.log("pid = " + process.pid, "check updateCurrentCount");
		const thisTime: Date = new Date();
		const thisMonthInfo: MonthInfo = await this.dbmanagerService.getSpecificMonthInfo(thisTime.getFullYear(), thisTime.getMonth() + 1);
		const currentAttendanceThisMonth = await this.dbmanagerService.getCountOfThisMonthCurrentAttendance(thisMonthInfo, thisTime.getDate());
		const typeOfToday: number = thisTime.getDay();
		if (typeOfToday !== 0 && typeOfToday !== 6) // 0: Sunday, 6: Saturday
			this.dbmanagerService.updateMonthInfoCurrentAttendance(thisMonthInfo, currentAttendanceThisMonth);
	}

	async addAttendanceFromGsheet(commanderInfo: UserInfo, gsheetAttendanceDto: GsheetAttendanceDto) {
		if (commanderInfo.isOperator === false) {
			throw new UnauthorizedException("Not Operator");
		}
		const intraId: string = gsheetAttendanceDto.intraId;
		const dateStr: string = gsheetAttendanceDto.date;
		const timeStr: string = gsheetAttendanceDto.time;
		const datetime: Date = new Date(Date.parse(dateStr + ' ' + timeStr));

		// get user_info
		const userInfo = await this.dbmanagerService.getUserInfo(intraId);
		if (userInfo === null) {
			console.log('no intraId user');
			throw new NotFoundException('Not existed user');
		}
		console.log(`uesr_info: ${JSON.stringify(userInfo.intraId)}`);

		// get month_info_id and if not existing set month_info
		let monthNotIndexed = datetime.getMonth() + 1;
		const year = datetime.getFullYear();
		let monthInfo = await this.dbmanagerService.getMonthInfo(monthNotIndexed, year);
		if (monthInfo === null) {
			console.log('no month_info');
			monthInfo = await this.dbmanagerService.setMonthInfoWithDayInfos(monthNotIndexed, year); // todo: getMonthInfo
			// updateCurrentAttendanceInThisMonthInfo();
		}
		console.log(`monthInfo: ${JSON.stringify(monthInfo)}`);

		// get day_info_id
		const dayInfo = await this.dbmanagerService.getDayInfo(datetime.getDate(), monthInfo);
		if (dayInfo === null) {
			console.log('no day_info');
			throw new NotFoundException('MonthInfo가 생겼으면 있어야 한다.')
		}
		console.log(`dayInfo: ${JSON.stringify(dayInfo)}`);

		// check already being attended
		let attendance = await this.dbmanagerService.getAttendance(userInfo, dayInfo);
		if (attendance) {
			console.log('기존에 attendance 존재함');
			console.log(`attendance: ${JSON.stringify(attendance)}`);
		} else {
			attendance = await this.dbmanagerService.setAttendance(userInfo, dayInfo, datetime);
			console.log('새로운 attendance 등록!');
			console.log(`attendance: ${JSON.stringify(attendance)}`);
		}

		// update monthly user status
		await this.statisticService.updateASpecificUserMonthlyProperties(userInfo, monthInfo);

		return ;
	}

	async addTotalPerfectCountFromGsheet(commanderInfo: UserInfo, gsheetTotalPerfectCount: GsheetTotalPerfectCount) {
		if (commanderInfo.isOperator === false) {
			throw new UnauthorizedException("Not Operator");
		}
		// Check userInfo existed
		const targetUserInfo: UserInfo = await this.dbmanagerService.getUserInfo(gsheetTotalPerfectCount.intraId);
		if (targetUserInfo === null) {
			throw new NotFoundException('UserInfo가 등록되어 있지 않음');
		}
		// Get 2022.11 month_info
		const monthInfoOf20221100 = await this.dbmanagerService.getMonthInfo(11, 2022);
		if (monthInfoOf20221100 === null) {
			throw new NotFoundException('2022.11 MonthInfo가 존재하지 않음');
		}
		// Make monthlyUser if not existed with totalPerfectCount
		let monthlyUser = await this.dbmanagerService.getMonthlyUser(targetUserInfo, monthInfoOf20221100);
		if (monthlyUser === null) {
			monthlyUser = await this.dbmanagerService.createMonthlyUserByMonthInfo(targetUserInfo, monthInfoOf20221100);	
		}
		monthlyUser.totalPerfectCount = gsheetTotalPerfectCount.totalPerfectCount;
		this.dbmanagerService.updateMonthlyUserTotalPerfectCount(monthlyUser, monthlyUser.totalPerfectCount);
		return monthlyUser;
	}

	async updateMonthInfoProperty(year: number, month: number) {
		// get month_info
		let monthInfo: MonthInfo = await this.dbmanagerService.getMonthInfo(month, year);
		console.log(`monthInfo: ${JSON.stringify(monthInfo)}`);

		// update total_attendance
		const countOfThisMonthTotalAttendance: number = await this.dbmanagerService.getCountOfThisMonthTotalAttendance(monthInfo);
		console.log(`countOfThisMonthTotalAttendance: ${countOfThisMonthTotalAttendance}`);
		//monthInfo.totalAttendance = countOfThisMonthTotalAttendance;

		// update current_attendance
		const currentDatetime: Date = new Date();
		let countOfThisMonthCurrentAttendance: number;
		if (monthInfo.month === currentDatetime.getMonth() + 1
		&& monthInfo.year === currentDatetime.getFullYear()) {
			countOfThisMonthCurrentAttendance = await this.dbmanagerService.getCountOfThisMonthCurrentAttendance(monthInfo, currentDatetime.getDate());
		} else {
			countOfThisMonthCurrentAttendance = countOfThisMonthTotalAttendance;
		}
		console.log(`countOfThisMonthCurrentAttendance: ${countOfThisMonthCurrentAttendance}`);

		// update total_user_count
		const countOfTotalThisMonthlyUsers: number = await this.dbmanagerService.getCountOfTotalThisMonthlyUsers(monthInfo);
		console.log(`countOfTotalThisMonthlyUsers: ${countOfTotalThisMonthlyUsers}`);

		// update perfect_user_count
		const countOfPerfectThisMonthlyUsers: number = await this.dbmanagerService.getCountOfPerfectThisMonthlyUsers(monthInfo);
		console.log(`countOfPerfectThisMonthlyUsers: ${countOfPerfectThisMonthlyUsers}`);

		// save updated month_info
		console.log(`monthInfo(before): ${JSON.stringify(monthInfo)}`);

		monthInfo.totalAttendance = countOfThisMonthTotalAttendance;
		monthInfo.currentAttendance = countOfThisMonthCurrentAttendance;
		monthInfo.totalUserCount = countOfTotalThisMonthlyUsers;
		monthInfo.perfectUserCount = countOfPerfectThisMonthlyUsers;
		console.log(`monthInfo(after): `);
		monthInfo = await this.dbmanagerService.saveMonthInfoTable(monthInfo);
		console.log(monthInfo);
		return monthInfo;
	}

	async findUserAttendanceLog(dataList: DataListDto) {
		const userInfo: UserInfo = await this.dbmanagerService.getUserInfo(dataList.intraId)
		if (!userInfo) {
			throw new NotFoundException("userInfo that does not exist")
		}
		const monthInfo: MonthInfo = await this.dbmanagerService.getMonthInfo(dataList.month, dataList.year)
		if (!monthInfo) {
			throw new NotFoundException("monthInfo that dose not exist")
		}
		return await this.dbmanagerService.getAttendanceListByMonthInfo(userInfo, monthInfo)
	}

	async userAttendanceLogAdd(attendanceData: AttendanceData) {
		const userInfo: UserInfo = await this.dbmanagerService.getUserInfo(attendanceData.intraId)
		if (!userInfo) {
			throw new NotFoundException("userInfo that does not exist")
		}
		const monthInfo: MonthInfo = await this.dbmanagerService.getMonthInfo(attendanceData.month, attendanceData.year)
		if (!monthInfo) {
			throw new NotFoundException("monthInfo that dose not exist")
		}
		const dayInfo: DayInfo = await this.dbmanagerService.getDayInfo(attendanceData.day, monthInfo)
		if (!dayInfo) {
			throw new NotFoundException("dayInfo that dose not exist")
		}
		const attendnaceLog: Attendance = await this.dbmanagerService.getAttendance(userInfo, dayInfo)
		if (attendnaceLog) {
			throw new BadRequestException("Attendance information already exists")
		} else {
			const date = new Date(
				attendanceData.year,
				attendanceData.month - 1,
				attendanceData.day,
				8,
				30
			)
			let monthlyUser: MonthlyUsers = await this.dbmanagerService.getMonthlyUser(userInfo, monthInfo)
			if (!monthlyUser) {
				monthlyUser = await this.dbmanagerService.createMonthlyUserByMonthInfo(userInfo, monthInfo)
			}
			await this.dbmanagerService.attendanceLogAdd(userInfo, dayInfo, date)
			await this.statisticService.updateMonthlyUserAttendanceCountAndPerfectStatus(monthlyUser, monthInfo);
		}
	}

	async userAttendanceLogDelete(attendanceData: AttendanceData) {
		const userInfo: UserInfo = await this.dbmanagerService.getUserInfo(attendanceData.intraId)
		if (!userInfo) {
			throw new NotFoundException("userInfo that does not exist")
		}
		const monthInfo: MonthInfo = await this.dbmanagerService.getMonthInfo(attendanceData.month, attendanceData.year)
		if (!monthInfo) {
			throw new NotFoundException("monthInfo that dose not exist")
		}
		const dayInfo: DayInfo = await this.dbmanagerService.getDayInfo(attendanceData.day, monthInfo)
		if (!dayInfo) {
			throw new NotFoundException("dayInfo that dose not exist")
		}
		const monthlyUser: MonthlyUsers = await this.dbmanagerService.getMonthlyUser(userInfo, monthInfo)
		if (await this.dbmanagerService.attendanceLogDelete(userInfo, dayInfo)) {
			await this.statisticService.updateMonthlyUserAttendanceCountAndPerfectStatus(monthlyUser, monthInfo);
		}
	}

	async addOperator(intraId: string) {
		const userInfo: UserInfo = await this.dbmanagerService.getUserInfo(intraId)
		if (!userInfo) {
			throw new NotFoundException("Not Found User")
		}
		this.dbmanagerService.updateUserInfoIsOper(userInfo, true)
	}

	async deleteOperator(intraId: string) {
		const userInfo: UserInfo = await this.dbmanagerService.getUserInfo(intraId)
		if (!userInfo) {
			throw new NotFoundException("Not Found User");
		}
		this.dbmanagerService.updateUserInfoIsOper(userInfo, false)
	}

	async getTodayWord() {
		const datetimeOfToday: Date = new Date();
		const todayWord = await this.dbmanagerService.getTodayWordByDatetime(datetimeOfToday);
		return todayWord;
	}
}
