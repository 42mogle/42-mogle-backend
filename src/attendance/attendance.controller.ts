import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from '../dbmanager/dto/create-attendance.dto';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
	constructor(private attendanceService: AttendanceService) {}

	@ApiOperation({summary: 'get the attendance button status of the user'})
	@ApiParam({
		name: 'intraId',
		type: 'string',
	})
	@ApiOkResponse({
		description: 'Success'
	})
	@Get('/:intraId/buttonStatus') // 유저 출석체크 버튼의 상태
	getUserButtonStatus(@Param('intraId') intraId: string) {
		return this.attendanceService.getUserButtonStatus(intraId);
	}

	@Post('/userAttendance') // 유저 출석체크 인증
	pushButton(@Body() createAttendanceDto: CreateAttendanceDto) {
		return this.attendanceService.AttendanceCertification(createAttendanceDto);
	}

}
