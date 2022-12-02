import { ApiProperty } from "@nestjs/swagger";

export class UserInfoDto {
    @ApiProperty({ type: String })
    intraId : string;

    @ApiProperty({ type: Boolean })
    isOperator : boolean;

    @ApiProperty({ type: String })
    photoUrl : string;
}
