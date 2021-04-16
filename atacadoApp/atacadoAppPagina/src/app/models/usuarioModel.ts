import { BaseStatus } from "../enum/status";
import { BaseModel } from "./baseModel";
import { ClienteModel } from "./clienteModel";
import { GrupoModel } from "./grupoModel";
import { VendedoresModel } from "./vendedoresModel";


export class UsuarioModel extends BaseModel {
    nome: string = ""
    email: string = ""
    senha: string = ""
    foto: string = ""
    isRoot: boolean = false
    status_usuario: BaseStatus = BaseStatus.Pendente
    grupos: GrupoModel[] = []
    vendedor?: VendedoresModel = new VendedoresModel()
    cliente?: ClienteModel = new ClienteModel()
    confirmaSenha: string = ""
}