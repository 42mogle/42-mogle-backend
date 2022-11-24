import { Controller, Param, Patch, Post } from '@nestjs/common';
import { OperatorService } from './operator.service';

@Controller('operator')
export class OperatorController {
	constructor(private readonly operatorService: OperatorService) {}
	
	@Patch("/setToDayWord/:today_word")
	settodayword(@Param("today_word") today_word: string) {
		this.operatorService.setTodayWord(today_word);
	}
}
