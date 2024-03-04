import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};


export const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;

  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are Required");
  }

  const existedUser = await User.findOne({ $or: [{ userName }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User email or userName already exists");
  }

  const avatarLocalPath = req?.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req?.files?.coverImage?.[0]?.path;
  // console.log(req.files,"req")

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is Required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
    userName: userName.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registred Successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;
  if (!userName && !email) {
    throw new ApiError(400, "Username or email is Required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged in Successfully"
      )
    );
});

export const logOutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized Request");
    }
  
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh Token is Expired or used")
    }
  
    const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user?._id)
    const options = {
      httpOnly : true,
      secure:true
    }
  
    return res.status(200).
      cookie("accessToken",accessToken,options).
      cookie("resfreshToken",newRefreshToken,options).
      json(
       new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access Token Refreshed")
      )
    
  
  } catch (error) {
    throw new ApiError(401,error.message || "Invalid Refresh Token")
  }
});

export const changeCurrentPassword  =asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword} = req.body;

  const user = await User.findById(req?.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid Old Password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res.status(200).json(new ApiResponse(200,{},"Password Changed Successfully"))

})

export const getCurrentUser = asyncHandler(async(req,res)=>{
      const user = req?.user;
      
      return res.status(200).json(new ApiResponse(200,user,"User Details Fetched Successfully"))
})

export const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullName,email} = req.body;
  if (!fullName || !email) {
    throw new ApiError(400,"All Fields Are Required")    
  }

  const user = await User.findByIdAndUpdate( 
    req.user._id,
    {
      $set:{
        fullName,
        email
      }
    },
    {new: true}
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200,user,"User Updated Successfully"))

})

export const updateUserAvatar = asyncHandler(async(req,res)=>{

  const avatarLocalPath = req?.file?.path;

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if(!avatar.url){
    throw new ApiError(400,"Error while uploading avatar")
  }

  const user = await User.findByIdAndUpdate( 
    req.user._id,
    {
      $set:{
        avatar:avatar?.url
      }
    },
    {new: true}
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200,user,"Avatar Updatted Successfully"))

})

export const updateCoverImage = asyncHandler(async(req,res)=>{

  const coverLocalPath = req?.file?.path;

  if(!coverLocalPath){
    throw new ApiError(400,"Cover file is missing")
  }

  const coverImage = await uploadOnCloudinary(coverLocalPath)
  if(!coverImage.url){
    throw new ApiError(400,"Error while uploading CoverImage")
  }

  const user = await User.findByIdAndUpdate( 
    req.user._id,
    {
      $set:{
        coverImage:coverImage?.url
      }
    },
    {new: true}
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200,user,"CoverImage Updatted Successfully"))

 
})