import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { User } from 'src/dbmanager/entities/user.entity';
import { CreateAttendanceDto } from '../dbmanager/dto/create-attendance.dto';
import { AttendanceService } from '../attendance/attendance.service';

@Injectable()
export class UserService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;
	@Inject(AttendanceService)
	private readonly attendanceService: AttendanceService;

	async getUserInfoByIntraId(inputtedintraId: string): Promise<any> {
		const {userId, intraId, isAdmin, photoURL}  = await this.dbmanagerService.findUser(inputtedintraId);

		console.log("In UserService.getUserInfoByIntraId()");
		console.log(`intraId: ${intraId}, isAdmin: ${isAdmin}`);
		return {intraId, isAdmin};
	}

	async findAll(): Promise<User[]> {
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
