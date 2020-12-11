import { Repository, getRepository, Not, OneToMany, In } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import { Configuracoes } from '../entity/Configuracoes';
import { Produtos } from '../entity/Produtos';
import { functions } from '../configuracao/functions/globalFunctions';


require('events').EventEmitter.defaultMaxListeners = Infinity;
var cron = require("node-schedule");


export default async (req: Request, res: Response, next: NextFunction) => {
   let startTime = new Date().setUTCHours(8,0,0);
   let endTime = new Date().setUTCHours(20,0,0);
   let _repProdutos: Repository<Produtos> = getRepository(Produtos);

   var job_atualiza = await cron.scheduleJob({start: startTime, end: endTime, rule: '*/60 * * * *'},async function() {
        let fun = new functions();
        let token = await fun.geraToken();
        fun.atualizaProduto(token);
    });
    var rule = new cron.RecurrenceRule();
    rule.hour = 23;
    rule.minute = 59;
    rule.dayOfWeek = new cron.Range(1,5);

    var job_insere = await cron.scheduleJob(rule, async function () {
        let fun = new functions();
        let token = await fun.geraToken();
        let maxCodigo = await _repProdutos.createQueryBuilder("produtos")
                                        .select("max(cast(prod.codigo as unsigned integer))","maxCodigo")
                                        .from(Produtos, "prod")
                                        .getRawOne();

        let _cdProd = +maxCodigo["maxCodigo"] + 1;    
        let i = 0;
        let produtoExiste: boolean = true;
        let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);

        while (produtoExiste && _cdProd <= 1000) {

            produtoExiste = await fun.insereNovoProduto(_cdProd, token);
            if (!produtoExiste) {                
                let ultimoNumero = await _repParametros.findOne({where: {nome_parametro: "cod_prod_busca"}});
                if (ultimoNumero.valor !== "0") {
                    _cdProd = +ultimoNumero.valor;
                    produtoExiste = await fun.insereNovoProduto(_cdProd, token);
                }
            }
            _cdProd = +_cdProd + 1;
        }
        let ultimoNumero = await _repParametros.findOne({where: {nome_parametro: "cod_prod_busca"}});
        console.log("Erro aqui: " + _cdProd.toString());
        ultimoNumero.valor = _cdProd.toString();
        _repParametros.save(ultimoNumero).then(() => {
            console.log("Atualializado parametro 'cod_prod_busca");
        }).catch((error) => {
            console.error(error);
        });
    })

}