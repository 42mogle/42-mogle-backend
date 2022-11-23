import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class Attendance extends BaseEntity {
	@PrimaryGeneratedColumn() // 서버 테스트 오류해결용 임시 PK
	timelog: string; // todo: using datetime

	@Column()
	dayId: number; // todo: FK

	@Column()
	userId: number; // todo: FK
}
