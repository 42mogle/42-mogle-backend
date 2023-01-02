import { ApiProperty } from "@nestjs/swagger";

export class DataListDto {
	@ApiProperty()
	year: number

	@ApiProperty()
	month: number

	@ApiProperty()
	intraId: string
}
