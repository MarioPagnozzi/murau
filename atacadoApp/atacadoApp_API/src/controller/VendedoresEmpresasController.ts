import { VendedoresEmpresas } from "../entity/VendedoresEmpresas";
import { BaseController } from "./BaseController";

export class VendedoresEmpresasController extends BaseController<VendedoresEmpresas> {
    constructor() {
    super(VendedoresEmpresas);
    }
} 