import { Column, Entity, PrimaryColumn, Unique } from "typeorm";

@Entity('User')
// @Unique(['intraId'])
export class User {
    @PrimaryColumn()
    intraId: string;
    
    @Column({ length: 30 })
    password: string;
  
    @Column()
    imageURL: string;
}
