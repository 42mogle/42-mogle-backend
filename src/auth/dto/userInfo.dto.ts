import { ApiProperty } from "@nestjs/swagger";

export class UserBasicInfo {
	@ApiProperty()
	photoUrl: string;

	@ApiProperty()
	intraId: string;
}