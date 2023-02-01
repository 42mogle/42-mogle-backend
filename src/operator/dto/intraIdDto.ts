import { ApiProperty } from "@nestjs/swagger";

export class IntraIdDto {
	@ApiProperty()
	intraId: string;
}
