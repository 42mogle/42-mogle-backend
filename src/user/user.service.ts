import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { CreateAttendanceDto } from '../dbmanager/dto/create-attendance.dto';
import { AttendanceService } from '../attendance/attendance.service';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';

@Injectable()
export class UserService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;
	@Inject(AttendanceService)
	private readonly attendanceService: AttendanceService;

	async getUserInfoByIntraId(inputtedintraId: string) {
		/*
		const user: UserInfo  = await this.dbmanagerService.findUser(inputtedintraId);
		const retIntraId: string = user.intra_id;
		const retIsAdmin: boolean = user.is_admin;
		console.log("In UserService.getUserInfoByIntraId()");
		console.log(`intraId: ${retIntraId}, isAdmin: ${retIsAdmin}`);
		*/
		return ;
	}

	async findAll(): Promise<UserInfo[]> {
		const ret = await this.dbmanagerService.findAll();

		console.log("In UserService.findAll()");
		console.log(ret);
		return ret;
	}

	AttendanceCertification(attendanceinfo: CreateAttendanceDto) {
		if (this.attendanceService.isAttendance(attendanceinfo.intraId)) {
			throw new NotFoundException("이미 출석체크 했습니다.");
		}
		return this.dbmanagerService.attendanceRegistration(attendanceinfo);
	}

	// async buttonPushed(intraId: string): Promise<any> {
	// 	const find = this.dbmanagerService.attendancecheck(intraId);
	// }
}
