import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { DayInfo } from '../dbmanager/entities/day_info.entity';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { CreateAttendanceDto } from '../dbmanager/dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
	@Inject(DbmanagerService) private readonly dbmanagerService: DbmanagerService;


	getUserButtonStatus(intraId: string): number {
		if (!this.isAvailableTime()) {
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

	async AttendanceCertification(attendanceinfo: CreateAttendanceDto) {
		const toDayWord: string = await this.dbmanagerService.getToDayWord();
		console.log("joonhan say:", attendanceinfo.todayWord);
		if (await this.isAttendance(attendanceinfo.intraId)) {
			return ({
				statusAttendance: 1,
				errorMsg: "이미 출석 체크 했습니다."
			});
		}
		if (attendanceinfo.todayWord !== toDayWord) {
			return ({
				statusAttendance: 2,
				errorMsg: "오늘의 단어가 다릅니다."
			});
		}
		let monthlyUser = await this.dbmanagerService.getThisMonthlyUser(attendanceinfo.intraId);
		if (!monthlyUser)
			monthlyUser = await this.dbmanagerService.createMonthlyUser(attendanceinfo.intraId);
		this.dbmanagerService.attendanceRegistration(attendanceinfo);
		this.dbmanagerService.updateMonthlyUser(monthlyUser);
		return ({
			statusAttendance: 0,
			errorMsg: "성공적으로 출석 체크를 완료했습니다."
		})
	}


	/***********************************
     * 			util function list     *
     ********************************* */
	
	isAvailableTime() {
		const now = new Date();
		const start = new Date();
		const end = new Date();
		start.setHours(8, 30, 0);
		end.setHours(9, 0, 0);
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
