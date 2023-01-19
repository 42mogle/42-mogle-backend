import { ApiProperty } from "@nestjs/swagger";

export class UserOperatorInfo {
	@ApiProperty()
	intraId: string;

	@ApiProperty()
	isOperator: boolean;
}
