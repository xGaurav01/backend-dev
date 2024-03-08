import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createComment, deleteComment, updateComment } from "../controllers/comment.controller.js";

const router = Router()

router.route("/add-comment/:videoId").post(verifyJWT,createComment);
router.route("/update-comment/:commentId").patch(verifyJWT,updateComment)
router.route("/delete-comment/:commentId").delete(verifyJWT,deleteComment)


export default router