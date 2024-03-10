import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {  deleteVideo, publishVideo, unPublishVideo, updateThumbnail, updateVideoDetails, uploadVideo } from "../controllers/video.controller.js";

const router = Router();

router.route("/uploadVideo").post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
);

router.route("/publish-video/:videoId").patch(verifyJWT,publishVideo);
router.route("/unpublish-video/:videoId").patch(verifyJWT,unPublishVideo);
router.route("/update-details/:videoId").patch(verifyJWT,updateVideoDetails);
router.route("/update-thumbnail/:videoId").patch(verifyJWT,upload.single("thumbnail"),updateThumbnail)
router.route("/delete-video/:videoId").delete(verifyJWT,deleteVideo);



export default router;
