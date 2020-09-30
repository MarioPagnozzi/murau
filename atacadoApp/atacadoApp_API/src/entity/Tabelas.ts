import {Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity({ name: "tabelas"})
export class Tabelas extends BaseEntity {

    @Column({type: "varchar", length: 50, unique: true})
    tabela: string
}