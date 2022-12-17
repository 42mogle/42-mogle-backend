import { Inject, Injectable } from '@nestjs/common';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';
import { AttendanceStatus } from './dto/attendanceStatus.dto';

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
