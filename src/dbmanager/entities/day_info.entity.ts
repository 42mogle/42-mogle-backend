import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Attendance } from "./attendance.entity";
import { MonthInfo } from "./month_info.entity";

@Entity()
@Unique(['day', 'monthInfo']) // todo: 기준이 property 인지 name 인지 확인 필요
export class DayInfo {
	@PrimaryGeneratedColumn({ name: "id" })
	id: number;

	@Column({ name: "day" })
	day: number;

	@Column({ name: "type" })
	type: number; // todo: using enum type

	@Column({ name: "attend_user_count" })
	attendUserCount: number;

	@Column({ name: "perfect_user_count" })
	perfectUserCount: number;

	@Column({ name: "today_word"})
	todayWord: string;

	@ManyToOne(
		() => MonthInfo, 
		(monthInfo) => monthInfo.days
	)
	@JoinColumn({
		name: "month_info_id", 
		referencedColumnName: "id", 
	})
	monthInfo: MonthInfo;

	@OneToMany(() => Attendance, (attendance) => attendance.dayInfo)
	attendances: Attendance[];
}
