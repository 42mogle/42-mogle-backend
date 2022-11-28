import { ConsoleLogger, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Attendance } from 'src/dbmanager/entities/attendance.entity';
import { StatisticService } from './statistic.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('statistic')
export class StatisticController {
	constructor(private readonly statisticService: StatisticService) {}

	@UseGuards(JwtAuthGuard)
	@Get("/:intraId/userAttendanceList")
	async getUserAttendanceList(@Param("intraId") intraId: string): Promise<Attendance[]> {
		console.log("왔니?");
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
