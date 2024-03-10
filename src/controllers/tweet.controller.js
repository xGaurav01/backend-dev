import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.modals.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const createTweet =asyncHandler(async(req,res)=>{
        const userId = req.user._id || {};
        const {content=''} = req.body;

        if(!content){
            throw new ApiError(400,"Content is required")
        }

        const tweet = await Tweet.create({
            owner:userId,
            content:content
        })
        if(!tweet){
            throw new ApiError(400,"Failed to create tweet")
        }

        return res.status(200).json(new ApiResponse(200,tweet,"Tweet created Successfully"))
})

export const updateTweet =asyncHandler(async(req,res)=>{
    const userId = req.user._id || {};
    const {content=''} = req.body; 
    const tweetId = req.params.tweetId;

    if(!content){
        throw new ApiError(400,"Content is required")
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(400,"Tweet not found")
    }

    if(!userId.equals(tweet.owner)){
        throw new ApiError(400,"Invalid User")
    }

    tweet.content = content;
    await tweet.save()

    return res.status(200).json(new ApiResponse(200,tweet,"Tweet Updated Successfully"))


})

export const deleteTweet =asyncHandler(async(req,res)=>{

    const userId = req.user._id || {};
    const tweetId = req.params.tweetId; 
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(400,"Tweet not found")
    }

    if(!userId.equals(tweet.owner)){
        throw new ApiError(400,"Invalid User")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).json(new ApiResponse(200,{},"Tweet Deleted Successfully"))
})




