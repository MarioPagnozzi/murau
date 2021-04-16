import { BaseStatus } from "../enum/status";
import { ICliente } from "./IClientes";
import { IGrupos } from "./IGrupos";
import { IInterface } from "./IInterface";
import { IVendedores } from "./IVendedores";

export interface IUsuarios extends IInterface {

    nome?: string;
    email?: string;
    senha?: string;
    foto?: string;
    isRoot?: boolean;
    status_usuario?: BaseStatus
    grupos?: IGrupos[]
    vendedor?: IVendedores
    cliente?: ICliente
}