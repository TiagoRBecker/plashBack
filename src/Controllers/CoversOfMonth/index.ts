import { Response, Request } from "express";
import prisma from "../../server/prisma";
import { randomUUID } from "crypto";
class Covers {
   //Funçao para tratar dos erros no servidor
   private handleError(error: any, res: Response) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  //Função para desconetar o orm prisma
  private async handleDisconnect() {
    return await prisma?.$disconnect();
  }
  async getAllCoverEvents(req: Request, res: Response) {
    try {
      
      const covers = await prisma?.eventOfCoverMonth.findMany({
        include: {
          cover: true,
        },
      });
  
      return res.status(200).json(covers);
    } catch (error) {
      console.log(error)
      return this?.handleError(error,res)
    }finally{
      return this?.handleDisconnect()
    }
  }
  async getAllCoverEventsAdmin(req: Request, res: Response) {
    const {page, take,name} = req.query;
    try {
      const totalTake = Number(take) || 8; 
      const currentPage = Number(page) || 1; 
      const skip = (currentPage - 1) * totalTake;
    const covers = await prisma?.eventOfCoverMonth.findMany({
     take:totalTake,
     skip:skip,
     where:{
      name:{
        contains:name as string || '',
        mode:"insensitive"
      }
     },
     include: {
      cover: true,
    }
    });
    const listCount = await prisma?.eventOfCoverMonth.count();
    const finalPage = Math.ceil(Number(listCount) / totalTake);
    return res.status(200).json({covers:covers,total:finalPage});
    } catch (error) {
       console.log(error)
      return this?.handleError(error,res)
    }
    finally{
      return this?.handleDisconnect()
    }
       
  }
  async addVoteCover(req: Request, res: Response) {
    const { slug } = req.params;
    const id = req.user.id;

    const checkUser = await prisma?.coverOfMonth.findFirst({
      where: {
        id: Number(slug),
        userId: Number(id),
      },
    });

    if (checkUser) {
      return res.status(403).json({ message: "Voçê já votou!" });
    }
    try {
      const covers = await prisma?.coverOfMonth.update({
        where: {
          id: Number(slug),
        },
        data: {
          countLike: {
            increment: 1,
          },
          userId: Number(id),
        },
      });

      return res.status(200).json({ message: "Voto confirmado com sucesso " });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "Erro no sistema tente novamente mais tarde!" });
    }
    finally{
      return this?.handleDisconnect()
    }
  }
  async createEventCover(req: Request, res: Response) {
    const { name, date_event, selectedValues } = req.body;
  try {
    await prisma?.$transaction(async (prisma) => {
      const ids = selectedValues.map((id: any) => parseInt(id));
      const getCovers = await prisma.magazines.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          id: true,
          name: true,
          cover: true,
        },
      });
  
   
      let covers = [] as any;
      for (const cover of getCovers) {
        covers.push({ name: cover.name, cover: cover.cover[0] });
      }

      const createEvent = await prisma.eventOfCoverMonth.create({
        data: {
          name,
          date_event: String(date_event),
          cover: {
            create: covers,
          },
        },
      });

      return res.status(200).json({ message: "Evento criado com sucesso" });
      
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Erro no sistema tente novamente mais tarde!" });
  }
  finally{
    return this?.handleDisconnect()
  }
    
    
  }

  async deletEvent(req: Request, res: Response) {
    const { slug } = req.params;
    
    if (!slug) {
      return res.status(404).json({ message: "Evento não encontrado!" });
    }
    try {
      const deletCover = await prisma?.eventOfCoverMonth.delete({
        where: {
          id: Number(slug),
        },
        include:{
          cover:true
        }
      });
  

      return res.status(200).json({ message: "Evento Deletado com sucesso" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "Erro no sistema tente novamente mais tarde!" });
    } finally {
      return prisma?.$disconnect();
    }
  }
}
const CoversController = new Covers();
export default CoversController;
