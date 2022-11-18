import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class Attendance extends BaseEntity {
	@Column()
	timelog: string; // todo: using datetime

	@Column()
	dayId: number; // todo: FK

	@Column()
	userId: number; // todo: FK
}
