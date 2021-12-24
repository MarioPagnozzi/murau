import { IInterface } from "./IInterface"

export interface IPromocoes extends IInterface {
   
    codigo_promocao?: string
    desc_promocao?: string
    desc_referencia?: string
    cod_produto?: string
    data_inicio?: Date
    data_final?: Date
    vlr_anterior?: number
    vlr_promocao?: number
}
