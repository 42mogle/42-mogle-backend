import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { SetToDayWordDto } from './dto/toDayWord.dto';
import { UpdateUserAttendanceDto } from './dto/updateUserAttendance.dto';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { DayInfo } from '../dbmanager/entities/day_info.entity';
import { MonthInfo } from '../dbmanager/entities/month_info.entity';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';

@Injectable()
export class OperatorService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;

	setTodayWord(setToDayWordDto: SetToDayWordDto) {
		if (this.dbmanagerService.isAdmin(setToDayWordDto.intraId)) {
			this.dbmanagerService.setToDayWord(setToDayWordDto.toDayWord);
			return "success"
		}
		else {
			return "permission denied"
		}
	}

	async updateUserAttendance(updateUserAttendanceDto: UpdateUserAttendanceDto): Promise<string> {
		if (updateUserAttendanceDto.passWord !== "42MogleOperator")
			return "권한이 없습니다."
		const userInfo: UserInfo = await this.dbmanagerService.getUserInfo(updateUserAttendanceDto.intraId);
		const monthInfo: MonthInfo = await this.dbmanagerService.getSpecificMonthInfo(
			updateUserAttendanceDto.year,
			updateUserAttendanceDto.month
		)
		if (!monthInfo) {
			return "잘못된 입력입니다."
		}
		const dayInfo: DayInfo = await this.dbmanagerService.getSpecificDayInfo(
			monthInfo,
			updateUserAttendanceDto.day
			);
		if (!dayInfo || !UserInfo)
			return "잘못된 입력 입니다.";
		const attendanceInfo = await this.dbmanagerService.getAttendanceUserInfo(userInfo, dayInfo)
		if (!attendanceInfo) {
			this.dbmanagerService.updateAtendanceInfo(userInfo, dayInfo, updateUserAttendanceDto);
			const monthlyUserInfo : MonthlyUsers = await this.dbmanagerService.getSpecificMonthlyuserInfo(monthInfo, userInfo);
			this.dbmanagerService.updateAttendanceCountThisMonth(monthlyUserInfo)
			return "출석체크 완료";
		}
		else {
			return "이미 출석체크가 되었습니다."
		}
	}
}
