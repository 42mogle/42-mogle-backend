import { Inject, Injectable } from '@nestjs/common';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';
import { AttendanceStatus } from './dto/attendanceStatus.dto';
import { MonthInfo } from 'src/dbmanager/entities/month_info.entity';

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

	async updateUserMonthlyProperties(userInfo: UserInfo, monthInfo: MonthInfo) {
		const monthlyUserInfo = await this.dbmanagerService.getSpecificMonthlyuserInfo(monthInfo, userInfo);

		// update attendanceCount
		this.dbmanagerService.getAttendanceCountOfUserMonth(userInfo, monthInfo);
		// 처음에 attendance 테이블에서 month_info_id 를 가지지 않도록 설계했는데, 없을 경우에 일일이 그 month_info_id를 가진 day_info를 코드 상에서 찾아서 attendance를 조회해야한다.
		// attendance 테이블이 month_info_id를 column으로 가지도록 하면 특정 month_info_id를 가진 attendance들을 database에서 SQL 로 조회를 바로 할 수 있기 때문에 더 빠르게 조회할 수 있다.
		
		// update isPerfect
		if (monthlyUserInfo.attendanceCount === monthInfo.currentAttendance 
			&& monthlyUserInfo.isPerfect === false) {
			monthlyUserInfo.isPerfect = true;
		}

		// update totalPerfectCount
		let lastMonth: number = monthInfo.month - 1;
		let yearToLastMonth: number = monthInfo.year;
		if (monthlyUserInfo.isPerfect) {
			if (monthlyUserInfo.attendanceCount === monthInfo.totalAttendance) {
				// set month and year to find lastMonthInfo
				if (monthInfo.month === 1) {
					lastMonth = 12;
					yearToLastMonth = monthInfo.year - 1;
				}
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
		return ;
	}


	// updateMonthlyUserAttendanceCount(monthlyuser: MonthlyUsers) {

	// 	if (!this.isWeekend())
	// 	{
	// 		monthlyuser.attendanceCount += 1;
	// 		// todo: save랑 update 둘 중에 하나만 하기
	// 		this.monthlyUsersRepository.save(monthlyuser);
	// 		this.monthlyUsersRepository.update(monthlyuser.id, {
	// 			attendanceCount: monthlyuser.attendanceCount,
	// 		});
	// 	}
	// }
}
