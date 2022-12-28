import { HttpException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { SetTodayWordDto } from './dto/today_Word.dto';
import { UpdateUserAttendanceDto } from './dto/updateUserAttendance.dto';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { DayInfo } from '../dbmanager/entities/day_info.entity';
import { MonthInfo } from '../dbmanager/entities/month_info.entity';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';
import { Cron } from '@nestjs/schedule';
import { WinstonLogger, WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { GsheetAttendanceDto } from './dto/gsheetAttendance.dto';
import { stringify } from 'querystring';
import { StatisticService } from 'src/statistic/statistic.service';

@Injectable()
export class OperatorService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;
	@Inject(StatisticService)
	private readonly statisticService: StatisticService;

	constructor(
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
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
			const monthlyUserInfo : MonthlyUsers = await this.dbmanagerService.getSpecificMonthlyuserInfo(monthInfo, userInfo);
			await this.dbmanagerService.updateAttendanceCountThisMonth(monthlyUserInfo)
			return "출석체크 완료";
		}
		else {
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

	updatePerfectStatus(monthlyUserInfo: MonthlyUsers, currentAttendance: number) {
		if (monthlyUserInfo.attendanceCount < currentAttendance && monthlyUserInfo.isPerfect === true)
			this.dbmanagerService.changeIsPerfect(monthlyUserInfo, false);
		else if (monthlyUserInfo.attendanceCount === currentAttendance && monthlyUserInfo.isPerfect === false)
			this.dbmanagerService.changeIsPerfect(monthlyUserInfo, true);
	}

	@Cron('0 0 1 * * 0-6')
	async updateCurrentCount() {
		this.logger.log("test", "check updateCurrentCount");
		const type: number = this.dbmanagerService.getTodayType();
		// 0: 일요일
		// 6: 토요일
		if (type !== 0 && type !== 6)
			this.dbmanagerService.updateThisMonthCurrentCount();
	}

	// implementing...
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
		let monthIndexed = datetime.getMonth();
		const year = datetime.getFullYear();
		let monthInfo = await this.dbmanagerService.getMonthInfo(monthIndexed + 1, year);
		if (monthInfo === null) {
			console.log('no month_info');
			monthInfo = await this.dbmanagerService.setMonthInfoWithDayInfos(monthIndexed, year); // todo: getMonthInfo
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

		// update status
		await this.statisticService.updateUserMonthlyProperties(userInfo, monthInfo);

		return ;
	}
}
