import { Pedidos } from './Pedidos';
import { Empresas } from './Empresas';
import { Vendedores } from './Vendedores';
import { ContatosClientes } from './ContatosClientes';
import { OneToMany, ManyToOne, Column, Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';
@Entity({name: "clientes"})
export class Clientes extends BaseEntity {

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

    @OneToMany(type => ContatosClientes, contatos => contatos.cliente, {eager: true})
    contatos: Clientes[]
    
    @ManyToOne(type => Vendedores, vendedor => vendedor.clientes, {eager: true})
    vendedor: Vendedores

    @ManyToOne(type => Empresas, empresa => empresa.clientes, {eager:true})
    empresa: Empresas

    @OneToMany(type => Pedidos, pedidos => pedidos.cliente, {eager: true})
    pedidos: Pedidos[]
}