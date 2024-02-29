import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from '../models/user.models.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { upload } from "../middlewares/multer.middleware.js";
import {ApiResponse} from '../utils/ApiResponse.js'

export const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, fullName , password } = req.body;
  console.log({ email });

  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are Required");
  }

  const existedUser = User.findOne({$or:[{ userName }, { email }]})
  if(existedUser){
    throw new ApiError(409,"User email or userName already exists")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log(req.files,"req")

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!avatar){
    throw new ApiError(400,"Avatar is Required")
  }

  const user = await User.create({
    fullName,
    avatar:avatar?.url,
    coverImage:coverImage?.url || '',
    userName:userName.toLowerCase(),
    email,
    password
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering user")
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User Registred Successfully")
  )


});
