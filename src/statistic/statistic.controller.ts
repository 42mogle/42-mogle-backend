import { Controller, Get, Param } from '@nestjs/common';
import { Attendance } from 'src/dbmanager/entities/attendance.entity';
import { StatisticService } from './statistic.service';

@Controller('statistic')
export class StatisticController {
	constructor(private readonly statisticService: StatisticService) {}

	@Get("/:intraId/userAttendanceList")
	async getUserAttendanceList(@Param("intraId") intraId: string): Promise<Attendance[]> {
		return await this.statisticService.getAttendanceList(intraId);
	}

	//출석 일수
	//개근 일수
	@Get(":intraId/userAttendanceState")
	async getUserAttendanceState(@Param("intraId") intraId: string) {
		return this.statisticService.getUserMonthStatus(intraId);
	}
}
