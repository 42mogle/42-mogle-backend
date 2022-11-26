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
		const retIntraId: string = user.intraId;
		const retIsAdmin: boolean = user.isAdmin;
		const retPhotoUrl: string = user.photoUrl;
		console.log("In UserService.getUserInfoByIntraId()");
		console.log(`intraId: ${retIntraId}, isAdmin: ${retIsAdmin}, photoUrl: ${retPhotoUrl}`);
		return { retIntraId, retIsAdmin, retPhotoUrl };
	}

	async findAll(): Promise<UserInfo[]> {
		const ret = await this.dbmanagerService.findAll();

		console.log("In UserService.findAll()");
		console.log(ret);
		return ret;
	}
}
