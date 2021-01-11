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
    rule.hour = 20;
    rule.minute = 30;
    rule.dayOfWeek = new cron.Range(1,5);

    var job_insere = await cron.scheduleJob(rule, async function () {
        let fun = new functions();
        let token = await fun.geraToken();
        let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
        let ultimoNumero = await _repParametros.findOne({where: {nome_parametro: "cod_prod_busca"}}); 
        if (ultimoNumero.valor == "0") {
            let maxCodigo = await _repProdutos.createQueryBuilder("produtos")
            .select("max(cast(prod.codigo as unsigned integer))","maxCodigo")
            .from(Produtos, "prod")
            .getRawOne();
            ultimoNumero.valor = (+maxCodigo["maxCodigo"] + 1).toString();
        }
       

        let _cdProd = +ultimoNumero.valor;
        console.log(_cdProd);
        let i = 0;
        let produtoExiste: boolean = true;
        

        while (produtoExiste && i <= 100) {
            _cdProd = +_cdProd + 1;
            produtoExiste = await fun.insereNovoProduto(_cdProd, token);
            i = i + 1;
        }

        ultimoNumero = await _repParametros.findOne({where: {nome_parametro: "cod_prod_busca"}});
      
        ultimoNumero.valor = _cdProd.toString();
        _repParametros.save(ultimoNumero).then(() => {
            console.log("Atualializado parametro 'cod_prod_busca");
        }).catch((error) => {
            console.error(error);
        });
    })

}