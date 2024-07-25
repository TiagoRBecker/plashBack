import { Response, Request } from "express";
import prisma from "../../server/prisma";
import { bucket } from "../../utils/multerConfig";

class Article {
  //Funçao para tratar dos erros no servidor
  private handleError(error: any, res: Response) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  //Função para desconetar o orm prisma
  private async handleDisconnect() {
    return await prisma?.$disconnect();
  }
  //Retorna todas as categorias
  async getAllArticle(req: Request, res: Response) {
    try {
      const { page } = req.query;
      if (page) {
        const take = 6;
        const numberPage = (Number(page) - 1) * take;
        const getArticles = await prisma?.articles.findMany({
          take: take,
          skip: Number(numberPage),

          include: {
            magazine: true,
            categories: true,
          },
        });
        const listCount: any = await prisma?.articles.count();
        const finalPage = Math.ceil(listCount / take);

        return res.status(200).json({ getArticles, finalPage });
      } else {
        const { author, name, company, volume, category, take } = req.query;
        const getArticleFilter = await prisma?.articles.findMany({
          take: Number(take) || 100,
          where: {
            name: {
              contains: (name as string) || "",
              mode: "insensitive",
            },
            author: {
              contains: (author as string) || "",
              mode: "insensitive",
            },
            company: {
              contains: (company as string) || "",
              mode: "insensitive",
            },
            volume: {
              contains: (volume as string) || "",
              mode: "insensitive",
            },
            categories: {
              name: {
                contains: category as string,
                mode: "insensitive",
              },
            },
          },
          include: {
            magazine: true,
            categories: true,
          },
        });
        return res.status(200).json(getArticleFilter);
      }
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  
  //Retorna uma categoria especifica
  async getOneArticle(req: Request, res: Response) {
    const { slug } = req.params;
  

    try {
    
        const getArticle = await prisma?.articles.findUnique({
          where: { id: Number(slug) },
          include: {
            magazine: {
              select: {
                id: true,
                name: true,
                company: true,
                cover: true,
                author: true,
              },
            },
          },
        });
        const updateView = await prisma?.articles.update({
          where: {
            id: Number(getArticle?.id),
          },
          data: {
            views: {
              increment: 1,
            },
          },
        });
        
        return res.status(200).json(getArticle);
       
    
     
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  
  async getArticleMostViews(req: Request, res: Response) {
    try {
      const getArticle = await prisma?.articles.findMany({
        take:6,
        where: {
          views:{
            gte:5
          }
        },
        select: {
          id: true,
          author: true,
          company: true,
          name: true,
          description: true,
          cover: true,
          price: true,
          status: true,
          volume: true,
          views:true
        },
      });

      return res.status(200).json(getArticle);
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getArticleRecommended(req: Request, res: Response) {
    try {
      const getArticle = await prisma?.articles.findMany({
        where: {
          status: "recommended",
        },
        select: {
          id: true,
          author: true,
          company: true,
          name: true,
          description: true,
          cover: true,
          price: true,
          status: true,
          volume: true,
          views:true
        },
      });

      return res.status(200).json(getArticle);
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getArticleFree(req: Request, res: Response) {
    try {
      const getArticle = await prisma?.articles.findMany({
        where: {
          status: "free",
        },
        select: {
          id: true,
          author: true,
          company: true,
          views:true,
          name: true,
          description: true,
          cover: true,
          price: true,
          status: true,
          volume: true,
          articlepdf: true,
          magazine: true,
        },
      });

      return res.status(200).json(getArticle);
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getArticleTrend(req: Request, res: Response) {
    try {
      const getArticle = await prisma?.articles.findMany({
        where: {
          status: "trend",
        },
        select: {
          id: true,
          author: true,
          company: true,
          name: true,
          description: true,
          cover: true,
          price: true,
          status: true,
          volume: true,
          views:true
        },
      });

      return res.status(200).json(getArticle);
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getArticleMostRead(req: Request, res: Response) {
    try {
      const getArticle = await prisma?.articles.findMany({
        where: {
          views:{
            gte:5
          }
        },
        select: {
          id: true,
          author: true,
          company: true,
          name: true,
          description: true,
          cover: true,
          price: true,
          status: true,
          volume: true,
          views:true
        },
      });

      return res.status(200).json(getArticle);
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }

 
  

  
}
class AdminArticle {
  //Funçao para tratar dos erros no servidor
  private handleError(error: any, res: Response) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  //Função para desconetar o orm prisma
  private async handleDisconnect() {
    return await prisma?.$disconnect();
  }
  //Retorna todas as categorias
  async getAllArticle(req: Request, res: Response) {
    const { author, name, company, volume, category, take,status,page } = req.query;
    try {
      const totalTake = Number(take) || 8; 
      const currentPage = Number(page) || 1; 
      const skip = (currentPage - 1) * totalTake;
      const getArticles = await prisma?.articles.findMany({
        take: Number(take) || 100,
        where: {
          name: {
            contains: (name as string) || "",
            mode: "insensitive",
          },
          author: {
            contains: (author as string) || "",
            mode: "insensitive",
          },
          company: {
            contains: (company as string) || "",
            mode: "insensitive",
          },
          volume: {
            contains: (volume as string) || "",
            mode: "insensitive",
          },
          
          status: {
            
              contains: status as string,
              mode: "insensitive",
            
          },
        },
       
        include: {
          magazine: {
            select:{
              name:true
            }
          },
          categories: true,
        },
      });
        
        const listCount: any = await prisma?.articles.count();
        const finalPage = Math.ceil(listCount / totalTake);

        return res.status(200).json({ articles:getArticles, total:finalPage });
      
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }

  //Retorna uma categoria especifica
  async getOneArticle(req: Request, res: Response) {
    const { slug } = req.params;
  

    try {
    
        const getArticle = await prisma?.articles.findUnique({
          where: { id: Number(slug) },
          include: {
            magazine: {
              select: {
                id: true,
                name: true,
                company: true,
                cover: true,
                author: true,
              },
            },
          },
        });
        
        return res.status(200).json(getArticle);
       
    
     
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getArticleMostViews(req: Request, res: Response) {
    try {
      const getArticle = await prisma?.articles.findMany({
        take:6,
        where: {
          views:{
            gte:10
          }
        },
        select: {
          id: true,
          author: true,
          company: true,
          name: true,
          description: true,
          cover: true,
          price: true,
          status: true,
          volume: true,
          views:true
        },
      });

      return res.status(200).json(getArticle);
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }

  async getArticleMostRead(req: Request, res: Response) {
    try {
      const getArticle = await prisma?.articles.findMany({
        where: {
          views:{
            gte:5
          }
        },
        select: {
          id: true,
          author: true,
          company: true,
          name: true,
          description: true,
          cover: true,
          price: true,
          status: true,
          volume: true,
          views:true
        },
      });

      return res.status(200).json(getArticle);
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }

  //Admin Routes
  async createArticle(req: Request, res: Response) {
    const {
      author,
      company,
      name,
      description,
      price,
      volume,
      categoryId,
      magazineId,
      capa_name,
      status,
    } = req.body;

    const file = req.file as any;
    const newC = file.linkUrl.split("plash_bucket/");
    const read = await bucket.file(newC[1]);
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 2);
    const [url] = await read.getSignedUrl({
      action: "read",
      expires: expires,
    });
   
  
    try {
      const createArticle = await prisma?.articles.create({
        data: {
          author,
          company,
          articlepdf:"",
          capa_name:"",
          name,
          description,
          price: Number(price),
          volume,
          cover: url,
          magazineId: Number(magazineId),
          categoriesId: Number(categoryId),
          status: status,
        },
      });
      return res.status(200).json({ message: "Categoria criada com sucesso!" });
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
    
  }

  async updateArticle(req: Request, res: Response) {
    const { slug } = req.params;
 
    if (!slug) {
      return res
        .status(404)
        .json({ message: "Não foi possivel atualizar o imóvel!" });
    }
    //@ts-ignore
  
    try {
      const {
        author,
        company,
        name,
        description,
        volume,
        categoryId,
        magazineId,
        status,
        cover
      } = req.body;

    
      let newCover = cover;
      //@ts-ignore
      if (req?.file) {
        //@ts-ignore
       
        const newC = req.file.linkUrl.split("plash_bucket/");
        const read = await bucket.file(newC[1]);
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 2);
        const [url] = await read.getSignedUrl({
          action: "read",
          expires: expires,
        });
        newCover = url;
       
        const updateArticle = await prisma?.articles.update({
          where: {
            id: Number(slug),
          },
          data: {
            author,
            company,
            name,
            description,
            volume,
            categoriesId:Number(categoryId),
            magazineId:Number(magazineId),
            status,
            cover:newCover
          },
        });
        return res
          .status(200)
          .json({ message: "Artigo atualizada com sucesso!" });
        
      
      }
      else{
        const updateArticle = await prisma?.articles.update({
          where: {
            id: Number(slug),
          },
          data: {
            author,
            company,
            name,
            description,
            volume,
            categoriesId:Number(categoryId),
            magazineId:Number(magazineId),
            status,
            cover:newCover
          },
        });
        return res
          .status(200)
          .json({ message: "Artigo atualizada com sucesso!" });
      }
      
     
    
    
    } catch (error) {
      console.log(error);
      return this.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
      
      
  }

  async deleteArticle(req: Request, res: Response) {
    const { id } = req.body;
    if (!id) {
      return res
        .status(403)
        .json({ message: "Não foi possível encontrar a categoria!" });
    }
    try {
      const deletMagazine = await prisma?.articles.delete({
        where: {
          id: Number(id),
        },
      });
      return res
        .status(200)
        .json({ message: "Categoria deletado com sucesso!" });
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
}

export const ArticleController = new Article();
export const AdminArticleController = new AdminArticle();

