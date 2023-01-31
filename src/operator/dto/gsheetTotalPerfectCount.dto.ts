import { ApiProperty } from "@nestjs/swagger";

export class GsheetTotalPerfectCount {
	@ApiProperty()
	intraId: string;

	@ApiProperty()
	totalPerfectCount: number;
}
