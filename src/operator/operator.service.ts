import { Inject, Injectable } from '@nestjs/common';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { SetToDayWordDto } from './dto/toDayWord.dto';

@Injectable()
export class OperatorService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;

	setTodayWord(setToDayWordDto: SetToDayWordDto) {
		if (this.dbmanagerService.isAdmin(setToDayWordDto.intraId)) {
			this.dbmanagerService.setToDayWord(setToDayWordDto.toDayWord);
			return "success"
		}
		else {
			return "permission denied"
		}
	}
}
