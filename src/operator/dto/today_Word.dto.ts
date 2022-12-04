import { ApiProperty } from "@nestjs/swagger";

export class SetTodayWordDto {
	@ApiProperty()
	intraId: string;

	@ApiProperty()
	todayWord: string;
}