import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class Attendance extends BaseEntity {
	@PrimaryGeneratedColumn() // 서버 테스트를 위한 임시 PK
	test_pk: number;
	
	@Column() 
	time_log: Date; // todo: using datetime

	@Column()
	day_id: number; // todo: FK

	@Column()
	user_id: number; // todo: FK
}
