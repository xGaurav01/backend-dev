export const asyncHandler =(reqhandler)=>{
    return (req,res,next)=>{
        Promise.resolve(reqhandler(req,res,next)).catch((err)=>next(err))
    }
}


// const asyncHandler=(func)=>async(req,res,next)=>{
//     try{
//         await func(req,res,next)
//     }
//     catch(err){
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }



