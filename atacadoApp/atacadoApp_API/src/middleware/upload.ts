import { Request, Response, NextFunction } from 'express';

const maxSize = 5 * 2024 * 2024;
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const util = require('util');
var sharp = require('sharp');

let storage = multer.diskStorage({
    destination: (req , files, cb) => {
        cb(null, "./public/uploads")
    },
    
    filename: (req, files, cb) => {
        cb(null, files.originalname)
    }
});

let uploadFile = multer({   
    storage: storage,
    limits: {fileSize: maxSize}
}).array("files", 12);

let uploadFileAux = util.promisify(uploadFile);
module.exports = uploadFileAux
