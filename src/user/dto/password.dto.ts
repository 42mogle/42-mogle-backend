import { ApiProperty } from "@nestjs/swagger";

export class PasswordDto {
    @ApiProperty({
        type: String,
        example: 'q1w2e3r4T%',
        description: '비밀번호',
        required: true
    })
    password : string;
}
