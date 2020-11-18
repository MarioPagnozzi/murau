import { VendedoresEmpresas } from './VendedoresEmpresas';
import { ProdutosEmpresas } from './ProdutosEmpresas';

import { Produtos } from './Produtos';
import { Pedidos } from './Pedidos';
import { ManyToMany, OneToMany } from 'typeorm';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Vendedores } from './Vendedores';
import { Clientes } from './Clientes';
@Entity({name: "empresas"})
export class Empresas extends BaseEntity {

    @Column({type: "int"})
    codigo: number

    @Column({type: "varchar", length: 200 })
    razao_social: string

    @Column({type: "varchar", length: 200})
    nome_fantasia: string

    @Column({type: "varchar", length: 18})
    cnpj: string

    @Column({type: "varchar", length: 9})
    cep: string

    @Column({type: "varchar", length: 200})
    endereco: string

    @Column({type: "varchar", length: 10})
    numero: string

    @Column({type: "varchar", length: 200})
    bairro: string

    @Column({type: "varchar", length: 100})
    cidade: string

    @Column({type: "varchar", length: 2})
    uf: string

    @OneToMany(type => Pedidos, pedidos => pedidos.empresa)
    pedidos: Pedidos[]
    
    @OneToMany(type => VendedoresEmpresas, vendedoresempresas => vendedoresempresas.empresa)
    vendedoresempresas: VendedoresEmpresas[]
   
    @OneToMany(type => ProdutosEmpresas, produtosempresas => produtosempresas.empresa)
    produtosempresas: ProdutosEmpresas[]

    @OneToMany(type => Clientes, cliente => cliente.empresa)
    clientes: Clientes[]
}