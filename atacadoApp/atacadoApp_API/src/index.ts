import "reflect-metadata";
import * as express from "express";
import * as bodyParser from "body-parser";
//import * as cors from "cors";
import {Request, Response} from "express";
import {Routes} from "./routes";
import config from "./configuracao/config";
import auth from "./middleware/auth"
import conexao from "./configuracao/conexao";
import {start, cadastraTabelas, cadastraConfig, cadastroGrupo, cadastroFilhas}  from "./configuracao/inicializa";
import {job} from './middleware/cron_job';



var querystring = require("querystring");
var multer = require("multer");

if (config.production) {
    process.env.target = "https://api.murau.com.br:9443";
    process.env.key = "/usr/local/directadmin/data/users/murau/domains/api.murau.com.br.key";
    process.env.cert = "/usr/local/directadmin/data/users/murau/domains/api.murau.com.br.cert";
    process.env.ca = "/usr/local/directadmin/data/users/murau/domains/api.murau.com.br.cacert";
    process.env.dhparam = "/usr/local/directadmin/data/users/murau/domains/api.murau.com.br.cert.combined";
} else {
    process.env.target = "https://apimurau.mapxsolucoes.com.br:9443";
    process.env.key = "C:/Program Files/OpenSSL-Win64/bin/certificate.key";
    process.env.cert = "C:/Program Files/OpenSSL-Win64/bin/certificate.crt";
    process.env.ca = "undefined";
    process.env.dhparam = "undefined";
}

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

let obj_param = {};
if (config.production) {
    obj_param = {
        target: process.env.target,
        secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2,
        key: fs.readFileSync(process.env.key),
        cert: fs.readFileSync(process.env.cert),
        ca: fs.readFileSync(process.env.ca),
        dhparam: fs.readFileSync(process.env.dhparam)
    };
} else {
    obj_param = {
        target: process.env.target,
        secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2,
        key: fs.readFileSync(process.env.key),
        cert: fs.readFileSync(process.env.cert)
    }
}
https.createServer(obj_param,app).listen(config.port,'0.0.0.0', async () => {

    try {
        await conexao.createConnection()
                    .then(async () => {
                        start();
                    })
                    .then(async () =>{
                       cadastraTabelas();
                    })
                    .then(async () => {
                        cadastraConfig();
                    })
                    .then(async () => {
                        cadastroGrupo(["Super Usuário", "Vendedores", "Clientes"]).then(() => {
                            console.log("Grupos ['Super Usuário', 'Vendedores', 'Clientes'] cadastrado")
                        });
                    })
                    .then(async () => {
                        await cadastroFilhas();
                    })
                    .then(async () => {
                        console.log("Data base conectado");
                    })
                    .catch((err) => {
                        console.error("API não iniciada corretamente: " + err);
                    });
    }
    catch (error) {
        console.error("database not connected", error);
    }
    console.log(`API atacado App Rodando inicializada na porta ${config.port}`);
    if (config.production) {
        job();
    }
})

