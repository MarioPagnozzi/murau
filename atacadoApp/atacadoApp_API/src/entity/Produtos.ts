import { ProdutosEmpresas } from './ProdutosEmpresas';
import { ImagensProduto } from './imagesProduto';
import {  Index, OneToMany } from 'typeorm';

import { Column } from 'typeorm';
import { Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { ItemPedido } from './ItemPedido';
@Entity({name: "produtos"})
export class Produtos extends BaseEntity {

    @Index({fulltext: true})
    @Column({type: "varchar", length: 200})
    nome: string

    @Column({type: "text"})
    descricao: string
    
    @Column({type: "varchar", length: 100})
    referencia: string

    @Column({type: "varchar", length: 100})
    codigo: string    
    
    @Column({type: "varchar", length: 10})
    tamanho: string

    @Column({type: "varchar", length: 100})
    cor: string

    @Column({type: "double"})
    estoque: number

    @Column({type: "float"})
    preco: number

    @OneToMany(type => ProdutosEmpresas, produtosempresas => produtosempresas.produto, {eager: true})
    produtosEmpresas: ProdutosEmpresas[]

    @OneToMany (type => ImagensProduto, imagem => imagem.produto, {eager: true})
    imagens: ImagensProduto[]

    @OneToMany (type => ItemPedido,  itemPedido => itemPedido.produto)
    pedidos: ItemPedido[]

}