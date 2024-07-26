import { Response, Request } from "express";
import prisma from "../../server/prisma";

import { bucket } from "../../utils/multerConfig";

class Magazine {
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
  async getAllMagazine(req: Request, res: Response) {
    try {
      const { page } = req.query;
      if (page) {
        const take = 8;
        const numberPage = (Number(page) - 1) * take;
        const getMagazine = await prisma?.magazines.findMany({
          take: take,
          skip: Number(numberPage),

          include: {
            article: true,
            Category: true,
            employees: true,
          },
        });
        const listCount: any = await prisma?.magazines.count();
        const finalPage = Math.ceil(listCount / take);

        return res.status(200).json({ getMagazine, finalPage });
      } else {
        const { author, name, company, volume, category, take } = req.query;

        const getMagazineFilter = await prisma?.magazines.findMany({
          take: Number(take) || 8,

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
            Category: {
              name: {
                contains: category as string,
                mode: "insensitive",
              },
            },
          },
          include: {
            article: true,
            Category: true,
            employees: true,
          },
        });

        return res.status(200).json(getMagazineFilter);
      }
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getLastMagazines(req: Request, res: Response) {
    try {
      const getLastMagazine = await prisma?.magazines.findMany({
        take: 4,
        orderBy: {
          createDate: "asc",
        },
        select: {
          id: true,
          name: true,
          author: true,
          company: true,
          cover: true,
          volume: true,
          description: true,
          model: true,
        },
      });

      return res.status(200).json(getLastMagazine);
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getMostViews(req: Request, res: Response) {
    try {
      const getLastMagazine = await prisma?.magazines.findMany({
        take: 4,
        orderBy: {
          createDate: "asc",
        },
        where: {
          view: {
            gte: 2,
          },
        },
        select: {
          id: true,
          name: true,
          author: true,
          company: true,
          cover: true,
          volume: true,
          view: true,
        },
      });

      return res.status(200).json(getLastMagazine);
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  //Retorna uma categoria especifica
  async getOneMagazine(req: Request, res: Response) {
    const { slug } = req.params;

    try {
      const magazine = await prisma?.magazines.findUnique({
        where: { id: Number(slug) },
        select: {
          author: true,
          Category: true,
          cover: true,
          company: true,
          name: true,
          views: true,
          price: true,
          volume: true,
          id: true,
          description: true,
          model: true,

          article: {
            take: 6,
            select: {
              author: true,
              company: true,
              description: true,
              name: true,
              price: true,
              views: true,
              cover: true,
              status: true,
              volume: true,
              id: true,
            },
          },
        },
      });
      const updateView = await prisma?.magazines.update({
        where: {
          id: Number(slug),
        },
        data: {
          view: {
            increment: 1,
          },
        },
      });

      return res.status(200).json(magazine);
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
}

class AdminMagazine {
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
  async getAllMagazine(req: Request, res: Response) {
    const { name, author, page, company, take, volume, category } = req.query;

    try {
      const totalTake = Number(take) || 8;
      const currentPage = Number(page) || 1;
      const skip = (currentPage - 1) * totalTake;
      const magazines = await prisma?.magazines.findMany({
        take: totalTake,
        skip: skip,
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
          subCategory: {
            contains: (category as string) || "",
            mode: "insensitive",
          },
        },

        include: {
          article: true,
          Category: true,
          employees: true,
        },
      });
      const listCount: any = await prisma?.magazines.count();
      const finalPage = Math.ceil(listCount / totalTake);

      return res.status(200).json({ magazine: magazines, total: finalPage });
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getLastMagazines(req: Request, res: Response) {
    try {
      const getLastMagazine = await prisma?.magazines.findMany({
        take: 4,
        orderBy: {
          createDate: "asc",
        },
        select: {
          id: true,
          name: true,
          author: true,
          company: true,
          cover: true,
          volume: true,
          description: true,
        },
      });

      return res.status(200).json(getLastMagazine);
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getMostViews(req: Request, res: Response) {
    try {
      const getLastMagazine = await prisma?.magazines.findMany({
        take: 4,
        orderBy: {
          createDate: "asc",
        },
        where: {
          view: {
            gte: 2,
          },
        },
        select: {
          id: true,
          name: true,
          author: true,
          company: true,
          cover: true,
          volume: true,
          view: true,
        },
      });

      return res.status(200).json(getLastMagazine);
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  //Retorna uma categoria especifica

  //Admin Routes
  async getMagazineEdit(req: Request, res: Response) {
    const { slug } = req.params;

    try {
      const magazine = await prisma?.magazines.findUnique({
        where: { id: Number(slug) },
        select: {
          author: true,
          Category: true,
          cover: true,
          company: true,
          name: true,
          price: true,
          volume: true,
          id: true,
          subCategory: true,
          description: true,
          magazine_pdf: true,
          employees: true,
          model: true,
        },
      });
      const newC = magazine?.magazine_pdf?.split("plash_bucket/") as any;
      const read = await bucket.file(newC[1]);
      const [url] = await read.getSignedUrl({
        action: "read",
        expires: Date.now() + 60 * 60 * 1000, // 1 hora
      });

      //@ts-ignore
      

      return res.status(200).json({ magazine, url });
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async createMagazine(req: Request, res: Response) {
    const {
      author,
      company,
      name,
      description,
      categoryId,
      price,
      volume,
      subCategory,
      model,
      pdf,
    } = req.body;
    const slug = `${name}#vol${volume}`;
    const employes = JSON.parse(req.body.employes);

    const cover_file = req.file as any;

    try {
      await prisma?.$transaction(async (prisma) => {
        // Criar a revista no banco de dados
        const createMagazine = await prisma.magazines.create({
          data: {
            author,
            company,
            name,
            description,
            magazine_pdf: pdf,
            price: Number(price),
            slug: slug,
            subCategory,
            model,
            volume,
            cover: [cover_file.linkUrl],
            categoryId: Number(categoryId),
          },
        });

        // Vincular a revista a cada funcionário
        for (const employee of employes) {
          const updateEmploye = await prisma.employee.update({
            where: { id: employee.id },
            data: {
              magazines: {
                connect: { id: createMagazine.id },
              },
            },
          });
        }
      });
      return res
        .status(200)
        .json({ message: "Revista criada com sucesso criada com sucesso!" });
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }

  async updateMagazine(req: Request, res: Response) {
    const { slug } = req.params;

    if (!slug) {
      return res
        .status(404)
        .json({ message: "Náo foi possivel localizar a revista!" });
    }
    //@ts-ignore

    const {
      author,
      company,
      name,
      description,
      categoryId,
      price,
      volume,
      subCategory,
      model,
      cover,
      pdf,
    } = req.body;

    try {
      const employes = JSON.parse(req.body.employes);
      const slugHash = `${name}#vol${volume}`;
      //@ts-ignore
      const cover_file = req.file as any;

      await prisma?.$transaction(async (prisma) => {
        const updateMagazine = await prisma?.magazines.update({
          where: {
            id: Number(slug),
          },
          data: {
            author,
            company,
            name,
            description,
            price: Number(price),
            volume,
            subCategory,
            model,
            slug: slugHash,
            categoryId: Number(categoryId),
            cover: cover_file ? [cover_file.linkUrl] : [cover],
            magazine_pdf: pdf,
          },
        });
        for (const employee of employes) {
          const updateEmploye = await prisma.employee.update({
            where: { id: employee.id },
            data: {
              magazines: {
                connect: { id: updateMagazine.id },
              },
            },
          });
        }
        return res
          .status(200)
          .json({ message: "Revista atualizada com sucesso!" });
      });
    } catch (error) {
      console.log(error);
      return this.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }

  async deleteEmployeeMagazine(req: Request, res: Response) {
    const { slug, id } = req.body;
    if (!slug) {
      return res
        .status(403)
        .json({ message: "Não foi possível encontrar a categoria!" });
    }
    try {
      const deletEmployeeMagazine = await prisma?.magazines.update({
        where: {
          id: Number(slug),
        },
        data: {
          employees: {
            disconnect: {
              id: Number(id),
            },
          },
        },
      });
      return res
        .status(200)
        .json({ message: "Colaborador removido  com sucesso!" });
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async deleteMagazine(req: Request, res: Response) {
    const { id } = req.body;
    if (!id) {
      return res
        .status(403)
        .json({ message: "Não foi possível encontrar a categoria!" });
    }
    try {
      const deletMagazine = await prisma?.magazines.delete({
        where: {
          id: Number(id),
        },
        include: {
          article: true,
          employees: true,
          Category: true,
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
export const AdminMagazineController = new AdminMagazine();
export const MagazineController = new Magazine();
