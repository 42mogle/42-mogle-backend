import { Inject, Injectable } from '@nestjs/common';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { StatisticModule } from './statistic.module';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';

@Injectable()
export class StatisticService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;

	async getUserAttendanceInfo(userId: number) {
		const now = new Date();
		const found: UserInfo = await this.dbmanagerService.getUserInfoByUserId(userId);
	}

	async getAttendanceList(intraId: string) {
		return await this.dbmanagerService.getAttendanceListByintraId(intraId);
	}

	async getUserMonthStatus(intraId: string): Promise<any> {
		const monthlyUserInfo: MonthlyUsers = await this.dbmanagerService.getThisMonthStatus(intraId);
		if (!monthlyUserInfo)
			return {attendanceCount: 0, isPerfect: false};
		else
			return {attendanceCount: monthlyUserInfo.attendanceCount, isPerfect: monthlyUserInfo.isPerfect};
	}
}
