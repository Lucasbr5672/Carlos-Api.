import conn from "../config/conn.js"
import {v4 as uuidv4} from "uuid"

//helpers
import getToken from "../helpers/get-token.js"
import getUserByToken from "../helpers/get-user-by-token.js"

export const create = async(request, response) =>{
    const {nome, categoria, peso, cor, descricao, preco} = request.body
    const disponivel = 1 ;//true = 1 false = 0

    //buscar o token do usuario
    const token = getToken(request);
    const usuario = await getUserByToken(token);
    
    if(!nome){
        return response.status(400).json("O nome do objeto é obrigatorio")
    }
    if(!categoria){
        return response.status(400).json("A categoria do objeto é obrigatorio")
    }
    if(!peso){
        return response.status(400).json("O peso do objeto é obrigatorio")
    }
    if(!cor){
        return response.status(400).json("A cor do objeto é obrigatorio")
    }
    if(!descricao){
        return response.status(400).json("A descrição do objeto é obrigatorio")
    }
    if(!preco){
        return response.status(400).json("O nome do objeto é obrigatorio")
    }

    const objeto_id = uuidv4()
    const usuario_id = usuario.usuario_id
    const objetoSql = /*sql*/ `insert into objetosImage
     (??, ??, ??, ??, ??, ??, ??, ??, ?? ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const objetoData = [
        "objeto_id",
        "nome",
        "categoria",
        "peso",
        "cor",
        "descricao",
        "disponivel",
        "preco",
        "usuario_id",
        objeto_id,
        nome,
        categoria,
        peso,
        cor,
        descricao,
        disponivel,
        preco,
        usuario_id
    ];

    conn.query(objetoSql, objetoData, (err) => {
        if (err){
            console.error(err)
            response.status(500).json({message: "Erro ao adicionar objeto"});
            return;
        } 
    
        if(request.files){
            const insertImageSql = /*sql*/ `insert into objeto_images
            (image_id, image_path, objeto_id) value ?
            `
    
            const imageValues = request.files.map((file)=>[
                uuidv4(),
                file.filename,
                objeto_id
            ])
    
            conn.query(insertImageSql, [imageValues], () => {
                if(err){
                    response.status(500).json({err: "Erro não foi possivel adicionar imagens ao objeto"})
                    return
                }
                response.status(201).json({message: "Objeto criado com sucesso!"});
            })
        }else{
            response.status(201).json({message: "Objeto criado com sucesso!"});
        }
    
    });
};

//Listar todos os dados do objeto

export const getAllObjectUser = async  (request, response) =>{
    try {
        const token = getToken(request)
        const usuario = await getUserByToken(token)

        const usuarioId = usuario.usuario_id

        const selectSql = /*sql*/ `
        select
        obj.objeto_id,
        obj.usuario_id,
        obj.nome,
        obj.categoria,
        obj.peso,
        obj.cor,
        obj.descricao,
        obj.preco,
        group_concat(obj_img.image_path separator ',') as image_paths
        from
        objetos as obj
        left join
        objeto_images as obj_img on obj.objeto_id = obj_img.objeto_id
        obj.usuario_id = ?
        group by
        obj.objeto_id, obj.usuario_id, obj.nome, obj.categoria, obj.descricao, obj.preco
        `
        conn.query(selectSql, [usuarioId], (err, data) => {
            if(err){
                console.error(err)
                response.status(500).json({err:"Erro ao buscar os dados"})
                return
            }
            response.status(200).json(data)
        })
    } catch {

    }
}