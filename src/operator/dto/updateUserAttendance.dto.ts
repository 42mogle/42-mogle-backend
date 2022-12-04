import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserAttendanceDto {
	@ApiProperty()
	passWord: string;

	@ApiProperty()
	intraId: string;

	@ApiProperty()
	year: number;

	@ApiProperty()
	month: number;

	@ApiProperty()
	day: number;
}
