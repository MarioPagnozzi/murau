import { getRepository ,Repository } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import {verify} from 'jsonwebtoken';
import config from '../configuracao/config';
import { User } from '../entity/User';

export default async (req: Request, res: Response, next: NextFunction) => {
    
    let token = req.body.token || req.query.token || req.headers['x-token-access'];
    let publicRoutes = <Array<String>>config.publicRoutes;
    let isPublicRoutes: boolean = false;
    let _repUsuario: Repository<User> = getRepository(User);

    publicRoutes.forEach(url => {
        let isPublic = req.url.includes(url) || req.url.indexOf('storage') > -1 || req.url.indexOf('home') > -1;
        if (isPublic)
            isPublicRoutes = true;
    })

    if (isPublicRoutes) {
        next();
    }
    else {
        if (token) {
            try {
                let _userAuth = verify(token, config.secretkey);
                req.userAuth = _userAuth;

                let _usuario = await _repUsuario.findOne({relations: ["grupos"], where: { uid: _userAuth.uid }});
                req.isRoot = _usuario.isRoot;
                
                req.grupos = await _usuario.grupos;

                next();
            }
            catch(error) {
                res.status(401).send({message: "token informado é inválido!"});
                return
            }
        } 
        else {
            res.status(401).send({message: "Para acessar o recurso é preciso estar autenticado!"});
            return;
        }
    }
}
