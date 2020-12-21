import { Request } from 'express';
import { getRepository, Repository } from 'typeorm';
import { Grupos } from './../entity/Grupos';
import { BaseController } from "./BaseController";

export class GrupoController extends BaseController<Grupos> {
    private _repGrupo: Repository<Grupos> = getRepository(Grupos);
    constructor () {
        super(Grupos);
    }
    async save(request: Request) {
        let grupo = <Grupos>request.body;

        super.isRequired(grupo.nome_grupo, "O 'Nome do Grupo' deve ser informado!");
        super.isRequired(grupo.permissoes, "A 'Permissão' do grupo deve ser configurada!");

        return super.save(grupo);
    }
}
