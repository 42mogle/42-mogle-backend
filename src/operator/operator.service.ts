import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { SetToDayWordDto } from './dto/toDayWord.dto';
import { UpdateUserAttendanceDto } from './dto/updateUserAttendance.dto';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { DayInfo } from '../dbmanager/entities/day_info.entity';

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

	async updateUserAttendance(updateUserAttendanceDto: UpdateUserAttendanceDto) {
		if (updateUserAttendanceDto.passWord !== "42MogleOperator")
			throw "권한이 없습니다";
		const userInfo: UserInfo = await this.dbmanagerService.getUserInfo(updateUserAttendanceDto.intraId);
		const dayInfo: DayInfo = await this.dbmanagerService.getSpecificDayInfo(
			updateUserAttendanceDto.year,
			updateUserAttendanceDto.month,
			updateUserAttendanceDto.day
			);
		if (!dayInfo || !UserInfo)
			throw "잘못된 입력 입니다.";
		const attendanceInfo = await this.dbmanagerService.getAttendanceUserInfo(userInfo, dayInfo)
		if (!attendanceInfo) {
			this.dbmanagerService.updateAtendanceInfo(userInfo, dayInfo, updateUserAttendanceDto);
			return "출석체크 완료";
		}
		else {
			throw "이미 출석체크가 되었습니다."
		}
	}
}
