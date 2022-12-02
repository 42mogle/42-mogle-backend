import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from '../dbmanager/dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
	constructor(private readonly attendanceService: AttendanceService) {}

	// GET /attendance/{intraId}/buttonStatus
	@Get('/:intraId/buttonStatus')
	@ApiOperation({summary: 'get the attendance button status of the user'})
	@ApiParam({
		name: 'intraId',
		type: String,
	})
	@ApiResponse({
		status: 200, 
		description: 'Success', 
		type: Number
	})
	@ApiResponse({
		status: 401,
		description: 'Error: Unauthorized (Blocked by JwtAuthGuard)'
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	@UseGuards(JwtAuthGuard)
	async getUserButtonStatus(@Param('intraId') intraId: string): Promise<number> {
		console.log("In AttendanceController.getUserButtonStatus");
		console.log(`API[ GET /attendance/${intraId}/buttonStatus ] requested`)
		return this.attendanceService.getUserButtonStatus(intraId);
	}

	// todo -> type: AttendanceButtonStatusDto
	@Post('/userAttendance') // 유저 출석체크 인증
	@UseGuards(JwtAuthGuard)
	pushButton(@Body() createAttendanceDto: CreateAttendanceDto) {
		return this.attendanceService.AttendanceCertification(createAttendanceDto);
	}
}
