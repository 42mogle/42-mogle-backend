import { Body, Controller, Patch, Post, UseGuards, UnauthorizedException, Inject, Get, Param, Delete } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { SetTodayWordDto } from './dto/today_Word.dto';
import { UpdateUserAttendanceDto } from './dto/updateUserAttendance.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUserInfo } from 'src/costom-decorator/get-userInfo.decorator';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { WinstonLogger, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GsheetAttendanceDto } from './dto/gsheetAttendance.dto';
import { DataListDto } from './dto/dataList.dto';
import { AttendanceData } from './dto/attendnaceData.dto';
import { IntraIdDto } from './dto/intraIdDto';
import { GsheetTotalPerfectCount } from './dto/gsheetTotalPerfectCount.dto';

@ApiTags('Operator')
@Controller('operator')
export class OperatorController {
	constructor(
		private readonly operatorService: OperatorService,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: WinstonLogger,
		) { }
	
	/**
	 * PATCH /operator/setTodayWord
	 */
	@Patch("/setTodayWord") // 오늘의 단어 설정
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({summary: 'set today word'})
	@ApiResponse({
		status: 201, // todo: consider
		description: 'Success', 
	})
	@ApiResponse({
		status: 401,
		description: 'Error: Unauthorized (Blocked by JwtAuthGuard)'
	})
	SetTodayWord(
		@Body() todayWordDto: SetTodayWordDto,
		@GetUserInfo() userInfo: UserInfo
		) {
		this.operatorService.setTodayWord(todayWordDto, userInfo);
		console.log(`[ PATCH /operator/setTodayWord ] requested.`);
		console.log(`setTodayWordDto.intraId: [${userInfo.intraId}]`);
		console.log(`setTodayWordDto.todayWord: [${todayWordDto.todayWord}]`);
		this.logger.log(`[ PATCH /operator/setTodayWord ] requested.`, JSON.stringify(userInfo.intraId) + ' ' + JSON.stringify(todayWordDto));
		this.operatorService.setTodayWord(todayWordDto, userInfo);
	}

	/**
	 * POST /operator/update/user/attendance
	 */
	@Post("/update/user/attendance") // 유저의 출석데이터를 임의로 추가함 보류
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({summary: 'add a user attendance'})
	@ApiResponse({
		status: 201, 
		description: 'Success', 
		// todo: Set type using dto
	})
	@ApiResponse({
		status: 401,
		description: 'Error: Unauthorized (Blocked by JwtAuthGuard)'
	})
	updateUserAttendance(
		@GetUserInfo() userInfo: UserInfo,
		@Body() updateUserAttendanceDto: UpdateUserAttendanceDto
		) {
		console.log(`[ POST /operator/update/user/attendance ] requested.`);
		console.log(`updateUserAttendanceDto.intraId: [${updateUserAttendanceDto.intraId}]`);
		console.log(`updateUserAttendanceDto.year: [${updateUserAttendanceDto.year}]`);
		console.log(`updateUserAttendanceDto.month: [${updateUserAttendanceDto.month}]`);
		console.log(`updateUserAttendanceDto.day: [${updateUserAttendanceDto.day}]`);
		this.logger.log(`[ POST /operator/update/user/attendance ] requested.` + userInfo.intraId, JSON.stringify(updateUserAttendanceDto));
		if (!userInfo.isOperator)
			return new UnauthorizedException("Not Operator");
		return this.operatorService.updateUserAttendance(updateUserAttendanceDto);
	}

	/**
	 * POST /operator/update/users/attendanceInfo
	 */
	@Post("/update/users/attendanceInfo") // 모든 유저의 출석정보를 업데이트함 //크론으로 대체
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({summary: 'update all monthly users attendance info'})
	@ApiResponse({
		status: 201, 
		description: 'Success', 
	})
	@ApiResponse({
		status: 401,
		description: 'Error: Unauthorized (Blocked by JwtAuthGuard)'
	})
	updateAllUsersAttendanceInfo(@GetUserInfo() userInfo: UserInfo) {
		this.logger.log(`[ POST /operator/update/user/attendance ] requested.`, JSON.stringify(userInfo.intraId));
		if (userInfo.isOperator === false)
			throw new UnauthorizedException("Not Operator");
		this.operatorService.updateUsersAttendanceInfo();
	}

	/**
	 * PATCH /operator/update/this-month/current-attendance
	 */
	@Patch("/update/this-month/current-attendance/") // 현재까지 개근 가능한 출석일수를 갱신 //크론으로 대체
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({summary: 'update month currrent attendance count'})
	@ApiResponse({
		status: 201, 
		description: 'Success', 
	})
	@ApiResponse({
		status: 401,
		description: 'Error: Unauthorized (Blocked by JwtAuthGuard)'
	})
	async updateThisMonthCurrentAttendanceCount(
		@GetUserInfo() userInfo: UserInfo
	) {
		console.log(` [ PATCH /operator/update/this-month/current-attendance ] requested.`)
		if (userInfo.isOperator === false)
			throw new UnauthorizedException("Not Operator");
		const monthInfo = await this.operatorService.updateThisMonthCurrentAttendance();
		return monthInfo;
	}


	/**
	 * POST /operator/gsheet-attendance
	 */
	@Post("/gsheet-attendance") // 유저의 출석데이터를 임의로 추가함 보류
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({summary: 'add a user attendance from gsheet'})
	@ApiResponse({
		status: 201, 
		description: 'Success', 
		// todo: Set type using dto
	})
	@ApiResponse({
		status: 401,
		description: 'Error: Unauthorized (Blocked by JwtAuthGuard)'
	})
	async addAttendanceFromGsheet(
		@GetUserInfo() userInfo: UserInfo,
		@Body() gsheetAttendanceDto: GsheetAttendanceDto,
		) {
		console.log("[ POST /operator/gsheet-attendance ] requested.");
		return (await this.operatorService.addAttendanceFromGsheet(userInfo, gsheetAttendanceDto));
	}

