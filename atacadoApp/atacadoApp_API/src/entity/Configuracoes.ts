import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity({name: "configuracao"})
export class Configuracoes extends BaseEntity {

    @Column({type: "varchar", length: 2000, unique:true})
    nome_parametro: string

    @Column({type: "varchar", length: 2000})
    valor: string
}