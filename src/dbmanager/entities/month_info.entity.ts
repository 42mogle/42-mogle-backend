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

	@Column({ name: "current_attednace"})
	currentAttendance: number;

	@Column({ name: "total_attendance" })
	totalAttendance: number;

	@Column({ name: "perfect_user_count" })
	perfectUserCount: number;

	@Column({ name: "total_user_count" })
	totalUserCount: number;

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
