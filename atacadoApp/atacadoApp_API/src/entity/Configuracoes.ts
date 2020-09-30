import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity({name: "configuracao"})
export class Configuracoes extends BaseEntity {

    @Column({type: "varchar", length: 50, unique:true})
    nome_parametro: string

    @Column({type: "varchar", length: 50})
    valor: string
}