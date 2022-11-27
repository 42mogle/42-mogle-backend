import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { SetToDayWordDto } from './dto/toDayWord.dto';
import { UpdateUserAttendanceDto } from './dto/updateUserAttendance.dto';

@Controller('operator')
export class OperatorController {
	constructor(private readonly operatorService: OperatorService) {}
	
	@Patch("/setToDayWord/")
	settodayword(@Body() setToDayWordDto: SetToDayWordDto) {
		this.operatorService.setTodayWord(setToDayWordDto);
	}

	@Post("/update/user/attendance")
	updateUserAttendance(@Body() updateUserAttendanceDto: UpdateUserAttendanceDto) {
		return this.operatorService.updateUserAttendance(updateUserAttendanceDto);
	}

	@Post("/update/users/attendanceInfo")
	updateAllusersAttendanceInfo() {
		this.operatorService.updateUsersAttendanceInfo();
	}

	@Post("/update/currentAttendanceCount")
	updateCurrentAttendanceCount() {
		this.operatorService.updateCurrentCount();
	}
}
