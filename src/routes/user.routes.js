import {Router} from 'express';
import { loginUser, logOutUser, registerUser,refreshAccessToken, getCurrentUser } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {upload} from '../middlewares/multer.middleware.js';


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:'avatar',
            maxCount:1
        },
        {
            name:'coverImage',
            maxCount:1
        }
    ]),
    registerUser
    )
router.route("/login").post(loginUser)

//secured rotes

router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/changePassword").post(verifyJWT,getCurrentUser);

// router.route("/getuser").get(verifyJWT,getCurrentUser);
// router.route("/getuser").get(verifyJWT,getCurrentUser);
// router.route("/getuser").get(verifyJWT,getCurrentUser);

router.route("/getuser").get(verifyJWT,getCurrentUser);


export default router