	/**
	 * POST /operator/total-perfect-count
	 */
	@Post("/gsheet/total-perfect-count") // 유저의 출석데이터를 임의로 추가함 보류
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({summary: 'add a user attendance from gsheet'})
	@ApiResponse({
		status: 201, 
		description: 'Success', 
		// todo: Set type using dto
	})
	@ApiResponse({
		status: 401,
		description: 'Error: Unauthorized (Blocked by JwtAuthGuard)'
	})
	async addTotalPerfectCountFromGsheet(
		@GetUserInfo() userInfo: UserInfo,
		@Body() gsheetTotalPerfectCountDto: GsheetTotalPerfectCount,
		) {
		if (userInfo.isOperator === false)
			throw new UnauthorizedException("Not Operator");
		console.log("[ POST /operator/total-perfect-count ] requested.");
		return (await this.operatorService.addTotalPerfectCountFromGsheet(userInfo, gsheetTotalPerfectCountDto));
	}

	/**
	 * PATCH /operator/month-info-property/{year}/{month}
	 */
	 @Patch("month-info-property/:year/:month")
	 @UseGuards(JwtAuthGuard)
	 @ApiBearerAuth('access-token')
	 @ApiOperation({
		 summary: 'update user info property',
		 description: 'month_info table의 property(current_attendance 등)을 업데이트'
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
	 async updateMonthInfoProperty(@GetUserInfo() userInfo: UserInfo, @Param('year') year: number, @Param('month') month: number) {
		 console.log("[PATCH /operator/month-info-property] requested.");
		 console.log(`year: ${year}, month: ${month}`);
		 this.logger.log("[PATCH /operator/month-info-property] requested.", JSON.stringify(userInfo.intraId));
		if (userInfo.isOperator === false) {
			console.log("Not Operator")
			throw new UnauthorizedException("Not Operator");
		}
		 return (await this.operatorService.updateMonthInfoProperty(year, month));
	 }

	@Get('/attendance-list/:year/:month/:intraId')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Returns the user\'s attendance log',
		description: 'admin page에서 intraId를 입력 하면 해당 유저의 해당 연 월의 attendance log 반환'
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized'
	})
	async getAttendanceLogByUser(
		@Param()
		dataListDto: DataListDto,
		@GetUserInfo()
		userInfo: UserInfo
	) {
		this.logger.log('/attendance-list/:year/:month/:day/:intraId', JSON.stringify(dataListDto) + " " + userInfo.intraId)
		if (!userInfo.isOperator) {
			this.logger.log(userInfo.intraId + " is not operator")
			throw new UnauthorizedException()
		}
		return await this.operatorService.findUserAttendanceLog(dataListDto)
	}

	@Post("/attendance-add")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Returns the user\'s attendance log',
		description: '관리자 페이지에서 유저의 출석정보를 추가'
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized'
	})
	async UserAttendanceLogAdd(
		@Body() attendanceData: AttendanceData,
		@GetUserInfo() userInfo: UserInfo
	) {
		this.logger.log('/attendance-add' + "request Id : " + userInfo.intraId, JSON.stringify(attendanceData))
		if (!userInfo.isOperator) {
			this.logger.log(userInfo.intraId + " is not operator")
			throw new UnauthorizedException()
		}
		return await this.operatorService.userAttendanceLogAdd(attendanceData)
	}

	@Post("/attendance-delete")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Returns the user\'s attendance log',
		description: '관리자 페이지에서 유저의 출석정보를 삭제'
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized'
	})
	@ApiResponse({
		status: 404,
		description: 'NotFound'
	})
	async UserAttendanceDelete(
		@Body() attendanceData: AttendanceData,
		@GetUserInfo() userInfo: UserInfo
	) {
		this.logger.log('/attendance-delete' + "request Id : " + userInfo.intraId, JSON.stringify(attendanceData))
		if (!userInfo.isOperator) {
			this.logger.log(userInfo.intraId + " is not operator")
			throw new UnauthorizedException()
		}
		return await this.operatorService.userAttendanceLogDelete(attendanceData)
	}

	@Post("/add-operator")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	addOperator(
		@GetUserInfo() userInfo: UserInfo,
		@Body() intraId: IntraIdDto
	) {
		this.logger.log('/add-operator' + "request Id : ", userInfo.intraId)
		if (!userInfo.isOperator) {
			this.logger.log(userInfo.intraId + " is not operator")
			throw new UnauthorizedException()
		}
		this.operatorService.addOperator(intraId.intraId)
	}

	@Post("/delete-operator")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	deleteOperator(
		@GetUserInfo() userInfo: UserInfo,
		@Body() intraId: IntraIdDto
	) {
		this.logger.log('/delete-operator' + "request Id : ", userInfo.intraId)
		if (!userInfo.isOperator) {
			this.logger.log(userInfo.intraId + " is not operator")
			throw new UnauthorizedException()
		}
		this.operatorService.deleteOperator(intraId.intraId)
	}

	@Get('/today-word')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Returns the today\'s word',
		description: '오늘의 단어를 반환한다. 만약, 오늘의 단어가 설정되어 있지 않다면 null을 반환한다.'
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized'
	})
	async getTodayWord(
		@GetUserInfo()
		userInfo: UserInfo
	) {
		this.logger.log('/operator/today-word/', userInfo.intraId)
		if (!userInfo.isOperator) {
			this.logger.log(userInfo.intraId + " is not operator")
			throw new UnauthorizedException()
		}
		return await this.operatorService.getTodayWord();
	}
}
