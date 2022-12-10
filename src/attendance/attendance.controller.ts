import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, UseGuards, Inject } from '@nestjs/common';
import { GetUserInfo } from 'src/costom-decorator/get-userInfo.decorator';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
	constructor(
		private readonly attendanceService: AttendanceService,
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
		) {}

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
		//console.log(`[ GET /attendance/${userInfo.intraId}/buttonStatus ] requested.`)
		this.logger.debug('[ GET /attendance/buttonStatus ] requested', userInfo.intraId);
		return this.attendanceService.getUserButtonStatus(userInfo);
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
	async pushButton(
		@Body() attendanceDto: CreateAttendanceDto,
		@GetUserInfo() userInfo: UserInfo
		) {
		console.log(`[ POST /attendance/userAttendance ] requested.`);
		console.log(`createAttendanceDto.intraId: [${userInfo.intraId}]`);
		console.log(`createAttendanceDto.todayWord: [${attendanceDto.todayWord}]`);
		this.logger.debug('[ POST /attendance/userAttendance ] requested ' + userInfo.intraId, JSON.stringify(attendanceDto));
		// todo: return object를 DTO로 정의하기
		return await this.attendanceService.AttendanceCertification(attendanceDto, userInfo);
	}
}
