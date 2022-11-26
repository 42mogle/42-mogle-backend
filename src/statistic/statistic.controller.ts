import { Controller, Get, Param } from '@nestjs/common';
import { Attendance } from 'src/dbmanager/entities/attendance.entity';
import { StatisticService } from './statistic.service';

@Controller('statistic')
export class StatisticController {
	constructor(private readonly statisticService: StatisticService) {}

	//출석 일수
	//개근 일수
	@Get("/:userId/attendanceInfo")
	getAttendanceInfo(@Param("userId") userId: number) {
		return 
	}

	@Get("/:userId/userAttendanceList")
	async getUserAttendanceList(@Param("intraId") intraId: string): Promise<Attendance[]> {
		return await this.statisticService.getAttendanceList(intraId);
	}
}
