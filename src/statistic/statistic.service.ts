import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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

	async updateMonthlyUsersInASpecificMonth(year: number, month: number) {
		const monthInfo: MonthInfo = await this.dbmanagerService.getMonthInfo(month, year);
		const monthlyUsers: MonthlyUsers[] = await this.dbmanagerService.getAllMonthlyUsersInAMonth(monthInfo);
		monthlyUsers.forEach(async (monthlyUser) => {
			await this.updateMonthlyUserAttendanceCountAndPerfectStatus(monthlyUser, monthInfo);
			// TODO: replace to updateMonthlyUserProperties()
		});
		return monthlyUsers;
	}

	async updateMonthlyUserAttendanceCountAndPerfectStatus(monthlyUser: MonthlyUsers, monthInfo: MonthInfo) {
		await this.updateMonthlyUserAttendanceCount(monthlyUser, monthInfo);
		await this.updateMonthlyUserPerfectStatus(monthlyUser, monthInfo);
		return monthlyUser;
	}

	async updateMonthlyUserAttendanceCount(monthlyUser: MonthlyUsers, monthInfo: MonthInfo) {
		monthlyUser.attendanceCount = await this.dbmanagerService.getCountOfWeekdayAttendancesOfAUserInAMonth(monthlyUser);
		// reflect weekend supplementary attendances
		let dayInfoOfEachWeek: DayInfo = await this.dbmanagerService.getFirstWeekdayDayInfoInAMonth(monthInfo);
		for (let i: number = 0; (i < 5) && (dayInfoOfEachWeek !== null); ++i) {
			monthlyUser = await this.reflectWeekendSupplementaryAttendanceInAWeek(dayInfoOfEachWeek, monthlyUser);
			dayInfoOfEachWeek = await this.dbmanagerService.getADayInfoHavingSpecificDay(monthInfo, dayInfoOfEachWeek.day + 7);
		}
		// update monthlyUser attendance count
		await this.dbmanagerService.updateMonthlyUserAttendanceCount(monthlyUser, monthlyUser.attendanceCount);
		return monthlyUser;
	}

	/*
		주말 2일 연속으로 출석 시,
		그 주 평일에 하루 빠졌다면 attendanceCount를 1 증가시킨다.
	*/
	async reflectWeekendSupplementaryAttendanceInAWeek(dayInfo: DayInfo, monthlyUser: MonthlyUsers) {	
		const userInfo: UserInfo = await this.dbmanagerService.getUserInfoByMonthlyUser(monthlyUser);
		// 1. 같은 달에서 같은 주일의 DayInfo list 가져오기
		const dayInfoListSameMonthWeek: DayInfo[] = await this.dbmanagerService.getDayInfoListSameMonthWeek(dayInfo);
		const lenOfDayList = dayInfoListSameMonthWeek.length;

		if (lenOfDayList > 2 
		&& dayInfoListSameMonthWeek[lenOfDayList - 1].type === DayType.WEEKEND 
		&& dayInfoListSameMonthWeek[lenOfDayList - 2].type === DayType.WEEKEND) {
			// 2. 주말 2일 연속 출석 확인
			if (await this.dbmanagerService.getAttendance(userInfo, dayInfoListSameMonthWeek[lenOfDayList - 1]) !== null
			&& await this.dbmanagerService.getAttendance(userInfo, dayInfoListSameMonthWeek[lenOfDayList - 2]) !== null) {
				// 3. 그 주에 빠진 평일 하루 확인
				for (let idx: number = 0; idx < lenOfDayList - 2; ++idx) {
					if (await this.dbmanagerService.getAttendance(userInfo, dayInfoListSameMonthWeek[idx]) === null) {
						monthlyUser.attendanceCount += 1;
						break ;
					}
				}
			}
		}
		return monthlyUser;
	}

	async updateMonthlyUserPerfectStatus(monthlyUser: MonthlyUsers, monthInfo: MonthInfo) {
		//let monthInfo: MonthInfo = monthlyUser.monthInfo;
		if (monthlyUser.attendanceCount === monthInfo.currentAttendance) {
			monthlyUser.isPerfect = true;
		} else if (monthlyUser.attendanceCount < monthInfo.currentAttendance) {
			monthlyUser.isPerfect = false;
		}
		await this.dbmanagerService.updateMonthlyUserPerfectStatus(monthlyUser, monthlyUser.isPerfect);
		return monthlyUser;
	}
}
