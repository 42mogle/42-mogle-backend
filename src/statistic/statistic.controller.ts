import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { Attendance } from 'src/dbmanager/entities/attendance.entity';
import { StatisticService } from './statistic.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUserInfo } from 'src/costom-decorator/get-userInfo.decorator';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { WINSTON_MODULE_PROVIDER, WinstonLogger, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@ApiTags('Statistic')
@Controller('statistic')
export class StatisticController {
	constructor(
		private readonly statisticService: StatisticService,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: WinstonLogger,
		) {}

	/**
	 * GET /statistic/{intraId}/userAttendanceList
	 */
	@Get("/userAttendanceList")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'get the user attendance list',
		description: '유저 출석 정보 리스트 요청'
	})
	@ApiParam({
		name: 'intraId',
		type: String,
	})
	@ApiResponse({
		status: 200, 
		description: 'Success', 
		// todo: type: Attendance list
	})
	@ApiResponse({
		status: 401,
		description: 'Error: Unauthorized (Blocked by JwtAuthGuard: No JWT access-token)'
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	async getUserAttendanceList(@GetUserInfo() userInfo: UserInfo): Promise<Attendance[]> {
		console.log("[GET /statistic/userAttendanceList] requested.");
		this.logger.log("[GET /statistic/userAttendanceList] requested.", JSON.stringify(userInfo));
		return await this.statisticService.getAttendanceList(userInfo);
	}

	/**
	 * GET /statistic/{intraId}/userAttendanceState
	 */
	@Get("userAttendanceState")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'get the user attendance state',
		description: '유저 home 화면에 띄워줄 출석일수와 개근여부를 반환'
	})
	@ApiParam({
		name: 'intraId',
		type: String,
	})
	@ApiResponse({
		status: 200, 
		description: 'Success', 
		// todo: type: DTO로 정의하기
	})
	@ApiResponse({
		status: 401,
		description: 'Error: Unauthorized (Blocked by JwtAuthGuard: No JWT access-token)'
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	async getUserAttendanceState(@GetUserInfo() userInfo: UserInfo) {
		console.log("[GET /statistic/userAttendanceState] requested.");
		this.logger.log("[GET /statistic/userAttendanceState] requested.", JSON.stringify(userInfo));
		return await this.statisticService.getUserMonthStatus(userInfo);
	}
}
