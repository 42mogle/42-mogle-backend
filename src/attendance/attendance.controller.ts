import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GetUserInfo } from 'src/costom-decorator/get-userInfo.decorator';
import { UserInfo } from '../dbmanager/entities/user_info.entity';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
	constructor(private readonly attendanceService: AttendanceService) {}

	/**
	 * GET /attendance/buttonStatus
	 */
	@Get('/buttonStatus')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({summary: 'get the attendance button status of the user'})
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
	async getUserButtonStatus(@GetUserInfo() userInfo: UserInfo): Promise<number> {
		console.log(`API[ GET /attendance/${userInfo.intraId}/buttonStatus ] requested.`)
		// todo: return number에 따른 상태를 문서에 명시하거나, enum으로 바꿔서 명시하기
		return this.attendanceService.getUserButtonStatus(userInfo);
	}

	/**
	 * GET /attendance/userAttendance
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
	async pushButton(
		@Body() AttendanceDto: CreateAttendanceDto,
		@GetUserInfo() userInfo: UserInfo
		) {
		// todo: return object를 DTO로 정의하기
		return await this.attendanceService.AttendanceCertification(AttendanceDto, userInfo);
	}
}
