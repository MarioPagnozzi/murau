const multer = require('multer');
const util = require('util');
const maxSize = 5 * 2024 * 2024;

let storage = multer.diskStorage({
    destination: (req , files, cb) => {
        cb(null, "./public/uploads/files")
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
