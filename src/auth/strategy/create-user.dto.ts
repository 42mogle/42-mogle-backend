import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty()
    intraId: string;

    @ApiProperty()
    password: string;
}
