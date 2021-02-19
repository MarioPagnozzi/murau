import { BaseModel } from "./baseModel"
import { PermissaoModel } from "./permissaoModel"
import { UsuarioModel } from "./usuarioModel"

export class GrupoModel extends BaseModel {
    nome_grupo?: string
    permissoes?: PermissaoModel[]
    usuarios?: UsuarioModel[]
}