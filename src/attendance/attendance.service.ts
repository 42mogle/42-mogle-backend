import { Inject, Injectable } from '@nestjs/common';
import { userInfo } from 'os';
import { endWith, NotFoundError } from 'rxjs';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { DayInfo } from '../dbmanager/entities/day_info.entity';
import { UserInfo } from '../dbmanager/entities/user_info.entity';

@Injectable()
export class AttendanceService {
	@Inject(DbmanagerService) private readonly dbmanagerService: DbmanagerService;


	getUserButtonStatus(intraId: string): number {
		if (!this.isCurrentTime()) {
			return (1);
		}
		else if (this.isAttendance(intraId)) {
			return (2);
		}
		else if (!this.isSetToDayWord()) {
			return (3)
		}
		return (0);
	}


	/***********************************
     * 			util function list     *
     ********************************* */
	
	isCurrentTime() {
		const now = new Date();
		const start = new Date();
		const end = new Date();
		start.setHours(8, 0, 0);
		end.setHours(8, 30, 0);
		if (now < start || now > end)
			return (0);		
		else
			return (1);
	}

	async isAttendance(intra_id: string): Promise<boolean> {
		const dayInfo: DayInfo = await this.dbmanagerService.getDayInfo();
		const userInfo: UserInfo = await this.dbmanagerService.getUserInfo(intra_id)
		const found = await this.dbmanagerService.getAttendanceUserInfo(userInfo, dayInfo);
		if (found)
			return true;
		else
			return false;
	}

	async isSetToDayWord(): Promise<boolean> {
		const found: DayInfo = await this.dbmanagerService.getDayInfo();
		if (found.todayWord === "뀨?")
			return (false);
		else
			return (true);
	}

	
}
