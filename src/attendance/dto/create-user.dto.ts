import { ApiProperty } from "@nestjs/swagger";

// dto가 dbmanager, attendance에 다 있는데 둘 중에 뭐가 진짜임?
export class CreateUserDto {
    @ApiProperty()
    intraId: string;

    @ApiProperty()
    password: string;
}