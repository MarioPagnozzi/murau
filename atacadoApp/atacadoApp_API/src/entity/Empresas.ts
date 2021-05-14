import { ProdutosEmpresas } from './ProdutosEmpresas';
import { Pedidos } from './Pedidos';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Clientes } from './Clientes';
import { VendedoresEmpresas } from './VendedoresEmpresas';
import { Vendedores } from './Vendedores';

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

    @Column({type: "varchar", length: 18})
    ie: string

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

    @Column({type: "varchar", length: 100, nullable: true})
    complemento: string

    @Column({type: "varchar", length: 2})
    uf: string

    @Column({type: "varchar", length: 14})
    telefone: string

    @Column({type: "varchar", length: 100, nullable: true})

    @OneToMany(type => Pedidos, pedidos => pedidos.empresa)
    pedidos: Pedidos[]

    @OneToMany(type => ProdutosEmpresas, produtosempresas => produtosempresas.empresa)
    produtosempresas: ProdutosEmpresas[]

    @OneToMany(type => Clientes, cliente => cliente.empresa)
    clientes: Clientes[]

    /*@OneToMany(type => VendedoresEmpresas, vendedoresEmpresas => vendedoresEmpresas.empresa,{eager: true})
    vendedores: VendedoresEmpresas[]*/
    @ManyToMany(type => Vendedores, vendedores => vendedores.empresas)
    vendedores: Vendedores[]
}