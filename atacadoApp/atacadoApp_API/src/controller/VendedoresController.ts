import { Request } from 'express';
import { getRepository, Like, Repository } from 'typeorm';
import { ContatosVendedores } from '../entity/ContatosVendedores';
import { Empresas } from '../entity/Empresas';
import { VendedoresEmpresas } from '../entity/VendedoresEmpresas';
import { Vendedores } from './../entity/Vendedores';
import { BaseController } from "./BaseController";

export class VendedoresController extends BaseController<Vendedores> {
    private _repVendedor: Repository<Vendedores> = getRepository(Vendedores);
    constructor(){
        super(Vendedores);
    }

    async save(request: Request) {
        let vend = <Vendedores>request.body;
        if (!this.func.Permissao(request, "Vendedores", vend.uid ? "A" : "I")) {
            return {status: 400, errors: ["Vocês não tem permissão para alterar ou inserir registros"]}
        }
        super.isRequired(vend.nome, "O 'Nome' do vendedor deve ser informado");
        super.isRequired(vend.bairro, "O 'Bairro' deve ser informado");
        super.isRequired(vend.cidade,"A 'Cidade' deve ser informada.");
        super.isRequired(vend.codigo, "O 'Código' deve ser informado");
        if (!vend.uid)
            super.isRequired(vend.contatos,"O Vendeder deve possuir um ou mais 'Contatos'");
        super.isRequired(vend.empresas,"O vendedor tem que estar vinculado a uma ou mais 'Empresas'");
        super.isRequired(vend.endereco, "O 'Endereço' deve ser informado");
        super.isRequired(vend.cidade, "A 'Cidade' deve ser informada");
        super.isRequired(vend.uf, "A 'UF' deve ser informada");

        let codigo = await this._repVendedor.findOne({where:{codigo: vend.codigo}});
        if (codigo && !vend.uid) {
            let maxCodigo = await this._repVendedor.createQueryBuilder("vendedores")
                         .select("IFNULL(max(cast(vend.codigo as unsigned INTEGER)),0)","maxCodigo")
                         .from(Vendedores, "vend")
                         .getRawOne();
            let sugestao = +maxCodigo["maxCodigo"] + 1;
            return {status: 400, errors: [{message: "Este código já está sendo usado por outro vendedor. Sugestão: " + sugestao}]};
        }

        if (!vend.codigo) {
            let maxCodigo = await this._repVendedor.createQueryBuilder("vendedores")
            .select("IFNULL(max(cast(vend.codigo as unsigned INTEGER)),0)","maxCodigo")
            .from(Vendedores, "vend")
            .getRawOne();
            vend.codigo = +maxCodigo["maxCodigo"] + 1;
        }
            return super.save(vend);

    }
    async filtro(request: Request) {
        let valor = request.params.valor;
        let filtro = request.params.filtro;

        if (filtro === "empresas") {
            let empVend = await this._repVendedor.findOne({where: {uid: valor}});
            let vend: any = {...empVend};
            vend.empresas = await empVend.empresas;
            console.log(vend)
            return vend;
        }
    }
    async nome_like(request: Request) {
        if (!this.func.Permissao(request, "Vendedores", "V")) {
            return {status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }
        return this._repVendedor.find({where: {nome: Like("%" + request.params.nome + "%")}});
    }
    async codigo(request: Request) {
        if (!this.func.Permissao(request, "Vendedores", "V")) {
            return {status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }
        return this._repVendedor.findOne({where: {codigo: request.params.codigo}});
    }
    async porEmpresa(request: Request) {
        if (!this.func.Permissao(request, "Vendedores", "V")) {
            return {status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }
        return this._repVendedor.createQueryBuilder("vendedores")
                                .innerJoinAndSelect("vendedores.empresas","empresas")
                                .where("empresas.codigo = :codigo", {codigo: request.params.codigo})
                                .getMany();
    }
}
