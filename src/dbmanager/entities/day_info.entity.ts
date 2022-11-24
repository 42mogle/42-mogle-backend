import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Attendance } from "./attendance.entity";
import { MonthInfo } from "./month_info.entity";

@Entity()
@Unique(['day', 'monthInfo'])
export class DayInfo {
	@PrimaryGeneratedColumn({ name: "id" })
	id: number;

	@Column({ name: "day" })
	day: number;

	@Column({ name: "type" })
	type: number; // todo: using enum type

	@Column({ name: "attendUserCount" })
	attendUserCount: number;

	@Column({ name: "perfectUserCount" })
	perfectUserCount: number;

	@Column({ name: "todayWord"})
	todayWord: string;

	@ManyToOne(
		() => MonthInfo, 
		(monthInfo) => monthInfo.days
	)
	@JoinColumn({
		name: "monthInfoId", 
		referencedColumnName: "id", 
	})
	monthInfo: MonthInfo;

	@OneToMany(() => Attendance, (attendance) => attendance.dayInfo)
	attendances: Attendance[];
}
