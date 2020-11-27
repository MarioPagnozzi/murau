import { EmpresasController } from './controller/EmpresasController';
import { VendedoresController } from './controller/VendedoresController';
import { ProdutosController } from './controller/ProdutosController';
import { HomeController } from './controller/HomeController';
import {UserController} from "./controller/UserController";

export const Routes = [

    //roteamento liberado home
    {method: "get", route: "/home", controller: HomeController, action: "all"}, 
    {method: "get", route: "/home/:prod", controller: HomeController, action: "one"},
    {method: "get", route: "/home/:prodEmpresa/all", controller: HomeController, action: "all"},

    //roteamento liberado usuário
    {method: "post", route: "/users/create", controller: UserController, action: "createUser"}, 

    //roteamentos restritos usuários
    {method: "get", route: "/users", controller: UserController, action: "all"}, 
    {method: "get", route: "/users/:id", controller: UserController, action: "one"}, 
    {method: "post", route: "/users", controller: UserController, action: "save"},
    {method: "post", route: "/users/auth", controller: UserController, action: "auth"},
    {method: "delete",route: "/users/:id", controller: UserController, action: "remove"},
    {method: "post", route: "/users/:nome", controller: UserController, action: "nome_like"},

    //roteamentos restritos: Produtos
    {method: "get", route: "/produtos", controller: ProdutosController, action: "all"},
    {method: "get", route: "/produtos/:prod", controller: ProdutosController, action: "one"}, 
    {method: "post", route: "/produtos", controller: ProdutosController, action: "save"},
    {method: "delete",route: "/produtos/:id", controller: ProdutosController, action: "remove"},

    //roteamentos restritos: Vendedores
    {method: "get", route: "/vendedores", controller: VendedoresController, action: "all"}, 
    {method: "get", route: "/vendedores/:vend", controller: VendedoresController, action: "one"}, 
    {method: "post", route: "/vendedores", controller: VendedoresController, action: "save"},
    {method: "delete",route: "/vendedores/:id", controller: VendedoresController, action: "remove"},

    //retoeamento restritos: Empresas
    {method: "get", route: "/empresas", controller: EmpresasController, action: "all"}, 
    {method: "get", route: "/empresas/:emp", controller: EmpresasController, action: "one"}, 
    {method: "post", route: "/empresas", controller: EmpresasController, action: "save"},
    {method: "delete",route: "/empresas/:id", controller: EmpresasController, action: "remove"},
];