import { ItemPedido } from './ItemPedido';
import { Empresas } from './Empresas';
import { Clientes } from './Clientes';
import { Vendedores } from './Vendedores';
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { statusPedido } from './enum/statusPedido';
import { HistoricoPedido } from './HistoricoPedido';

@Entity({name: "pedidos"})
export class Pedidos extends BaseEntity {

    @Column({type: "varchar", length: 100})
    num_pedido: string

    @Column({type: "float"})
    valor_pedido: number
    
    @Column()
    status_pedido: statusPedido

    @Column()
    previsao_entrega: number

    @ManyToOne(type => Vendedores, vendedores => vendedores.pedidos)
    vendedor: Promise<Vendedores>

    @ManyToOne(type => Clientes, clientes => clientes.pedidos)
    cliente: Promise<Clientes>

    @ManyToOne(type => Empresas, empresa => empresa.pedidos)
    empresa: Promise<Empresas>

    @OneToMany(type => ItemPedido, item => item.pedido, {eager: true})
    itens: ItemPedido[]

    @OneToMany(type => HistoricoPedido, historico => historico.pedido)
    historico: Promise<HistoricoPedido[]>

}