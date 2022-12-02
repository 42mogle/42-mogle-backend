import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { SetTodayWordDto } from './dto/today_Word.dto';
import { UpdateUserAttendanceDto } from './dto/updateUserAttendance.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Operator')
@Controller('operator')
export class OperatorController {
	constructor(private readonly operatorService: OperatorService) {}
	
	@UseGuards(JwtAuthGuard)
	@Patch("/setTodayWord") // 오늘의 단어 설정
	settodayword(@Body() setTodayWordDto: SetTodayWordDto) {
		this.operatorService.setTodayWord(setTodayWordDto);
	}

	@UseGuards(JwtAuthGuard)
	@Post("/update/user/attendance") // 유저의 출석데이터를 임의로 추가함
	updateUserAttendance(@Body() updateUserAttendanceDto: UpdateUserAttendanceDto) {
		return this.operatorService.updateUserAttendance(updateUserAttendanceDto);
	}

	@UseGuards(JwtAuthGuard)
	@Post("/update/users/attendanceInfo") // 모든 유저의 출석정보를 업데이트함 //크론으로 대체
	updateAllusersAttendanceInfo() {
		this.operatorService.updateUsersAttendanceInfo();
	}

	@UseGuards(JwtAuthGuard)
	@Post("/update/currentAttendanceCount") // 현재까지 개근 가능한 출석일수를 갱신 //크론으로 대체
	updateCurrentAttendanceCount() {
		this.operatorService.updateCurrentCount();
	}
}
