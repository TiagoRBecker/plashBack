import { Response, Request } from "express";
import prisma from "../../server/prisma";
import { bucket } from "../../utils/multerConfig";

class Sponsor {
  //Funçao para tratar dos erros no servidor
  private handleError(error: any, res: Response) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  //Função para desconetar o orm prisma
  private async handleDisconnect() {
    return await prisma?.$disconnect();
  }
  async getAllSponsorsPublic(req: Request, res: Response) {
    try {
      const sponsors = await prisma?.sponsors.findMany({
        select: {
          company: true,
          url: true,
          cover: true,
        },
      });
      return res.status(200).json(sponsors);
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  //Retorna todas as categorias
  async getAllSponsors(req: Request, res: Response) {
    const { name, email, page, take, company, phone } = req.query;
    try {
      const totalTake = Number(take) || 8;
      const currentPage = Number(page) || 1;
      const skip = (currentPage - 1) * totalTake;
      const sponsors = await prisma?.sponsors.findMany({
        take: totalTake,
        skip,
        where: {
          name: {
            contains: (name as string) || "",
            mode: "insensitive",
          },
          email: {
            contains: (email as string) || "",
            mode: "insensitive",
          },
          company: {
            contains: (company as string) || "",
            mode: "insensitive",
          },
          phone: {
            contains: (phone as string) || "",
            mode: "insensitive",
          },
        },
      });

      const listCount = await prisma?.sponsors.count({
        where: {
          name: {
            contains: (name as string) || "",
            mode: "insensitive",
          },
          email: {
            contains: (email as string) || "",
            mode: "insensitive",
          },
          company: {
            contains: (company as string) || "",
            mode: "insensitive",
          },
          phone: {
            contains: (phone as string) || "",
            mode: "insensitive",
          },
        },
      });
      const finalPage = Math.ceil(Number(listCount) / totalTake);

      return res.status(200).json({ sponsors: sponsors, total: finalPage });
    
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getOneSponsor(req: Request, res: Response) {
    const { slug } = req.params;
    try {
      const sponsor = await prisma?.sponsors.findUnique({
        where: { id: Number(slug) },
      });
      return res.status(200).json(sponsor);
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  //Retorna uma categoria especifica

  //Admin Routes
  async createSponsor(req: Request, res: Response) {
    const { name, url, email, phone, company } = req.body;

    const cover = req.file as any;
    const newC = cover.linkUrl.split("plash_bucket/");
    const read = await bucket.file(newC[1]);
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 2);
    const [link] = await read.getSignedUrl({
      action: "read",
      expires: expires,
    });

    try {
      const checkingSponsors = await prisma?.sponsors.findUnique({
        where: {
          email: email,
        },
      });
      if (checkingSponsors) {
        return res
          .status(409)
          .json({ message: "Patrocinador já cadastrado no sistema!" });
      }
      const crateSponsor = await prisma?.sponsors.create({
        data: {
          name,
          url,
          email,
          phone,
          company,
          cover: link,
        },
      });
      return res
        .status(200)
        .json({ message: "Patrocinador  criado com sucesso!" });
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async updateSponsor(req: Request, res: Response) {
    const { slug } = req.params;
    const { name, url, cover, email, phone, company } = req.body;

    try {
      let newCover = cover;
      //@ts-ignore
      if (req?.file) {
        //@ts-ignore
        const newC = req.file?.linkUrl.split("plash_bucket/");
        const read = await bucket.file(newC[1]);
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 2);
        const [link] = await read.getSignedUrl({
          action: "read",
          expires: expires,
        });
        newCover = link;
        const update = await prisma?.sponsors.update({
          where: {
            id: Number(slug),
          },
          data: {
            name,
            url,
            email,
            company,
            phone,
            cover: newCover,
          },
        });
        return res
          .status(200)
          .json({ message: "Patrocinador  editado com sucesso!" });
      } else {
        const update = await prisma?.sponsors.update({
          where: {
            id: Number(slug),
          },
          data: {
            name,
            url,
            cover: newCover,
          },
        });
        return res
          .status(200)
          .json({ message: "Patrocinador  editado com sucesso!" });
      }
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async deleteSponsor(req: Request, res: Response) {
    const { slug } = req.params;

    if (!slug) {
      return res
        .status(403)
        .json({ message: "Não foi possível encontrar o patrocinador!" });
    }
    try {
      const deletMagazine = await prisma?.sponsors.delete({
        where: {
          id: Number(slug),
        },
      });
      return res
        .status(200)
        .json({ message: "Patrocinador deletado com sucesso!" });
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async del(req: Request, res: Response) {
   

    
    try {
      const deletMagazine = await prisma?.dvls.deleteMany({
       
      });
      const deledvlEmploye = await prisma?.dvls_Employee.deleteMany({
       
      });
      return res
        .status(200)
        .json({ message: "Patrocinador deletado com sucesso!" });
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
}

const SponsorsController = new Sponsor();
export default SponsorsController;
