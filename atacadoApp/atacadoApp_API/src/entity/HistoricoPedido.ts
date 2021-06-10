import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Pedidos } from "./Pedidos";

@Entity({name: "historico_pedido"})
export class HistoricoPedido extends BaseEntity {
    @Column({type: "varchar"})
    cidade: string

    @Column({type: "datetime"})
    data: Date

    @Column({type: "varchar"})
    hora: string

    @Column({type: "varchar"})
    situacao: string

    @ManyToOne(type => Pedidos, pedido => pedido.historico)
    pedido: Promise<Pedidos>
}