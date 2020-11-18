import { Empresas } from './Empresas';
import { Vendedores } from './Vendedores';
import { ManyToOne, Entity } from 'typeorm';
import { BaseEntity } from "./BaseEntity";

@Entity({name: "vendedores_empresas"})
export class VendedoresEmpresas extends BaseEntity {
    
    @ManyToOne(type => Vendedores, vendedores => vendedores.vendedoresempresas, {eager: true})
    vendedor: Vendedores

    @ManyToOne(type => Empresas, empresas => empresas.vendedoresempresas, {eager: true})
    empresa: Empresas

}