import { Request } from 'express';
import { getManager, getRepository, Repository } from 'typeorm';
import { Permissao } from '../entity/Permissao';
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
        let grupo = <Grupos>request.body;

         if (!this.func.Permissao(request, "Grupo", grupo.uid ? "A" : "I")) {
             return {status: 400, errors: ["Você não tem permissão para incluir ou alterar registros"]}
         }

        super.isRequired(grupo.permissoes, "É obrigatório atribuir as permissões do grupo");
        super.isRequired(grupo.nome_grupo, "O 'Nome do Grupo' deve ser informado!");

        let permissoes = await grupo.permissoes;
        return super.save(grupo).then(async (grupo) => {
            permissoes.forEach(async (permissao) => {
                let perm: Permissao = new Permissao();
                let _repPermissao: Repository<Permissao> = getRepository(Permissao);

                perm.grupo = grupo;
                perm.tabela = permissao.tabela;
                perm.visualizar = permissao.visualizar;
                perm.inserir = permissao.inserir;
                perm.alterar = permissao.alterar;
                perm.excluir = permissao.excluir;
                perm.ativo = true;
                _repPermissao.save(perm);
            })
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
        let grupo: any = {...sql_grupo};
        grupo.permissoes = await sql_grupo.permissoes;
        return grupo;
    }
}
