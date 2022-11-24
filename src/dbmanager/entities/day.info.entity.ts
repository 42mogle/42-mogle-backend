import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class DayInfo extends BaseEntity {
	@PrimaryGeneratedColumn()
	dayId: number;

	@Column({name: "day"})
	day: number;

	@Column()
	monthId: number; // todo: FK

	@Column()
	type: number;

	@Column()
	attendUserCount: number;

	@Column()
	perfectUserCount: number;

	@Column()
	today_word: string;
}
