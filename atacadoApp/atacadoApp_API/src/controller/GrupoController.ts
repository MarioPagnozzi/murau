import { Request } from 'express';
import { Grupos } from './../entity/Grupos';
import { BaseController } from "./BaseController";

export class GrupoController extends BaseController<Grupos> {
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
