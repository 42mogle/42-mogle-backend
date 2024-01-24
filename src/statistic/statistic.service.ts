import { Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';
import { AttendanceStatus } from './dto/attendanceStatus.dto';
import { MonthInfo } from 'src/dbmanager/entities/month_info.entity';
import { DayInfo } from 'src/dbmanager/entities/day_info.entity';

enum DayType {
	WEEKDAY,
	WEEKEND,
	HOLIDAY,
}

@Injectable()
export class StatisticService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;

	async getAttendanceList(userInfo: UserInfo) {
		return await this.dbmanagerService.getAttendanceList(userInfo);
	}

	async getUserMonthStatus(userInfo: UserInfo): Promise<AttendanceStatus> {
		let attendanceStatus: AttendanceStatus = {
			attendanceCount: 0,
			isPerfectAttendance: false,
		};
		const monthlyUserInfo: MonthlyUsers = await this.dbmanagerService.getThisMonthStatus(userInfo);
		if (monthlyUserInfo) {
			attendanceStatus.attendanceCount = monthlyUserInfo.attendanceCount;
			attendanceStatus.isPerfectAttendance = monthlyUserInfo.isPerfect;
		}
		return attendanceStatus;
	}

	async updateASpecificUserMonthlyProperties(userInfo: UserInfo, monthInfo: MonthInfo) {
		let monthlyUserInfo: MonthlyUsers = await this.dbmanagerService.getSpecificMonthlyuserInfo(monthInfo, userInfo);
		if (monthlyUserInfo === null) {
			throw new NotFoundException("특정달에 대한 유저의 정보가 없습니다.");
		}

		// update attendanceCount
		const countFromAttendanceOfUserInMonth = await this.dbmanagerService.getCountFromAttendanceOfUserInMonth(userInfo, monthInfo);
		monthlyUserInfo.attendanceCount = countFromAttendanceOfUserInMonth;
		
		// update isPerfect
		if (monthlyUserInfo.attendanceCount === monthInfo.currentAttendance 
			&& monthlyUserInfo.isPerfect === false) {
			monthlyUserInfo.isPerfect = true;
		}

		// update totalPerfectCount
		// set month and year to find lastMonthInfox
		let lastMonth: number = (monthInfo.month == 1 ? 12 : monthInfo.month - 1);
		let yearToLastMonth: number = (lastMonth == 12 ? monthInfo.year - 1 : monthInfo.year);
		if (monthlyUserInfo.isPerfect) {
			if (monthlyUserInfo.attendanceCount === monthInfo.totalAttendance) {
				const lastMonthInfo: MonthInfo = await this.dbmanagerService.getSpecificMonthInfo(yearToLastMonth, lastMonth);
				if (lastMonthInfo) {
					// find lastMonthlyUserInfo
					const lastMonthlyUserInfo: MonthlyUsers = await this.dbmanagerService.getSpecificMonthlyuserInfo(lastMonthInfo, userInfo);
					if (lastMonthlyUserInfo) {
						monthlyUserInfo.totalPerfectCount = lastMonthlyUserInfo.totalPerfectCount + 1;
					} else {
						monthlyUserInfo.totalPerfectCount = 1;
					}
				}
			}
		}
		// todo: save monthlyUsers
		return await this.dbmanagerService.saveMonthlyUser(monthlyUserInfo);
	}

	async getMonthlyUsersInSepcificMonth(year: number, month: number) {
		const monthInfo: MonthInfo = await this.dbmanagerService.getMonthInfo(month, year);
		if (monthInfo === null) {
			throw new NotFoundException('지정된 달의 데이터가 없습니다.');
		}
		const monthlyUsersInAMonth = await this.dbmanagerService.getAllMonthlyUsersInMonthWithIntraId(monthInfo);
		return monthlyUsersInAMonth;
	}

	async getMonthlyHalfPerfectUsersInSepcificMonth(year: number, month: number) {
		const monthInfo: MonthInfo | null = await this.dbmanagerService.getMonthInfo(month, year);
		if (monthInfo === null) {
		  throw new NotFoundException('지정된 달의 데이터가 없습니다.');
		}
	
		const halfAttendanceCount = Math.ceil(monthInfo.totalAttendance / 2);
		const halfAttendedMonthlyUsers = await this.dbmanagerService
		  .getMonthlyUsersAttendedMoreThanOrEqualCount(monthInfo, halfAttendanceCount);
	
		return halfAttendedMonthlyUsers.filter((monthlyUser) => {
		  return (
			monthlyUser.attendanceCount >= halfAttendanceCount &&
			(monthlyUser.isPerfect === false || monthlyUser.totalPerfectCount > 5)
		  )
		})
	  }

	async updateMonthlyUsersInASpecificMonth(year: number, month: number) {
		if (year === 2022 && month === 11) {
			throw new NotAcceptableException('forbidden to update 2022.11');
		}
		const monthInfo: MonthInfo = await this.dbmanagerService.getMonthInfo(month, year);
		const monthlyUsers: MonthlyUsers[] = await this.dbmanagerService.getAllMonthlyUsersInAMonth(monthInfo);
		monthlyUsers.forEach(async (monthlyUser) => {
			await this.updateMonthlyUserAttendanceCountAndPerfectStatus(monthlyUser, monthInfo);
			await this.updateMonthlyUserTotalPerfectCount(monthlyUser, monthInfo);
			// TODO: replace to updateMonthlyUserProperties()
		});
		return monthlyUsers;
	}

	async updateMonthlyUserAttendanceCountAndPerfectStatus(monthlyUser: MonthlyUsers, monthInfo: MonthInfo) {
		await this.updateMonthlyUserAttendanceCount(monthlyUser);
		await this.updateMonthlyUserPerfectStatus(monthlyUser, monthInfo);
		return monthlyUser;
	}

	async updateMonthlyUserAttendanceCount(monthlyUser: MonthlyUsers) {
		monthlyUser.attendanceCount = await this.dbmanagerService.getCountOfWeekdayAttendancesOfAUserInAMonth(monthlyUser);
		monthlyUser.attendanceCount += await this.dbmanagerService.getCountOfWeekendAttendancesOfAUserInAMonth(monthlyUser);
		monthlyUser.attendanceCount += await this.dbmanagerService.getCountOfHolidayAttendancesOfAUserInAMonth(monthlyUser);
		await this.dbmanagerService.updateMonthlyUserAttendanceCount(monthlyUser, monthlyUser.attendanceCount);
		return monthlyUser;
	}

	async updateMonthlyUserPerfectStatus(monthlyUser: MonthlyUsers, monthInfo: MonthInfo) {
		//let monthInfo: MonthInfo = monthlyUser.monthInfo;
		if (monthlyUser.attendanceCount < monthInfo.currentAttendance) {
			monthlyUser.isPerfect = false;
		} else {
			monthlyUser.isPerfect = true;
		}
		await this.dbmanagerService.updateMonthlyUserPerfectStatus(monthlyUser, monthlyUser.isPerfect);
		return monthlyUser;
	}

	async updateMonthlyUserTotalPerfectCount(monthlyUser: MonthlyUsers, monthInfo: MonthInfo) {
		const userInfo = await this.dbmanagerService.getUserInfoByMonthlyUser(monthlyUser);
		const lastMonthlyUsersOfAUser = await this.dbmanagerService.getMonthlylUsersOfAUserInLastMonthes(userInfo, monthInfo);
		if (lastMonthlyUsersOfAUser.length === 0) {
			monthlyUser.totalPerfectCount = 0;
		} else {
			let maximumTotalPerfectCountLastMonthes = 0;
			lastMonthlyUsersOfAUser.forEach((lastMonthlyUser) => {
				if (lastMonthlyUser.totalPerfectCount > maximumTotalPerfectCountLastMonthes) {
					maximumTotalPerfectCountLastMonthes = lastMonthlyUser.totalPerfectCount;
				}
			});
			monthlyUser.totalPerfectCount = maximumTotalPerfectCountLastMonthes;
		}
		if (monthlyUser.isPerfect === true)
			monthlyUser.totalPerfectCount += 1;
		this.dbmanagerService.updateMonthlyUserTotalPerfectCount(monthlyUser, monthlyUser.totalPerfectCount);
	}
}
