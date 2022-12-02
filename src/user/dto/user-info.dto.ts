import { ApiProperty } from "@nestjs/swagger";

export class UserInfoDto {
    @ApiProperty({ type: 'string' })
    intraId : string;

    @ApiProperty({ type: 'boolean' })
    isOperator : boolean;

    @ApiProperty({ type: 'string' })
    photoUrl : string;
}
