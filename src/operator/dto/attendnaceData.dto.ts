import { ApiProperty } from "@nestjs/swagger";

export class AttendanceData {
	@ApiProperty()
	year: number

	@ApiProperty()
	month: number

	@ApiProperty()
	day: number

	@ApiProperty()
	intraId: string
}