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
		const monthlyUserInfo: MonthlyUsers = await this.dbmanagerService.getThisMonthStatus(userInfo);
		let attendanceStatus: AttendanceStatus;
		if (!monthlyUserInfo) {
			attendanceStatus.attendanceCount = 0;
			attendanceStatus.isPerfectAttendance = false;
			return attendanceStatus;
		}
		else {
			attendanceStatus.attendanceCount = monthlyUserInfo.attendanceCount;
			attendanceStatus.isPerfectAttendance = monthlyUserInfo.isPerfect;
			return attendanceStatus;
		}	
	}
}
