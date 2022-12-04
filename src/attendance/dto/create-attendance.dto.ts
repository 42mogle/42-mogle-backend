import { ApiProperty } from "@nestjs/swagger";

export class CreateAttendanceDto {
	@ApiProperty()
	intraId: string;

	@ApiProperty()
	todayWord: string;
}