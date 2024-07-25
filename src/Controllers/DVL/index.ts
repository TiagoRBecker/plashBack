import { Response, Request } from "express";
import prisma from "../../server/prisma";

class DVL {
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
  async getAllDvls(req: Request, res: Response) {
     const { page ,take ,price,name} = req.query
   
   
    
      try {
        const totalTake = Number(take) || 8; 
      const currentPage = Number(page) || 1; 
      const skip = (currentPage - 1) * totalTake;
    
      
    
        const dvls = await prisma?.dvls.findMany({
          distinct:["name","price"],
          take: totalTake,
          skip: skip,
          where: {
            paidOut: {
              gte: Number(price) || 0,
            },
            name: {
              contains: (name as string) || "",
              mode: "insensitive",
            },
          },
        });
    
        const listCount = await prisma?.dvls.count({
          where: {
            paidOut: {
              gte: Number(price) || 0,
            },
            name: {
              contains: (name as string) || "",
              mode: "insensitive",
            },
          },
        });
        const finalPage = Math.ceil(Number(listCount) / totalTake);
    
        return res.status(200).json({ dvl: dvls, total: finalPage });
      } catch (error) {
        console.log(error);
        return this?.handleError(error, res);
      } finally {
        return this?.handleDisconnect();
      }
    }
  
  async getLastDvls(req: Request, res: Response) {
    try {
      const dvls = await prisma?.dvls.findMany({
        take:5,
        distinct: ["name", ],
        orderBy:{
          upDateDate:"asc"
        }
        
      });

      return res.status(200).json(dvls);
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getLastComission(req: Request, res: Response) {
    try {
      const dvls = await prisma?.dvls_Employee.findMany({
        take:5,
        distinct: ["name", ],
        orderBy:{
          upDateDate:"asc"
        }
        
      });

      return res.status(200).json(dvls);
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  //Retorna uma categoria especifica
  async getOneDvl(req: Request, res: Response) {
    const { slug } = req.params;

    try {
      const dvl = await prisma?.dvls.findFirst({
        distinct: ["name", "price"],
        where: {
          name: slug,
        },
      });

      return res.status(200).json(dvl);
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }

  //Cria uma categoria
  async createDVL(req: Request, res: Response) {
    const { name, paidOut, toReceive, userId } = req.body;
    try {
      const createMagazine = await prisma?.dvls.create({
        data: {
          name,
          paidOut,
          toReceive,
          userId,
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
  //Atualiza uma categoria especifica
  async updateDvl(req: Request, res: Response) {
    const { slug } = req.params;
    const { pay, price } = req.body;

    if (!slug) {
      return res
        .status(404)
        .json({ message: "Não foi possível atualizar o DVL!" });
    }

    try {
      // Atualizar os dvls correspondentes
      const updatedDvls = await prisma?.dvls.updateMany({
        where: {
          name: slug,
          price: Number(price),
        },
        data: {
          toReceive: {
            increment: Number(pay),
          },
          paidOut: {
            decrement: Number(pay),
          },
        },
      });

      // Calcular o total de toReceive para os dvls específicos
      const totalToReceive = await prisma?.dvls.aggregate({
        _sum: {
          toReceive: true,
        },
        where: {
          name: slug,
          price: Number(price),
        },
      });  
     
      // Atualizar o availableForWithdrawal de todos os usuários que possuem esses dvls
      await prisma?.$transaction(async (prisma) => {
        // Encontrar todos os usuários que possuem os dvls correspondentes
        const usersToUpdate = await prisma.users.findMany({
          where: {
            dvlClient: {
              some: {
                name: slug,
                price: Number(price),
              },
            },
          },
        });

        // Iterar pelos usuários e atualizar o availableForWithdrawal
        await Promise.all(
          usersToUpdate.map(async (user) => {
            await prisma.users.update({
              where: {
                id: user.id,
              },
              data: {
                availableForWithdrawal: totalToReceive?._sum.toReceive,
              },
            });
          })
        );
      });

      return res.status(200).json(updatedDvls);
    } catch (error) {
      return this.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
}

 
}

const DvlController = new DVL();
export default DvlController;
