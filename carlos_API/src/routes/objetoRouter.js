import router from "express"
import { create, getAllObjectUser } from "../controllers/objetoController.js"


const router = Router();

import veryfyToken from "../helpers/verify-token.js"
import imageUplod from "../helpers/image-upload";

router.post("/", verifyToken, imageUplod.array("images"))