import { Empresas } from './Empresas';
import { Produtos } from './Produtos';
import { Entity, Column, PrimaryColumn, ManyToOne} from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity({name: "estoque_preco_prodemp"})
export class ProdutosEmpresas extends BaseEntity {

    @ManyToOne(type => Produtos, produtos => produtos.produtosEmpresas)
    produto: Promise<Produtos>

    @ManyToOne(type => Empresas, empresa => empresa.produtosempresas)
    empresa: Promise<Empresas>

    @Column({type: "float",default: 0})
    valor: number

    @Column({type: "float", default: 0})
    estoque: number

    @Column({type: "float", default: 0})
    estoque05: number

    @Column({type: "float", default: 0})
    estoque08: number

    @Column({type: "float", default: 0})
    estoque14: number

    @Column({type: "float", default: 0})
    estoque23: number
    
}