import { BaseEntity, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(["id", "intra_id"])
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	intra_id: string;

	@Column()
	password: string;

	@Column()
	is_admin: boolean;

	@Column()
	photo_url: string;
}
