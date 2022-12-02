import { ApiProperty } from "@nestjs/swagger";

export class AuthDto {
    @ApiProperty({ type: String })
    intraId : string;

    @ApiProperty({ type: String })
    password : string;

    @ApiProperty({ type: String })
    photoUrl : string;

    @ApiProperty({ type: Boolean })
    isOperator : boolean;
}
