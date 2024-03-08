import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";

export const uploadVideo = asyncHandler(async (req, res) => {
  // req.user
  // video Model access
  // videoFile ,thumbnail ,title ,description,duration,isPublished,owner  ->req.body
  // isPublished => optionsl

  //check required
  // video file size (max)
  // video file , thumbnail

  const { title = "", description = "", isPublished = true } = req.body || {};
  const userId = req?.user?._id;
  const localVideoFilePath = req?.files?.videoFile?.[0]?.path;
  const localThumbnailPath = req?.files?.thumbnail?.[0]?.path;

  if (!title || !description) {
    throw new ApiError(400, "Title and Decription Required");
  }

  if (!localVideoFilePath) {
    throw new ApiError(400, "Local Video File is Required");
  }
  if (!localThumbnailPath) {
    throw new ApiError(400, "Local Thumbnail File is Required");
  }

  const videoFile = await uploadOnCloudinary(localVideoFilePath);
  const thumbnail = await uploadOnCloudinary(localThumbnailPath);

  if (!videoFile) {
    throw new ApiError(400, "videoFile is Required");
  }
  if (!thumbnail) {
    throw new ApiError(400, "thumbnail is Required");
  }

  //Media files upload to cloudinary

  const video = await Video.create({
    videoFile: videoFile?.url || "",
    thumbnail: thumbnail?.url || "",
    title,
    description,
    isPublished,
    owner: userId,
    duration: videoFile?.duration || 0,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Uploaded Successfully"));
});

export const publishVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if(!req.user?._id.equals(video.owner)){
    throw new ApiError(404,"Invalid User")
  }

  if (video.isPublished == true) {
    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video is Already Published"));
  }

  video.isPublished = true;
  await video.save({ new: true, validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Published Successfully"));
});

export const unPublishVideo=asyncHandler(async(req,res)=>{
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if(!req.user?._id.equals(video.owner)){
    throw new ApiError(404,"Invalid User")
  }

  if (video.isPublished == false) {
    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video is not Published Yet"));
  }

  video.isPublished = false;
  await video.save({ new: true, validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video UnPublished Successfully"));
})

//update Video Title , Description
export const updateVideoDetails = asyncHandler(async (req, res) => {
  const {videoId} = req.params;
  const {title,description} = req.body;

  if(!title || !description){
    throw new ApiError(400,"Title and Description are Required")
  }

  const video = await Video.findByIdAndUpdate(videoId,{$set:{title,description}},{new:true})

  if(!video){
    throw new ApiError(400,"Video with this Id not Found")
  }

  return res.status(200).json(new ApiResponse(200,video,"Video Details Updated Successfully"))
});

//Thumbnail
export const updateThumbnail = asyncHandler(async (req, res) => {
  const {videoId}=req.params;
  const localThumbnailPath = req?.file?.path;

  if(!localThumbnailPath){
    throw new ApiError(400,"Thumbnail is not uploaded Successfully!")
  }

  const thumbnail = await uploadOnCloudinary(localThumbnailPath);
  if(!thumbnail){
    throw new ApiError(400,"Thumbnail is not uploaded to Cloudinary!")
  }

  console.log(thumbnail,"thumb")

  const video = await Video.findByIdAndUpdate(videoId,{$set:{thumbnail:thumbnail.url}},{new:true})

  if(!video){
    throw new ApiError(400,"Video with this Id not Found")
  }

  return res.status(200).json(new ApiResponse(200,video,"Thumbnail Updated Successfully!"))
  

});

// Views Count
export const handleViews = asyncHandler(async (req, res) => {});
