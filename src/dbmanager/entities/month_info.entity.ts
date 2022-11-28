import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { DayInfo } from "./day_info.entity";
import { MonthlyUsers } from "./monthly_users.entity";

@Entity()
@Unique(['month', 'year'])
export class MonthInfo {
	@PrimaryGeneratedColumn({ name: "id" })
	id: number;

	@Column({ name: "month" })
	month: number;

	@Column({ name: "year" })
	year: number;

	@Column({ name: "currentAttednace"})
	currentAttendance: number;

	@Column({ name: "totalAttendance" })
	totalAttendance: number;

	@Column({ name: "perfectUserCount" })
	perfectUserCount: number;

	@Column({ name: "failUserCount" })
	failUserCount: number;

	@OneToMany(
		() => DayInfo, 
		(day_info) => day_info.monthInfo
	)
	days: DayInfo[];

	@OneToMany(
		() => MonthlyUsers, 
		(monthlyUsers) => monthlyUsers.monthInfo
	)
	monthlyUsers: MonthlyUsers[];
}
