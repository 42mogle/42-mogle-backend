import { Inject, Injectable } from '@nestjs/common';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { User } from 'src/dbmanager/entities/user.entity';

@Injectable()
export class UserService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;

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

	// async buttonPushed(intraId: string): Promise<any> {
	// 	const find = this.dbmanagerService.attendancecheck(intraId);
	// }
}
