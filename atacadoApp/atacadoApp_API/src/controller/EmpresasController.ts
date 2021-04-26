import { Request } from 'express';
import { getRepository, Repository } from 'typeorm';
import { Empresas } from './../entity/Empresas';
import { BaseController } from './BaseController';
export class EmpresasController extends BaseController<Empresas> {
    private _repEmpresa: Repository<Empresas> = getRepository(Empresas);
    constructor () {
        super(Empresas);
    }
    async save(request: Request) {
        let _empresa = <Empresas>request.body;
        if (!this._func.Permissao(request, "Empresas", _empresa.uid ? "A" : "I")) {
            return {status: 400, errors: [{message:"Você não tem permissão para altarar ou inserir registros"}]}
        }
        const restaurando = await this._repEmpresa.findOne({where: {uid: _empresa.uid, excluido: true, ativo: false}});
        if (!restaurando) {
            super.isRequired(_empresa.razao_social, "Informe uma 'Razão Social' para esta empresa");
            super.isRequired(_empresa.nome_fantasia, "'Nome Fantasia' deve ser informado");
            super.isCPFCNPJ(_empresa.cnpj, "'CNPJ' da empresa é inválido");
            super.isRequired(_empresa.cep, "'CEP' deve ser informado");
            super.isRequired(_empresa.endereco, "'Endereço' deve ser informado");
            super.isRequired(_empresa.numero, "Informe o 'Número' do estabelecimento");
            super.isRequired(_empresa.bairro, "'Bairro' deve ser informado");
            super.isRequired(_empresa.cidade, "'Cidade' deve ser informada");
            super.isRequired(_empresa.uf, "'UF' deve ser informada");
        }
        let codigo = await this._repEmpresa.findOne({where: {codigo: _empresa.codigo}});

        if (codigo && !_empresa.uid) {
            let maxCodigo = await this._repEmpresa.createQueryBuilder("empresas")
                                                  .select("IFNULL(max(cast(emp.codigo as unsigned INTEGER)),0)","maxCodigo")
                                                  .from(Empresas, "emp")
                                                  .getRawOne();
            let sugestao = +maxCodigo["maxCodigo"] + 1;
            return {status:400, errors: [{message:"Já existe uma empresa com o código informado. Sugestão: " + sugestao}]};
        }

        return super.save(_empresa);
    }
    async oneCodigo(request: Request,) {
        if (!this._func.Permissao(request, "Empresas", "V")) {
            return {status: 400, errors: [{message:"Você não tem permissão para acessar os resgistros"}]}
        }
        return this._repEmpresa.findOne({where: {codigo: request.params.codigo}});
    }
    async oneClientes(request: Request) {
        if (!this._func.Permissao(request, "Empresas", "V")) {
            return {status: 400, errors: [{message: "Você não tem permissão para acessar os registros"}]}
        }
        return this._repEmpresa.createQueryBuilder("empresas")
                               .leftJoinAndSelect("empresas.clientes", "clientes")
                               .where("empresas.codigo = :codigo", {codigo: request.params.codigo})
                               .getOne();
    }
    async oneVendedores(request: Request) {
        if (!this._func.Permissao(request, "Empresas", "V")) {
            return {status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }
        return this._repEmpresa.createQueryBuilder("empresas")
                               .leftJoinAndSelect("empresas.vendedores", "vendedores")
                               .where("empresas.codigo = :codigo", {codigo: request.params.codigo})
                               .getOne();
    }
    async oneProdutos(request: Request) {
        if (!this._func.Permissao(request, "Empresas", "V")) {
            return {status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }
        return this._repEmpresa.createQueryBuilder("empresas").addSelect("empresas.*")
                               .innerJoin("empresas.produtosempresas","prodemp").addSelect(["prodemp.valor","prodemp.estoque"])
                               .innerJoin("prodemp.produto","prod").addSelect([
                                   "prod.codigo",
                                   "prod.referencia",
                                   "prod.nome",
                                   "prod.descricao",
                                   "prod.tamanho",
                                   "prod.cor"
                               ])
                               .where("empresas.codigo = :codigo", {codigo: request.params.codigo})
                               .getOne();
    }
}