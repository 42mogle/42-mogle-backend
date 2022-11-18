import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class MonthlyUsers extends BaseEntity {
	@Column()
	monthId: number; // todo: FK

	@Column()
	userId: number; // todo: FK

	@Column()
	attendanceCount: number;

	@Column()
	isPerfect: boolean;

	@Column()
	totalPerfectCount: number;
}
