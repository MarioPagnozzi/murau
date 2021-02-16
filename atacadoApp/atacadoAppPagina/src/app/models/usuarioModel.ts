import { BaseStatus } from "../enum/status";
import { BaseModel } from "./baseModel";
import { GrupoModel } from "./grupoModel";


export class UsuarioModel extends BaseModel {
    nome?: string;
    email?: string;
    senha?: string;
    foto?: string;
    isRoot?: boolean;
    status_usuario?: BaseStatus
    grupos?: GrupoModel[]
}