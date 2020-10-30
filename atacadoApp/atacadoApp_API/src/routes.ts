import { ProdutosController } from './controller/ProdutosController';
import { HomeController } from './controller/HomeController';
import {UserController} from "./controller/UserController";

export const Routes = [

    {method: "get", route: "/users", controller: UserController, action: "all"}, 
    {method: "get", route: "/users/:id", controller: UserController, action: "one"}, 
    {method: "post", route: "/users", controller: UserController, action: "save"},
    {method: "post", route: "/users/create", controller: UserController, action: "createUser"}, 
    {method: "post", route: "/users/auth", controller: UserController, action: "auth"},
    {method: "delete",route: "/users/:id", controller: UserController, action: "remove"},

    //roteamento liberado home
    {method: "get", route: "/home", controller: HomeController, action: "all"}, 
    {method: "get", route: "/home/:prod", controller: HomeController, action: "one"},
    {method: "get", route: "/home/:prodEmpresa/all", controller: HomeController, action: "all"},

    //roteamentos restritos
    {method: "get", route: "/produtos", controller: ProdutosController, action: "all"}
];