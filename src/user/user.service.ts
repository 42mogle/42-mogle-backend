import { Inject, Injectable } from '@nestjs/common';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { User } from 'src/dbmanager/entities/user.entity';

@Injectable()
export class UserService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;

	async getUserInfoByIntraId(intraId: string): Promise<User> {
		const ret = await this.dbmanagerService.findUser(intraId);

		console.log("In UserService.getUserInfoByIntraId()");
		console.log(ret);
		return ret;
	}

	async findAll(): Promise<User[]> {
		const ret = await this.dbmanagerService.findAll();

		console.log("In UserService.findAll()");
		console.log(ret);
		return ret;
	}
}
