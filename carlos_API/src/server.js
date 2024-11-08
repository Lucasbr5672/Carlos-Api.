import "dotenv/config";
import express, { response } from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

//Importa a conexão com o banco
import conn from "./config/conn.js"


//Importar os modulos
import "./models/usuarioModel.js"

//Importa as rotas
import usuarioRouter from "./routes/usuarioRouter.js"

const PORT = process.env.PORT || 3333
const app = express()


//identificar para a pasta public
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


//3 middleware
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json()); // => permite a api requisitos tipo json

// console.log("filename: ", __filename)
// console.log("dirname: ", __dirname)


//Pasta para os arquivos estáticos
app.use("public", express.static(path.join(__dirname, "public")))


//Utilizar rotas
app.use("/usuario", usuarioRouter)


app.use((request, response) => {
    response.status(404).json({message: "Rota não encontrada"});
});


app.listen(PORT, () =>{
    console.log(`Servidor on port ${PORT}`);
})