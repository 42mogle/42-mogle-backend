import { ConsoleLogger, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Attendance } from 'src/dbmanager/entities/attendance.entity';
import { StatisticService } from './statistic.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Statistic')
@Controller('statistic')
export class StatisticController {
	constructor(private readonly statisticService: StatisticService) {}

	@Get("/:intraId/userAttendanceList")
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
	async getUserAttendanceList(@Param("intraId") intraId: string): Promise<Attendance[]> {
		console.log("[GET /statistic/{intraId}/userAttendanceList] requested.");
		return await this.statisticService.getAttendanceList(intraId);
	}

	//출석 일수
	//개근 여부
	@UseGuards(JwtAuthGuard)
	@Get(":intraId/userAttendanceState") //메인 화면에 띄워줄 출석인수와 개근여부를 반환
	async getUserAttendanceState(@Param("intraId") intraId: string) {
		return this.statisticService.getUserMonthStatus(intraId);
	}
}
