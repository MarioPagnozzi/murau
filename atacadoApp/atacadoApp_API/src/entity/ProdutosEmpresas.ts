import { Empresas } from './Empresas';
import { Produtos } from './Produtos';
import { Entity, Column, PrimaryColumn, ManyToOne} from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity({name: "produtos_empresas"})
export class ProdutosEmpresas extends BaseEntity {

    @ManyToOne(type => Produtos, produtos => produtos.produtosEmpresas)   
    produto: Produtos

    @ManyToOne(type => Empresas, empresa => empresa.produtosempresas, {eager: true})   
    empresa: Empresas

    @Column({type: "float",default: 0})
    valor: number

    @Column({type: "float", default: 0})
    estoque: number
    
}