import multer from "multer"
import path from "node:path";
import { fileURLToPath } from "node:url";


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

//Estruturar onde vou guarda as imagens
const imageStorage = multer.diskStorage({
    destination: (request, file, cb)=>{
        let folder = "";

        if(request.baseUrl.includes("usuarios")) {
            folder = "usuários";
        }else if(request.baseUrl.includes("objetos")) {
            folder = "objetos";
        }
        cb(null, path.join(__dirname, `../public/${folder}`))
    },
    filename: (reuquest, file, cb) => {
        //Nome do arquivo
        cb(null, Date.now() + String(Math.floor(Math.random() * 10000)) + path.extname(file.originalname));
    },
})
//Executar a função para guarda as imagem

const imageUplod = multer({
    storage: imageStorage,
    fileFilter(request, file, cb){
        if(!file.originalname.match(/\.(png||jpg)$/)){
            return cb(new Error("Por favor, envie apenas jpg ou png!"))
        }
        cb(null, true);
    },
});

export default imageUplod;