import Jwt from "jsonwebtoken";

const createUserToken = async (usuario, request, response) => {
    //Criar o token
    const token = Jwt.sign(
        {
            nome: usuario.nome,
            id: usuario.usuario_id,
        },
        "SENHASUPERSEGURA" //Senha de criptografia
    )
    //Retornar o token
    response.status(200).json({
        message:"Você está autenticado",
        token: token,
        usuario: usuario.usuario_id,
    })
}

export default createUserToken;