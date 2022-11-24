import { Inject, Injectable } from '@nestjs/common';
import { DbmanagerService } from '../dbmanager/dbmanager.service';

@Injectable()
export class OperatorService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;

	setTodayWord(today_word: string) {
		this.dbmanagerService.setToDayWord(today_word);
	}
}
