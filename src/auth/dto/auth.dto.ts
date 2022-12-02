import { ApiProperty } from "@nestjs/swagger";

export class AuthDto {
    @ApiProperty()
    intraId : string;

    @ApiProperty()
    password : string;

    @ApiProperty()
    photoUrl : string;

    @ApiProperty()
    isOperator : boolean;
}
