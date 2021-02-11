import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { UsuariosService } from "../services/usuarios.service";
import { Permissao } from "./funcoesGlobal";

@Injectable({
    providedIn: 'root'
  })
export class AdminGuard implements CanActivate {
    tabela: string | undefined;
    constructor(
        private userService: UsuariosService,
        private router: Router
    ){
        this.tabela = (this.router.getCurrentNavigation()?.extractedUrl.toString());
        console.log(this.tabela?.toString().substring(1, this.tabela?.toString().length));
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
            if (this.userService.isStaticLogged) {               
                const tbl: string | undefined = (this.tabela?.toString().substring(1, this.tabela?.toString().length).toString());
                return String(tbl) !== "panel" ? Permissao(String(tbl), "V") : true;
            } else {
                return this.router.parseUrl('/home');
            }
        }
}