import { ApiProperty } from "@nestjs/swagger";

export class GsheetAttendanceDto {
	@ApiProperty()
	intraId: string;

	@ApiProperty()
	date: string;

	@ApiProperty()
	time: string;
}
