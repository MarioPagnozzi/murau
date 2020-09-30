export default {
    port: process.env.PORT || 3000,
    secretkey: process.env.SECRETYKEY || '8e9dbaf1-2667-46ef-ae0c-779a8108e9a4',
    publicRoutes: process.env.PUBLICROUTES || [
        '/users/create',
        '/users/auth'
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
        "vendedores"
    ]
}