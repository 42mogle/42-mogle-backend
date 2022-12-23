import { Body, Controller, Param, Patch, Post, UseGuards, UnauthorizedException, Inject } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { SetTodayWordDto } from './dto/today_Word.dto';
import { UpdateUserAttendanceDto } from './dto/updateUserAttendance.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUserInfo } from 'src/costom-decorator/get-userInfo.decorator';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { GsheetAttendanceDto } from './dto/gsheetAttendance.dto';
import { json } from 'stream/consumers';

@ApiTags('Operator')
@Controller('operator')
export class OperatorController {
	constructor(
		private readonly operatorService: OperatorService,
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
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
		this.logger.log(`[ PATCH /operator/setTodayWord ] requested.`, JSON.stringify(userInfo));
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
		this.logger.log(`[ POST /operator/update/user/attendance ] requested.`, JSON.stringify(userInfo));
		if (userInfo.isOperator === false)
			throw new UnauthorizedException("Not Operator");
		this.operatorService.updateUsersAttendanceInfo();
	}

	/**
	 * POST /operator/update/currentAttendanceCount
	 */
	@Patch("/update/currentAttendanceCount/") // 현재까지 개근 가능한 출석일수를 갱신 //크론으로 대체
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
	updateCurrentAttendanceCount(
		@GetUserInfo() userInfo: UserInfo
	) {
		console.log(` [ POST /operator/update/currentAttendanceCount ] requested.`)
		this.operatorService.updateCurrentCount();
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
	 * PATCH /operator/this-month-info-property
	 */
	 @Patch("this-month-info-property")
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
	 async updateThisMonthInfoProperty(@GetUserInfo() userInfo: UserInfo) {
		 console.log("[PATCH /operator/thisMonthInfoProperty] requested.");
		 this.logger.log("[PATCH /operator/thisMonthInfoProperty] requested.", JSON.stringify(userInfo));
		if (userInfo.isOperator === false) {
			console.log("Not Operator")
			throw new UnauthorizedException("Not Operator");
		}
		 return (await this.operatorService.updateThisMonthInfoProperty());
	 }
}
