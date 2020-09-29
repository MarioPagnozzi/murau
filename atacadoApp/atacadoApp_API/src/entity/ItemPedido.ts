import { Pedidos } from './Pedidos';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity({name: "itempedido"})
export class ItemPedido extends BaseEntity {

    @Column({type: "float"})
    qtd_produto: number

    @Column({type: "float"})
    valor_total: number

    @ManyToOne(type => Pedidos, pedido => pedido.itens)
    pedido: Pedidos
}