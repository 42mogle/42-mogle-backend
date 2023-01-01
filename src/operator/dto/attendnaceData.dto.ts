import { ApiProperty } from "@nestjs/swagger";

export class AttendnaceData {
	@ApiProperty()
	year: number

	@ApiProperty()
	month: number

	@ApiProperty()
	day: number

	@ApiProperty()
	intraId: string
}