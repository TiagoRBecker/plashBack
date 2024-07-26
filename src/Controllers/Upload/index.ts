import { Response, Request } from "express";
import { bucket, storage } from "../../utils/multerConfig";
export const UploadPdf = async (req:Request,res:Response)=>{
     const pdf = req.file as any
    try {
         const newC = pdf.linkUrl.split("plash_bucket/");
         const read = await bucket.file(newC[1]);
        const [url] = await read.getSignedUrl({
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutos
          });
        return res.status(200).json({pdf:pdf.linkUrl, url:url})
       
    } catch (error) {
        console.log(error)
    }
     

}