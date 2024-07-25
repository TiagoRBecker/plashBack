import { Response, Request } from "express";
export const upLoad = async (req:Request,res:Response)=>{
    try {
        console.log(req.file)
    
        return res.status(200).json({messa:"ok"})
    } catch (error) {
        console.log(error)
    }
     

}