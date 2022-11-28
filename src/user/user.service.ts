import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { CreateAttendanceDto } from '../dbmanager/dto/create-attendance.dto';
import { AttendanceService } from '../attendance/attendance.service';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { Attendance } from '../dbmanager/entities/attendance.entity';

@Injectable()
export class UserService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;
	@Inject(AttendanceService)
	private readonly attendanceService: AttendanceService;

	async getUserInfoByIntraId(inputtedintraId: string) {
		const user: UserInfo  = await this.dbmanagerService.getUserInfo(inputtedintraId);
		const intraId: string = user.intraId;
		const isOperator: boolean = user.isOperator;
		const PhotoUrl: string = user.photoUrl;
		return { intraId, isOperator, PhotoUrl };
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
