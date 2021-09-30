import { Request } from 'express';
import { getRepository, Like, Repository } from 'typeorm';
import { Clientes } from '../entity/Clientes';
import { ContatosVendedores } from '../entity/ContatosVendedores';
import { Empresas } from '../entity/Empresas';
import { Grupos } from '../entity/Grupos';
import { Pedidos } from '../entity/Pedidos';
import { User } from '../entity/User';
import { VendedoresEmpresas } from '../entity/VendedoresEmpresas';
import { FileHelper } from '../helpers/FileHelpers';
import { Vendedores } from './../entity/Vendedores';
import { BaseController } from "./BaseController";

var md5 = require("md5");
export class VendedoresController extends BaseController<Vendedores> {
    private _repVendedor: Repository<Vendedores> = getRepository(Vendedores);
    constructor(){
        super(Vendedores);
    }

    async save(request: Request) {
        let {uid, codigo, nome, endereco, numero, bairro, email,
                cidade, complemento, uf, cep, contatos, clientes,
                empresas, usuario, ativo, excluido} = request.body;
        if (!this.func.Permissao(request, "Vendedores", uid ? "A" : "I")) {
            return {status: 400, errors: ["Vocês não tem permissão para alterar ou inserir registros"]}
        }
        super.isRequired(nome, "O 'Nome' do vendedor deve ser informado");
        super.isRequired(bairro, "O 'Bairro' deve ser informado");
        super.isRequired(cidade,"A 'Cidade' deve ser informada.");
        super.isRequired(codigo, "O 'Código' deve ser informado");
        if (!uid)
            super.isRequired(contatos,"O Vendeder deve possuir um ou mais 'Contatos'");
        super.isRequired(empresas,"O vendedor tem que estar vinculado a uma ou mais 'Empresas'");
        super.isRequired(endereco, "O 'Endereço' deve ser informado");
        super.isRequired(cidade, "A 'Cidade' deve ser informada");
        super.isRequired(uf, "A 'UF' deve ser informada");

        let cod = await this._repVendedor.findOne({where:{codigo: codigo}});
        if (cod && !uid) {
            let maxCodigo = await this._repVendedor.createQueryBuilder("vendedores")
                         .select("IFNULL(max(cast(vend.codigo as unsigned INTEGER)),0)","maxCodigo")
                         .from(Vendedores, "vend")
                         .getRawOne();
            codigo = +maxCodigo["maxCodigo"] + 1;
        }

        if (!codigo) {
            let maxCodigo = await this._repVendedor.createQueryBuilder("vendedores")
            .select("IFNULL(max(cast(vend.codigo as unsigned INTEGER)),0)","maxCodigo")
            .from(Vendedores, "vend")
            .getRawOne();
            codigo = +maxCodigo["maxCodigo"] + 1;
        }

        let vend = new Vendedores();
        vend.uid = uid;
        vend.ativo = ativo;
        vend.bairro = bairro;
        vend.cep = cep;
        vend.cidade = cidade;
        vend.clientes = Promise.resolve(clientes);
        vend.codigo = codigo;
        vend.complemento = complemento;
        vend.email = email;
        vend.empresas = Promise.resolve(empresas);
        vend.endereco = endereco;
        vend.excluido = excluido;
        vend.numero = nome;
        vend.numero = numero;
        vend.uf = uf;

        return super.save(vend).then(async (vendedor) => {
            if (vendedor.errors) return vendedor;
            
            let _repGrupos: Repository<Grupos> = getRepository(Grupos);
            let grupos: Grupos[] = [];
            let _repUsuario: Repository<User> = getRepository(User);
            if (usuario) {

                if (usuario.uid) {
                    let user = await _repUsuario.findOne(usuario.uid);
                    let grupos_usuario = await user.grupos;

                    if (grupos_usuario.length > 0) {
                        grupos = grupos_usuario;
                    } else {
                        let grupo = await _repGrupos.findOne({where: {nome_grupo: "Vendedores"}});
                        grupos.push(grupo);
                    }
                } else {
                    let grupo = await _repGrupos.findOne({where: {nome_grupo: "Vendedores"}});
                    grupos.push(grupo)
                }
                let user = new User();
                user.foto = usuario.foto;
                if (user.foto) {
                    let criarFotoResult = await FileHelper.writePicture(user.foto);
                    if (criarFotoResult) {
                        user.foto = criarFotoResult;
                    }
                }
                user.nome = usuario.nome;
                user.uid = usuario.uid;
                user.email = usuario.email;
                user.isRoot = usuario.isRoot;
                user.vendedor = vendedor;
                user.grupos = Promise.resolve(grupos);
                user.ativo = vendedor.ativo;
                user.excluido = vendedor.excluido;
                if (md5(usuario.senha) != usuario.senha) user.senha = md5(usuario.senha);
                user.status_usuario = usuario.status_usuario;
                _repUsuario.save(user);
            } else {
                usuario = await _repUsuario.findOne({where: [{vendedor: {uid: vendedor.uid}}]});

                if (usuario) {
                    grupos = await usuario.grupos;
                    if (grupos.length <= 0) {
                        let grupo = await _repGrupos.findOne({where: {nome_grupo: 'Vendedores'}});
                        grupos.push(grupo);
                    }
                    let user = new User();
                    user = {...usuario};
                    user.cliente = vendedor;
                    user.grupos = Promise.resolve(grupos);
                    user.ativo = vendedor.ativo;
                    user.excluido = vendedor.excluido;
                    user.status_usuario = !vendedor.excluido || !vendedor.ativo ? 1 : usuario.status_usuario;
                    if (user.foto) {
                        let criarFotoResult = await FileHelper.writePicture(user.foto);
                        if (criarFotoResult) {
                            user.foto = criarFotoResult;
                        }
                    }
                    _repUsuario.save(user);
                }
            }
            for (let i = 0; i < contatos.length; i++) {
                let _repContatoVendedor: Repository<ContatosVendedores> = getRepository(ContatosVendedores);
                
                let cont = new ContatosVendedores();
                cont = {...contatos[i]};
                cont.vendedor = vendedor;
    
                _repContatoVendedor.save(cont);
            }
            return vendedor;
        });

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
    async one(request: Request, restrito = true) {
        if (restrito) {
            let tabela = this.func.Tabela(request);
            if (!this.func.Permissao(request, tabela, "V")) 
                return {status: 400, errors: [{message: "Você não tem permissão para acessar os registros"}]}
        }
        let vendedores = await this._repVendedor.findOne(request.params.id);
        let vendedor: any = {...vendedores};
        if (vendedores) {
            vendedor.pedidos = await vendedores.pedidos as Pedidos[];
            vendedor.empresas = await vendedores.empresas as Empresas[];
            vendedor.clientes = await vendedores.clientes as Clientes[];
        }
        return vendedor;
    }
}
