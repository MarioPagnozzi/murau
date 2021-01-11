import { HistoricoPedido } from './../entity/HistoricoPedido';
import { VendedoresEmpresas } from './../entity/VendedoresEmpresas';
import { ProdutosEmpresas } from './../entity/ProdutosEmpresas';
import { Configuracoes } from './../entity/Configuracoes';
import { Tabelas } from './../entity/Tabelas';
import { ImagensProduto } from './../entity/imagesProduto';
import { ItemPedido } from './../entity/ItemPedido';
import { Pedidos } from './../entity/Pedidos';
import { Produtos } from './../entity/Produtos';
import { Permissao } from './../entity/Permissao';
import { ContatosVendedores } from './../entity/ContatosVendedores';
import { ContatosClientes } from './../entity/ContatosClientes';
import { Empresas } from './../entity/Empresas';
import { Grupos } from './../entity/Grupos';
import { Vendedores } from './../entity/Vendedores';
import { Clientes } from './../entity/Clientes';
import { User } from './../entity/User';
import { createConnection } from 'typeorm';


const cfg = require("../../ormconfig.json");
export default {
    createConnection: async () => {
        await createConnection({
            type: cfg.type,
            host: cfg.host,
            port: cfg.port,
            username: cfg.username,
            password: cfg.password,
            database: cfg.database,
            synchronize: true,
            logging: false,
            cache: false,
            entities: [
                User,
                Clientes,
                Vendedores,
                Grupos,
                Empresas,
                ContatosClientes,
                ContatosVendedores,
                Permissao,
                Produtos,
                Pedidos,
                ItemPedido,
                ImagensProduto,
                Tabelas,
                Configuracoes,
                ProdutosEmpresas,
                HistoricoPedido
            ]
        });
        console.log("Database connected");
    }
}