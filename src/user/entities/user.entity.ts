import { Column, Entity, PrimaryColumn, Unique } from "typeorm";

@Entity('User')
@Unique(['id'])
export class User {
    @PrimaryColumn()
    id: string;
    
    @Column({ length: 30 })
    password: string;
  
}
