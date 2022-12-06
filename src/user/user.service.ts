import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { CreateAttendanceDto } from '../attendance/dto/create-attendance.dto';
import { AttendanceService } from '../attendance/attendance.service';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { Attendance } from '../dbmanager/entities/attendance.entity';
import { UserInfoDto } from './dto/user-info.dto';

@Injectable()
export class UserService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;
	@Inject(AttendanceService)
	private readonly attendanceService: AttendanceService;

	async getUserInfoByIntraId(inputtedintraId: string): Promise<UserInfoDto> {
		const user: UserInfo  = await this.dbmanagerService.getUserInfo(inputtedintraId);
		// todo: user를 못 찾으면 따로 에러처리 유무 조사하고 결정하기
		
		const userInfoDto: UserInfoDto = {
			intraId: user.intraId,
			isOperator: user.isOperator,
			photoUrl: user.photoUrl
		};
		return userInfoDto;
	}

	// todo: Remove
	async findAll(): Promise<UserInfo[]> {
		const ret = await this.dbmanagerService.findAll();

		console.log("In UserService.findAll()");
		console.log(ret);
		return ret;
	}
}
