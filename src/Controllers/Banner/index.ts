import { Response, Request } from "express";
import prisma from "../../server/prisma";
import { bucket } from "../../utils/multerConfig";
class Banner {
   //Funçao para tratar dos erros no servidor
   private handleError(error: any, res: Response) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  //Função para desconetar o orm prisma
  private async handleDisconnect() {
    return await prisma?.$disconnect();
  }
  async getAllBanners(req: Request, res: Response) {
    try {
      const covers = await prisma?.banners.findMany({
        take:4
    });

    return res.status(200).json(covers);
    } catch (error) {
      console.log(error)
      return this?.handleError(error,res)
    }finally{
      return this?.handleDisconnect()
    }
    
  }
  async createBanner(req: Request, res: Response) {
    const { name} = req.body
    const banner = req.file as any
    
 
  
    try {
      const createBanner = await prisma?.banners.create({
        data:{
            name,
            cover:banner.linkUrl
        }
    });
     
    return res.status(200).json({message:"Banner criado com sucesso"});
    } catch (error) {
      return this?.handleError(error,res)
    }
    finally{
      return this?.handleDisconnect()
    }
    
  
    
  }
 
 
  async deletBanner(req: Request, res: Response) {
    const {id} = req.body
    console.log(id)
  
    if(!id){
      return res.status(404).json({message:"Banner não encontrado!"})
    }
    try {
      const createCover = await prisma?.banners.delete({
        where:{
          id:Number(id)
        }
      });
     
      return res.status(200).json({ message: "Banner Deletado com sucesso" });
    } catch (error) {
      return this?.handleError(error,res)
    }
    finally{
      return this?.handleDisconnect()
    }
    
    
  }
  
}
const BannerController = new Banner();
export default BannerController;
