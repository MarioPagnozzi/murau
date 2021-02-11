import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { PedidosService } from 'src/app/services/pedidos.service';
import { ProdutosService } from 'src/app/services/produtos.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-dashbord-principal',
  templateUrl: './dashbord-principal.component.html',
  styleUrls: ['./dashbord-principal.component.scss']
})
export class DashbordPrincipalComponent implements OnInit {

  totalClienteDia = 0;
  totalPedidoDia = 0;
  totalProdutosDia = 0;
  constructor(
    private clienteService: ClienteService,
    private produtosService: ProdutosService,
    private pedidosService: PedidosService) { }

  async ngOnInit() {
    this.totalClienteDia = await this.clienteService.TotalClienteDia();
    this.totalPedidoDia = await this.pedidosService.TotalPedidosDia();
    this.totalProdutosDia = await this.produtosService.TotalProdutosDia();
  }

}
