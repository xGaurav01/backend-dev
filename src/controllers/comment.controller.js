import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comments.models.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createComment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { content } = req.body;
  const { videoId } = req.params;

  if (!content) {
    throw new ApiError(400, "Content Field is Required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video Not Found");
  }

  const comment = await Comment.create({
    content: content || "",
    video: videoId,
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment Added Successfully"));
});


export const updateComment = asyncHandler(async(req,res)=>{

    const {commentId} = req.params;
    const {content} = req.body;

    if(!content){
        throw new ApiError(400,"Content is Required")
    }

    const comment = await Comment.findByIdAndUpdate(commentId,{$set:{content:content}},{new:true});

    if(!comment){
        throw new ApiError(400,"Comment Not Found")
    }
    
    return res.status(200).json(new ApiResponse(200,comment,"Comment Updated Successfully"))

})


export const deleteComment = asyncHandler(async(req,res)=>{

    const {commentId} = req.params;
    

    const comment = await Comment.findByIdAndDelete(commentId);

    if(!comment){
        throw new ApiError(400,"Comment Not Found")
    }
    
    return res.status(200).json(new ApiResponse(200,{},"Comment Deleted Successfully"))

})