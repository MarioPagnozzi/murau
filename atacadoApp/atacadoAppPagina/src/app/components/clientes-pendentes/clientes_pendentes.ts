export interface Cidade {
  name?: string;
  code?: string;
}

export interface Vendedores {
  name?: string;
  image?: string;
}

export interface Clientes {
  id?: number;
  name?: string;
  country?: Cidade;
  company?: string;
  date?: string | Date ;
  status?: string;
  activity?: number;
  representative?: Vendedores;
  verified?: boolean;
  balance?: boolean;
}