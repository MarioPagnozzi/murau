import { Request, Response, NextFunction } from 'express';
import { getRepository, Repository, Timestamp } from "typeorm";
import { Promocao } from "../entity/Promocao";
import { BaseController } from "./BaseController";

export class PromocaoController extends BaseController<Promocao> {
    private _repPromocao: Repository<Promocao> = getRepository(Promocao);

    constructor() {
        super(Promocao);
    }
    async save(request: Request) {
        let promocoes = request.body

        return this._repPromocao.save(promocoes);
    }
    async uploadFiles(request: Request, response: Response, next: NextFunction) {
        
        if (!this.func.Permissao(request, "Promocao", "A") || !this.func.Permissao(request, "Promocao", "I")) {
            return {status: 400, errors: ["Você não tem permissão para carregar arquivos"]}
        }
        const fs = require('fs');
        const multer = require('multer');
        var sharp = require('sharp');
        
        let dir = "public/uploads";

        let _dir = dir.split("/");
        let ndir = "./";

        for (let el in _dir) {
            ndir = ndir + _dir[el] + "/";
            if (!fs.existsSync(ndir)) {
                fs.mkdirSync(ndir, {recursive: true});
            }
        }

       let dirname = ndir;
       request.body.dirname = dirname;
  
       let upload = require("./../middleware/upload");
        console.log(request.body)
       await upload(request, response, function (err) {
       
            if (request.fileValidationError) {
                response.status(401).send({message: "Erro na validação do Arquivo"});
                return;
            }
            else if (err instanceof multer.MulterError) {
                response.status(401).send({message: "Erro na instancia do aquivo ou aplicativo"});
                return;
                
            }
            else if (!request.files) {
                response.status(404).send({message: "Arquivos não encontrados"});
                return;
            }
            else if (err) {
                response.status(500).send({message: "Erro geral do servidor"});
                return;
                
            }
            else {
                response.status(200).send({message: "Arquivos carregados com sucesso"});
                return;
               /* try {
                    let directory = dirname;
                 
                    if(!fs.existsSync(directory)) {
                        fs.mkdirSync(directory);
                    }
                    let files = JSON.parse(JSON.stringify(request.files));
                    console.log(JSON.parse(JSON.stringify(request.files)));
                    
                    
                    for (let el in files) {
                        console.log(files[el].type);
                        let caminho = directory + "/" + Date.now().toString() + '.csv';
                        sharp(files[el].path).toFile(caminho)
                        .then(async () => {
                            fs.unlinkSync(files[el].path);
                        });
                    }
                    response.status(200).send({message: "Arquivos carregados com sucesso"});
                    return;
                }
                catch (err) {
                    response.status(401).send({message: "Erro ao carregar os arquivos"});
                    return;
                }*/
            }
        })
    }
    files = (req, res) => {
        const directoryPath = "public/uploads/";
        const fs = require('fs');
        fs.readdir(directoryPath, function (err, files) {
          if (err) {
            res.status(500).send({
              message: "Unable to scan files!",
            });
          }
      
          let fileInfos = [];
      
          files.forEach((file) => {
            fileInfos.push({
              name: file,
              url: directoryPath + file,
            });
          });
      
          res.status(200).send(fileInfos);
        });
      };
      
      download = (req, res) => {
        const fileName = req.params.name;
        const directoryPath = "public/uploads";
      
        res.download(directoryPath + fileName, fileName, (err) => {
          if (err) {
            res.status(500).send({
              message: "Could not download the file. " + err,
            });
          }
        });
      };
}