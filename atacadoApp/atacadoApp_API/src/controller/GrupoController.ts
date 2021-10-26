import { Request } from 'express';
import { getManager, getRepository, Repository } from 'typeorm';
import { Permissao } from '../entity/Permissao';
import { Tabelas } from '../entity/Tabelas';
import { User } from '../entity/User';
import { Grupos } from './../entity/Grupos';
import { BaseController } from "./BaseController";

export class GrupoController extends BaseController<Grupos> {

    private _repGrupos: Repository<Grupos> = getRepository(Grupos);
    private _repUsuario: Repository<User> = getRepository(User);
    constructor () {
        super(Grupos);
    }
    async save(request: Request) {
        let {permissoes, nome_grupo, ativo, excluido, uid} = request.body;

         if (!this.func.Permissao(request, "Grupo", uid ? "A" : "I")) {
             return {status: 400, errors: ["Você não tem permissão para incluir ou alterar registros"]}
         }

        
        super.isRequired(nome_grupo, "O 'Nome do Grupo' deve ser informado!");
        if (uid && !permissoes) {
            let _repPermissao: Repository<Permissao> = getRepository(Permissao);
            let getPermissoes = await _repPermissao.find({where: [{grupo: {uid: uid}}]});
            permissoes = getPermissoes;
        } else if (!uid) {
            super.isRequired(permissoes, "É obrigatório atribuir as permissões do grupo");
        }
        let grupo: Grupos = new Grupos();

        grupo.uid = uid;
        grupo.ativo = ativo;
        grupo.excluido = excluido;
        grupo.nome_grupo = nome_grupo;

        return super.save(grupo).then(async (grp) => {

            if (grp.errors) return grp;

            permissoes.forEach(async (permissao) => {
                let perm: Permissao = new Permissao();
                let _repPermissao: Repository<Permissao> = getRepository(Permissao);

                perm.grupo = grp;
                perm.tabela = permissao.tabela;
                perm.visualizar = permissao.visualizar;
                perm.inserir = permissao.inserir;
                perm.alterar = permissao.alterar;
                perm.excluir = permissao.excluir;
                perm.ativo = grp.ativo;
                perm.uid = permissao.uid;
                _repPermissao.save(perm);
            })
            return grupo;
        });
    }
    async usuarios(request: Request) {
        const usuarioId = request.params.user;
        let usuario = await this._repUsuario.findOne({where: {uid: usuarioId}, relations: ['grupos']});
        return usuario.grupos;
    }
    async permissoes(request: Request) {
        const grupoUid = request.params.grupo;
        let grupo = await this._repGrupos.findOne({relations: ["permissoes"], where: {uid: grupoUid}});
        const perm = await grupo.permissoes;
        console.log(perm)
        return grupo.permissoes;
    }
    async one (request: Request, restrito = true) {
       
        if (restrito) {
            let tabela = this.func.Tabela(request);
            if (!this.func.Permissao(request, tabela, "V")) 
                return {status: 400, errors: [{message: "Você não tem permissão para acessar os registros"}]}
        }
        let sql_grupo = await this._repGrupos.findOne(request.params.id);
        console.log(sql_grupo)
        let grupo: any = {...sql_grupo};
        grupo.permissoes = await sql_grupo.permissoes as Permissao[];
        
        return grupo;
    }
}
