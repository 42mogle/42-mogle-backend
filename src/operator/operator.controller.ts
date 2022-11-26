import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { SetToDayWordDto } from './dto/toDayWord.dto';

@Controller('operator')
export class OperatorController {
	constructor(private readonly operatorService: OperatorService) {}
	
	@Patch("/setToDayWord/")
	settodayword(@Body() setToDayWordDto: SetToDayWordDto) {
		this.operatorService.setTodayWord(setToDayWordDto);
	}
}
