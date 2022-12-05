import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
	constructor(private readonly attendanceService: AttendanceService) {}

	/**
	 * GET /attendance/{intraId}/buttonStatus
	 */
	@Get('/:intraId/buttonStatus')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
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
	async getUserButtonStatus(@Param('intraId') intraId: string): Promise<number> {
		console.log(`[ GET /attendance/${intraId}/buttonStatus ] requested.`)
		// todo: return number에 따른 상태를 문서에 명시하거나, enum으로 바꿔서 명시하기
		return this.attendanceService.getUserButtonStatus(intraId);
	}

	/**
	 * POST /attendance/userAttendance
	 */
	@Post('/userAttendance')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({summary: 'try for a user to attend'})
	@ApiResponse({
		status: 201, 
		description: 'Success', 
		// todo: Set type using dto
	})
	@ApiResponse({
		status: 401,
		description: 'Error: Unauthorized (Blocked by JwtAuthGuard)'
	})
	async pushButton(@Body() createAttendanceDto: CreateAttendanceDto) {
		console.log(`[ POST /attendance/userAttendance ] requested.`);
		console.log(`intraId: [${createAttendanceDto.intraId}]`);
		console.log(`sentWord: [${createAttendanceDto.todayWord}]`);
		// todo: return object를 DTO로 정의하기
		return await this.attendanceService.AttendanceCertification(createAttendanceDto);
	}
}
