import { ApiProperty } from "@nestjs/swagger";

export class IntraIdDto {
    @ApiProperty({
        type: String,
        example: 'intraid',
        description: '사용자 인트라 아이디',
        required: true
    })
    intraId : string;
}
