export default {
    port: process.env.PORT || 9443,
    secretkey: process.env.SECRETYKEY || '8e9dbaf1-2667-46ef-ae0c-779a8108e9a4',
    publicRoutes: process.env.PUBLICROUTES || [
        '/users/create',
        '/users/auth',
        "/home",
        "/home/:prod",
        "/home/:prodEmpresa/all",
        "/clientes/createCliente",
        "/home/:empresa/:valor"
    ],
    tabelas: [
        "usuarios",
        "clientes",
        "configuracoes",
        "empresas",
        "grupos",
        "pedidos",
        "permissao",
        "produtos",
        "vendedores",
        "produtos_empresas",
        "vendedores_produtos"
    ]
}