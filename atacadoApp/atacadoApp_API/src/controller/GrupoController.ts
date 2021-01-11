import { Request } from 'express';
import { getRepository, Repository } from 'typeorm';
import { Permissao } from '../entity/Permissao';
import { Grupos } from './../entity/Grupos';
import { BaseController } from "./BaseController";

export class GrupoController extends BaseController<Grupos> {

    constructor () {
        super(Grupos);
    }
    async save(request: Request) {
        let grupo = <Grupos>request.body;

         if (!this._func.Permissao(request, "Grupo", grupo.uid ? "A" : "I")) {
             return {status: 400, errors: ["Você não tem permissão para incluir ou alterar registros"]}
         }

        super.isRequired(grupo.permissoes, "É obrigatório atribuir as permissões do grupo");
        super.isRequired(grupo.nome_grupo, "O 'Nome do Grupo' deve ser informado!");

        let permissoes = grupo.permissoes;
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
}
