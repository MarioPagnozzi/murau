import { Request } from 'express';
import { getRepository, Repository } from 'typeorm';
import { Grupos } from '../entity/Grupos';
import { Permissao } from './../entity/Permissao';
import { BaseController } from './BaseController';
export class PermissaoController extends BaseController<Permissao> {    
    private _repPermissao: Repository<Permissao> = getRepository(Permissao);
    constructor() {
        super(Permissao);
    }
    async save(request: Request) {
        let permissao = <Permissao>request.body;

        super.isRequired(permissao.tabela, "'Tabela' deve ser informada");
        super.isRequired(permissao.grupo, "'Grupo' deve ser informado");

        let _permissaoExist = this._repPermissao.findOne({where: {tabela: permissao.tabela, grupo: permissao.grupo }});
        if (_permissaoExist) {
            return {status: 401, errors: "Permissão já existe para esta tabela e este grupo."}
        }
        
        super.save(permissao);
    }

}