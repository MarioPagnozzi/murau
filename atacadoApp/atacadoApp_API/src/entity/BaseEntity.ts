import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    uid: number;

    @Column({default: true})
    ativo: boolean;

    @Column({default: false})
    excluido: boolean;   

    @CreateDateColumn({type: "timestamp"})
    data_inclusao: Date;

    @UpdateDateColumn({type: "timestamp"})
    data_alteracao: Date;

}