import "reflect-metadata";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from "express";
import {Routes} from "./routes";
import config from "./configuracao/config";
import auth from "./middleware/auth";
import conexao from "./configuracao/conexao";
import { Setup } from "./configuracao/inicializa";


// create express app
const app = express();
app.use(bodyParser.json());

app.use(auth);

// register express routes from defined application routes
Routes.forEach(route => {
    (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
        const result = (new (route.controller as any))[route.action](req, res, next);
        if (result instanceof Promise) {
            //result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);
            result.then(d => {
                if (d && d.status)
                    res.status(d.status).send(d.message || d.errors);
                else 
                    res.json(d);
            })

        } else if (result !== null && result !== undefined) {
            res.json(result);
        }
    });
});

app.listen(config.port,'0.0.0.0', async () => {

    try {
        await conexao.createConnection().then(async () => {
            try {
                let inicializa = new Setup();
                await inicializa.inicializar.call(this);
            }
            catch (error) {
                console.error("Empresa e Vendedores não registrados", error); 
            }
        }).then(async () => {
            try {
                let inicializa = new Setup(); 
                await  inicializa.cadastraProduto.call(this);
            }
            catch (error) {
                console.error("Produtos não registrados", error); 
            }
        }).then(async () => {
            try {
                let inicializa = new Setup();
                await inicializa.cadastroGrupoPermissao.call(this);
            }
            catch (error) {
                console.error("Grupo e Permissao não registrado", error);
            }
        }).then(async () => {
            try {
                let inicializa = new Setup();
                await inicializa.cadastroUsuario.call(this);
            }
            catch (error) {
                 console.error("Usuário não registrado", error);
            }
        });
        console.log("Data base conectado");
    }
    catch (error) {
        console.error("database not connected", error);
    }   
    console.log(`API atacado App Rodando inicializada na porta ${config.port}`);
});

