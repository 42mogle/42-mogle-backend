import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { SetTodayWordDto } from './dto/todayWord.dto';
import { UpdateUserAttendanceDto } from './dto/updateUserAttendance.dto';

@Controller('operator')
export class OperatorController {
	constructor(private readonly operatorService: OperatorService) {}
	
	@Patch("/setTodayWord") // 오늘의 단어 설정
	settodayword(@Body() setTodayWordDto: SetTodayWordDto) {
		this.operatorService.setTodayWord(setTodayWordDto);
	}

	@Post("/update/user/attendance") // 유저의 출석데이터를 임의로 추가함
	updateUserAttendance(@Body() updateUserAttendanceDto: UpdateUserAttendanceDto) {
		return this.operatorService.updateUserAttendance(updateUserAttendanceDto);
	}

	@Post("/update/users/attendanceInfo") // 모든 유저의 출석정보를 업데이트함 //크론으로 대체
	updateAllusersAttendanceInfo() {
		this.operatorService.updateUsersAttendanceInfo();
	}

	@Post("/update/currentAttendanceCount") // 현재까지 개근 가능한 출석일수를 갱신 //크론으로 대체
	updateCurrentAttendanceCount() {
		this.operatorService.updateCurrentCount();
	}
}
