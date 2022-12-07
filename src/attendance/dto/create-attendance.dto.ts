import { ApiProperty } from "@nestjs/swagger";

export class CreateAttendanceDto {
	@ApiProperty()
	todayWord: string;
}