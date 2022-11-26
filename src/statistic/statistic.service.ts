import { Inject, Injectable } from '@nestjs/common';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { StatisticModule } from './statistic.module';
import { UserInfo } from '../dbmanager/entities/user_info.entity';

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
}
