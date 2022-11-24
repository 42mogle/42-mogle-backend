import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';

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
}
