import "reflect-metadata";
import * as express from "express";
import * as bodyParser from "body-parser";
//import * as cors from "cors";
import {Request, Response} from "express";
import {Routes} from "./routes";
import config from "./configuracao/config";
import auth from "./middleware/auth"
import conexao from "./configuracao/conexao";
import { Setup } from "./configuracao/inicializa";
import cron_job from "./middleware/cron_job";



var multer = require("multer");
//var upload = multer();S

// create express app
const app = express();
app.use(require('cors')());
app.use(bodyParser.json({limit: "100mb"}));
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(upload.array());

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
                else if (d && d.file)
                    res.sendFile(d.file);
                else 
                    res.json(d);
            })

        } else if (result !== null && result !== undefined) {
            res.json(result);
        }
    });
});
var path = require('path');
app.use(path.join("/","uploads"), express.static("public"));
var fs = require("fs");
var constants = require("constants");
let https = require("https");
https.createServer({
    target: "https://apimurau.mapxsolucoes.com.br:9443",
    secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2,
    key: fs.readFileSync("C:/Program Files/OpenSSL-Win64/bin/certificate.key"),
    cert: fs.readFileSync("C:/Program Files/OpenSSL-Win64/bin/certificate.crt")
   /* key: fs.readFileSync("/etc/letsencrypt/live/apimurau.mapxsolucoes.com.br/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/apimurau.mapxsolucoes.com.br/cert.pem"),
    ca: fs.readFileSync("/etc/letsencrypt/live/apimurau.mapxsolucoes.com.br/chain.pem"),
    dhparam: fs.readFileSync("/etc/letsencrypt/archive/apimurau.mapxsolucoes.com.br/dh1.pem")*/
},app).listen(config.port,'0.0.0.0', async () => {

    
    try {
        await conexao.createConnection().then(async () => {
            try {
                let inicializa = new Setup();
                await inicializa.inicializar.call(this);
            }
            catch (error) {
                console.error("Empresa não registrada", error); 
            }
        }).then(async () => {
            try {
                let inicializa = new Setup();
                 await inicializa.cadastraVendedores.call(this);
            }
            catch (error) {
                console.error("Vendedores não foram cadastrados ", error)
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
        }).catch((err) => {
            console.error("API não iniciada corretamente: " + err);
        });
        console.log("Data base conectado");
    }
    catch (error) {
        console.error("database not connected", error);
    }   
    console.log(`API atacado App Rodando inicializada na porta ${config.port}`);
   // cron_job.call(this);
});

