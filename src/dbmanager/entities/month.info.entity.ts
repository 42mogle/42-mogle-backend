import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
//@Unique([])
export class MonthInfo extends BaseEntity {
	@PrimaryGeneratedColumn()
	monthId: number; // todo: PK

	@Column()
	month: number; // todo: FK

	@Column()
	Year: number;

	@Column()
	totalAttendance: number;

	@Column()
	perfcetUserCount: number;

	@Column()
	failUserCount: number;
}
