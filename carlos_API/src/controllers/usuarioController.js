import conn from "../config/conn.js";
import bcrypt from "bcrypt"
import {v4 as uuidv4} from "uuid";
import Jwt from "jsonwebtoken";
import { response } from "express";

//helper
import createUserToken from "../helpers/create-user-token.js";
import getToken from "../helpers/get-token.js";


export const register = async (request, response) => {
    const {nome, email, telefone, senha, confirmsenha} = request.body

    if(!nome){
        response.status(404).json({ message: "O nome e obrigatório"});
        return
    }

    if(!email){
        response.status(404).json({ message: "O email e obrigatório"});
        return
    }

    if(!telefone){
        response.status(404).json({ message: "O telefone e obrigatório"});
        return
    }

    if(!senha){
        response.status(404).json({ message: "O senha e obrigatório"});
        return
    }

    if(!confirmsenha){
        response.status(404).json({ message: "O campo confirma senha é obrigatório"});
        return
    }


    //verificar se o email e válido
    if(!email.includes("@")) {
        response
        .status(409)
        .json({message: "Deve conter @ no É-mail"});
        return;
    }

    //senha === comfirmsenha
    if(senha !== confirmsenha) {
        response
        .status(409)
        .json({ message: "A senha e a confirmação da senha devem ser iguais"});
        return;
    }

    const checkSql = /*sql*/ `select * from usuarios where ?? = ?`
    const checkSqlData = ["email", email]
    conn.query(checkSql, checkSqlData, async (err, data)=>{
        if(err){
            console.error(err)
            response.status(500).json({err: "Erro ao buscar email para cadastro"})
            return
      }

      // 2º 
      if(data.length > 0){
        console.error(err)
        response.status(409).json({err: "O email já está em uso"})
        return
      }

      //Posso fazer o registro
      const salt = await bcrypt.genSalt(12)
    //   console.log(salt)
      const senhaHash = await bcrypt.hash(senha, salt)
    //   console.log("Senha digitada:", senha)
    //   console.log("Senha com hash:", senhaHash)

    //Criar o usuário 
    const id = uuidv4();
    const usuario_img = "userDefault.png"
    const insertsql = /*sql*/ `insert into usuarios (??, ??, ??, ??, ??, ??) value (?, ?, ?, ?, ?, ?)`

    const insertSqlData = [
    "usuario_id",
    "nome",
    "email",
    "telefone",
    "senha",
    "imagem",
    id,
    nome,
    email,
    telefone,
    senhaHash,
    usuario_img,
    ];
    conn.query(insertsql, insertSqlData, (err)=>{
        if (err) {
            console.error(err);
            response.status(500).json({err:"Erro ao cadastrar usuário" });
            return
        }
        //Criar um token
        // Passar o token para o front-end
        const usuarioSql = /*sql*/ `select * from usuarios where ?? = ?`
        const usuarioData = ["usuario_id", id]
        conn.query(usuarioSql, usuarioData, async (err, data) =>{
            if(err){
                response.status(500).json({err: "Erro ao fazer login"})
                return
            }
            const usuario = data[0]

            try {
             await createUserToken(usuario, request, response)
            } catch (error) {
                console.error(error)
                response.status(500).json({err: "Erro ao processar requisição"})
            }
        })
    });
});
};

export const login = (request, response) => {

    if(!email) {
    response.status(400).json({message:"O email é obrigatório"})
    return
    }

    if(!senha) {
        response.status(400).json({message:"A senha é obrigatório"})
        return
        }

        const checkEmailSql = /*sql*/ `select * from usuarios where ?? = ?`
        const checkEmailData = ["email", email]
        conn.query(checkEmailSql, checkEmailData, async (err, data) =>{
            if(err){
                console.error(err)
                response.status(500).json({message:"Erro ao fazer login "})
                return
            }

            if(data.length === 0){
                response.status(500).json({message:"E-mail não está cadastrado"})
                return
            }

            const usuario = data[0]
            console.log(usuario.senha)

            //Comparar senhas
            const compararSenha = await bcrypt.compare(senha, usuario.senha)
            console.log("Comparar senha: ", compararSenha)
            if(!compararSenha){
                response.status(401).json({message: "Senha inválida"})
            }
         
            try {
            await createUserToken(usuario, request, response)
            }catch(error){
                console.error(error)
                response.status(500).json({err:"erro ao processar a informação"})
            }
        })
};

// checkUser -> verificar o usuário logado na aplicação
export const checkUser = async (request, response) => {
    let usuarioAtual;

    if(request.headers.authorization){
        //extrair o token -> barear TOKEN
        const token = getToken(request)
        console.log(token)
        //descriptografar o token jwt.decode
        const decoded = Jwt.decode(token, "SENHASUPERSEGURA")
        console.log(decoded)

        const usuarioId = decoded.id
        const selectSql = /*sql*/ `select nome, email, telefone, imagem from  usuarios where ?? = ?`
        const selectData = ["usuario_id", usuarioId]
        conn.query(selectSql, selectData, (err, data)=>{
            if(err){
                console.error(err)
                response.status(500).json({err: "Erro ao verificar usuário"})
                return
            }
    }
)
    }else{
        usuarioAtual = null
        response.status(200).json(usuarioAtual)
    }
}

// getUserByil -> Verificar usuário
export const getUserByld = async (request, response) => {

}
// eeditUser -> Controlador protegido, e contém a imagem do usuário

export const editUser = async (request, response) => {
    const {id} = request.params;

    try{
        const token = getToken(request);
        //console.log(token)
        const user = await getUserByld(token);
        //console.log(user);

        const {nome, email, telefone} = request.body;
        let imagem = user.imagem;
        console.log("Antes", imagem);
        console.log("Request", request);

        if(request.file){
            imagem = request.file.filename
        }

        if(!nome){
            return response.status(400).json({message:"O nome é obrigatório"})
        }

        if(!email){
            return response.status(400).json({message:"O email é obrigatório"})
        }

        if(!telefone){
            return response.status(400).json({message:"O telefone é obrigatório"})
        }

        //1º Verificar se o usuário existe
        const checkSql = /*sql*/ `select * from usuarios where ?? = ?`
        const checkData = ["usuário_id", id]
        conn.query(checkSql, checkData, (err, data)=>{
            if(err){
                return response.status(500).json("Erro ao verificar usuário para Update")
            }
            if(data.length === 0){
                return response.status(404).json("Usuário não encontrado")
            }

            //2º 
            const checkEmailSql = /*sql*/ `select * from usuarios where ?? * ? and ?? != ?`
            const checkEmailData = ["email", email, "usuario_id", id]
            conn.query(checkEmailSql, checkEmailData, (err, data)=>{
                if(err){
                    return response.status(500).json("Erro ao verificar email para Update")
                }

                if(data.length > 0){
                    return response.status(409).json("E-mail já esta em uso!")
                }

                 //3º Atualizar o usuario
                const updateSql = /*sql*/ `update usuario set ??=?, ??=?, ??=?, ??=? where ??=?`
                const updateData = [{nome, email, telefone, imagem}, "usuario_id", id]
                conn.query( updateSql,updateData, (err)=>{
                    if(err){
                        return response.status(500).json({message:"Erro ao atualizar usuário"})
                    }
                    response.status(200).json({message:"Usuário Atualizado"})
                })
            })
        })
        console.log(nome, email, telefone);
    } catch (error){

    }
}