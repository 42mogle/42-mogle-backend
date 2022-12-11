import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { SetTodayWordDto } from './dto/today_Word.dto';
import { UpdateUserAttendanceDto } from './dto/updateUserAttendance.dto';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { DayInfo } from '../dbmanager/entities/day_info.entity';
import { MonthInfo } from '../dbmanager/entities/month_info.entity';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';
import { Cron } from '@nestjs/schedule';
import { WinstonLogger, WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class OperatorService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;

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
		const attendanceInfo = await this.dbmanagerService.getAttendanceUserInfo(userInfo, dayInfo);
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
		this.logger.log("check updateCurrentCount");
		const type: number = this.dbmanagerService.getTodayType();
		// 0: 일요일
		// 6: 토요일
		if (type !== 0 && type !== 6)
			this.dbmanagerService.updateThisMonthCurrentCount();
	}
}
