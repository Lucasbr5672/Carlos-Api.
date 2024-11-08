import { Router } from "express";
import { register, login, checkUser, editUser, getUserByld } from "../controllers/usuarioController.js"

import verifyToken from "../helpers/verify-token.js"
import imageUpload from "../helpers/image-upload.js"

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/checkuser", checkUser);
router.get("/:id", getUserByld);
router.put("/edit/:id", verifyToken, imageUpload.single("imagem") ,editUser);

export default router;