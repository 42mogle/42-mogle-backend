import { ApiProperty } from "@nestjs/swagger";

export class OperatorList {
	@ApiProperty()
	intraIdList: string[]
}
