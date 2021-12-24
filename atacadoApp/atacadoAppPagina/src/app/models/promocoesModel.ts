import { BaseModel } from "./baseModel"

export class PromocoesModel extends BaseModel {
    codigo_promocao: string = ""
    desc_promocao: string = ""
    desc_referencia: string = ""
    cod_produto: string = ""
    data_inicio: Date = new Date()
    data_final: Date = new Date()
    vlr_anterior: number = 0
    vlr_promocao: number = 0
}