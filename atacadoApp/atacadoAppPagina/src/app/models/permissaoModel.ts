import { BaseModel } from "./baseModel";
import { GrupoModel } from "./GrupoModel";

export class PermissaoModel extends BaseModel {
    tabela?: string
    visualizar?: boolean
    excluir?: boolean
    alterar?: boolean
    inserir?: boolean
    grupo?: GrupoModel
}