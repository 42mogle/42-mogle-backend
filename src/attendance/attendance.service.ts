import { Inject, Injectable } from '@nestjs/common';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { DayInfo } from '../dbmanager/entities/day_info.entity';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { OperatorService } from '../operator/operator.service';
import { MonthInfo } from '../dbmanager/entities/month_info.entity';
import { ButtonStatus } from './button.status.enum';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';
import { Attendance } from '../dbmanager/entities/attendance.entity';

@Injectable()
export class AttendanceService {
	@Inject(DbmanagerService) private readonly dbmanagerService: DbmanagerService
	@Inject(OperatorService) private readonly operatorService: OperatorService

	async getUserButtonStatus(userInfo: UserInfo): Promise<number> {
		if (await this.hasAttendedToday(userInfo)) {
			return ButtonStatus.AlreadyCheckedAttendance;
		}
		else if (this.isAvailableTime() === false) {
			return ButtonStatus.NotAvailableTime;
		}
		return ButtonStatus.AttendanceSuccess;
	}

	// todo: Refactor
	// todo: set Dto to return
	async applyTodayAttendance(attendanceInfo: CreateAttendanceDto, userInfo: UserInfo) {
		const todayInfo: DayInfo = await this.dbmanagerService.getTodayInfo();
		const todayWord: string = todayInfo.todayWord;
		const monthInfo: MonthInfo = await this.dbmanagerService.getThisMonthInfo();
		const currDatetime = new Date();

		if (await this.hasAttendedToday(userInfo) === true) {
			return ({
				statusAttendance: 1,
				errorMsg: "이미 출석 체크 했습니다."
			});
		}
		else if (attendanceInfo.todayWord !== todayWord) {
			return ({
				statusAttendance: 2,
				errorMsg: "오늘의 단어가 다릅니다."
			});
		}
		else if (this.isAvailableTime() === false) {
			return ({
				statusAttendance: 3,
				errorMsg: "출석 가능한 시간이 아닙니다."
			});
		}
		let monthlyUser: MonthlyUsers = await this.dbmanagerService.getThisMonthlyUser(userInfo);
		if (monthlyUser === null) {
			monthlyUser = await this.dbmanagerService.createMonthlyUserInThisMonth(userInfo);
		}
		await this.dbmanagerService.attendanceRegistration(userInfo, currDatetime);
		if (this.isWeekday(currDatetime) === true) {
			monthlyUser.attendanceCount += 1;
		}
		this.dbmanagerService.updateMonthlyUserAttendanceCount(monthlyUser, monthlyUser.attendanceCount);
		this.operatorService.updatePerfectStatus(monthlyUser, monthInfo.currentAttendance);
		return ({
			statusAttendance: 0,
			errorMsg: "성공적으로 출석 체크를 완료했습니다." // todo: fix for not errorMsg
		});
	}

	/***********************************
     * 			util function list     *
     ********************************* */
	isWeekday(date: Date): boolean {
		const day = date.getDay();
		if (0 < day && day < 6) {
			return true;
		} else {
			return false;
		}
	}

	isWeekend(date: Date): boolean {
		if (date.getDay() === 6 || date.getDay() === 0)
			return true;
		else
			return false;
	}

	isAvailableTime(now = new Date()): Boolean {
		const start = new Date();
		const end = new Date();

		start.setHours(9, 42, 0);
		end.setHours(10, 12, 0);
		if (now < start || now > end)
			return (false);
		else
			return (true);
	}

	async hasAttendedToday(userInfo: UserInfo): Promise<boolean> {
		const todayInfo: DayInfo = await this.dbmanagerService.getTodayInfo();
		const todayAttendanceInfo: Attendance = await this.dbmanagerService.getAttendance(userInfo, todayInfo);
		if (todayAttendanceInfo === null)
			return false;
		else
			return true;
	}
}
