import { Request } from 'express';
import { getRepository, Like, Repository } from 'typeorm';
import { Vendedores } from './../entity/Vendedores';
import { BaseController } from "./BaseController";

export class VendedoresController extends BaseController<Vendedores> {
    private _repVendedor: Repository<Vendedores> = getRepository(Vendedores);
    constructor(){
        super(Vendedores);
    }

    async save(request: Request) {
        let vend = <Vendedores>request.body;
        if (!this._func.Permissao(request, "Vendedores", vend.uid ? "A" : "I")) {
            return {status: 400, errors: ["Vocês não tem permissão para alterar ou inserir registros"]}
        }
        super.isRequired(vend.nome, "O 'Nome' do vendedor deve ser informado");
        super.isRequired(vend.bairro, "O 'Bairro' deve ser informado");
        super.isRequired(vend.cidade,"A 'Cidade' deve ser informada.");
        super.isRequired(vend.codigo, "O 'Código' deve ser informado");
        super.isRequired(vend.contatos,"O Vendeder deve possuir um ou mais 'Contatos'");
        super.isRequired(vend.empresas,"O vendedor tem que estar vinculado a uma ou mais 'Empresas'");
        super.isRequired(vend.endereco, "O 'Endereço' deve ser informado");
        super.isRequired(vend.cidade, "A 'Cidade' deve ser informada");
        super.isRequired(vend.uf, "A 'UF' deve ser informada");

        return super.save(vend);

    }
    async nome_like(request: Request) {
        if (!this._func.Permissao(request, "Vendedores", "V")) {
            return {status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }
        return this._repVendedor.find({where: {nome: Like("%" + request.params.nome + "%")}});
    }
    async codigo(request: Request) {
        if (!this._func.Permissao(request, "Vendedores", "V")) {
            return {status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }
        return this._repVendedor.findOne({where: {codigo: request.params.codigo}});
    }
    async porEmpresa(request: Request) {
        if (!this._func.Permissao(request, "Vendedores", "V")) {
            return {status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }
        return this._repVendedor.createQueryBuilder("vendedores")
                                .innerJoinAndSelect("vendedores.empresas","empresas")
                                .where("empresas.codigo = :codigo", {codigo: request.params.codigo})
                                .getMany();
    }
}
