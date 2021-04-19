export default {
    port: process.env.PORT || 9443,
    folderStorage: process.env.URL_STORAGE || "./storage",
    pictureQuality: process.env.PICTURE_QUALITY || 80,
    secretkey: process.env.SECRETYKEY || '8e9dbaf1-2667-46ef-ae0c-779a8108e9a4',
    publicRoutes: process.env.PUBLICROUTES || [
        '/users/create',
        '/users/auth',
        "/home",      
        "/clientes/createCliente",
        "/storage"
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