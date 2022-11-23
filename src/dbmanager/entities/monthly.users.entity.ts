import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class MonthlyUsers extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;
	
	@Column()
	monthId: number;

	@Column()
	userId: number;

	@Column()
	AttendanceCount: number;

	@Column()
	isPerfect: boolean;

	@Column()
	totalPerfectCount: number;
}
