import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { CreateAttendanceDto } from '../dbmanager/dto/create-attendance.dto';
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

	async findAll(): Promise<UserInfo[]> {
		const ret = await this.dbmanagerService.findAll();

		console.log("In UserService.findAll()");
		console.log(ret);
		return ret;
	}

 	async AttendanceCertification(attendanceinfo: CreateAttendanceDto): Promise<Attendance> {
		const toDayWord: string = await this.dbmanagerService.getToDayWord();
		if (await this.attendanceService.isAttendance(attendanceinfo.intraId)) {
			throw new NotFoundException("이미 출석체크 했습니다.");
		}
		else if (attendanceinfo.todayWord !== toDayWord) {
			throw new NotFoundException("오늘의 단어가 다릅니다!");
		}
		return this.dbmanagerService.attendanceRegistration(attendanceinfo);
	}
}
