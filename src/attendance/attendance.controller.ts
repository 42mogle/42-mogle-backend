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
	@Get('/:intraId/buttonStatus')
	getUserButtonStatus(@Param('intraId') intraId: string) {
		return this.attendanceService.getUserButtonStatus(intraId);
	}

	@Post('/userAttendance')
	pushButton(@Body() createAttendanceDto: CreateAttendanceDto) {
		return this.attendanceService.AttendanceCertification(createAttendanceDto);
	}

}
