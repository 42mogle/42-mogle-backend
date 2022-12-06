import { ApiProperty } from "@nestjs/swagger";

// todo: Rename to SignInDto ?
export class AuthDto {
    @ApiProperty({
        type: String,
        example: 'mgo',
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

    @ApiProperty({
        type: String,   
        description: '사진 URL',
        required: false
    })
    photoUrl : string;
}
