import { ApiProperty } from "@nestjs/swagger";

// todo: Rename to SignInDto ?
export class AuthDto {
    @ApiProperty({
        type: String,
        example: 'intraid',
        description: '사용자 인트라 아이디',
        required: true
    })
    intraId : string;

    @ApiProperty({
        type: String,
        example: 'q1w2e3r4T%',
        description: '비밀번호',
        required: true
    })
    password : string;
}
