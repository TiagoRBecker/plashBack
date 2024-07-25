import { Response, Request } from "express";
import prisma from "../../server/prisma";
import { bucket } from "../../utils/multerConfig";
class Events {
  private handleError(error: any, res: Response) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  //Função para desconetar o orm prisma
  private async handleDisconnect() {
    return await prisma?.$disconnect();
  }
  async getAllEvents(req: Request, res: Response) {
    const covers = await prisma?.eventsofMonth.findMany({
      include: {
        sponsors: {
          select: {
            id: true,

            url: true,
            cover: true,
          },
        },
      },
    });

    return res.status(200).json(covers);
  }

  async getEventID(req: Request, res: Response) {
    const { slug } = req.params;

    const eventId = await prisma?.eventsofMonth.findUnique({
      where: {
        id: Number(slug),
      },
      include: {
        sponsors: true,
      },
    });

    return res.status(200).json(eventId);
  }
}
class AdminEvents {
  private handleError(error: any, res: Response) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  //Função para desconetar o orm prisma
  private async handleDisconnect() {
    return await prisma?.$disconnect();
  }
  async getAllEvents(req: Request, res: Response) {
    const { event, name, email, page, take } = req.query;
    try {
      const totalTake = Number(take) || 8;
      const currentPage = Number(page) || 1;
      const skip = (currentPage - 1) * totalTake;
      const events = await prisma?.eventsofMonth.findMany({
        take: totalTake,
        skip,
        where: {
          name: {
            contains: (event as string) || "",
            mode: "insensitive",
          },
          email: {
            contains: (email as string) || "",
            mode: "insensitive",
          },
          organizer: {
            contains: (name as string) || "",
            mode: "insensitive",
          },
        },
        include: {
          sponsors: {
            select: {
              id: true,

              url: true,
              cover: true,
            },
          },
        },
      });
      const listCount: any = await prisma?.eventsofMonth.count();
      const finalPage = Math.ceil(listCount / totalTake);
      return res.status(200).json({ event: events, total: finalPage });
    } catch (error) {}
  }
  async getLastEvent(req: Request, res: Response) {
    try {
      const events = await prisma?.eventsofMonth.findMany({});

      return res.status(200).json(events);
    } catch (error: unknown) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async createEvent(req: Request, res: Response) {
    const {
      name,
      organizer,
      email,
      phone,
      date_event_initial,
      date_event_end,
      descript,
    } = req.body;

    const sponsor = JSON.parse(req.body.sponsors);
    const { banner, cover } = req.files as any;

    const coverEvent = cover[0].linkUrl.split("plash_bucket/");
    const read = await bucket.file(coverEvent[1]);
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 2);
    const [url] = await read.getSignedUrl({
      action: "read",
      expires: expires,
    });
    const bannerImage = banner[0].linkUrl.split("plash_bucket/");
    const bannerUrl = await bucket.file(bannerImage[1]);
    expires.setFullYear(expires.getFullYear() + 2);
    const [urlbanner] = await bannerUrl.getSignedUrl({
      action: "read",
      expires: expires,
    });

    try {
      await prisma?.$transaction(async (prisma) => {
        const ids = sponsor?.map((item: any) => parseInt(item.id));
        const getCovers = await prisma.sponsors.findMany({
          where: {
            id: {
              in: ids,
            },
          },
        });

        // Cria o evento
        const createEvent = await prisma.eventsofMonth.create({
          data: {
            name,
            descript,
            email,
            phone,
            banner: urlbanner,
            date_event_end,
            date_event_initial,
            cover: url,
            organizer: organizer,
            sponsors: {
              connect: getCovers.map((cover: any) => ({ id: cover.id })),
            },
          },
        });

        return res.status(200).json({ message: "Evento criado com sucesso" });
      });
    } catch (error) {
      return this.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async updateEvent(req: Request, res: Response) {
    const { slug } = req.params;
    const {
      name,
      organizer,
      date_event_initial,
      date_event_end,
      descript,
      cover,
      banner,
      email,
      phone,
    } = req.body;

    const sponsor = JSON.parse(req.body.sponsors);

    const { newCover, newBanner } = req.files as any;

    try {
      await prisma?.$transaction(async (prisma) => {
        const ids = sponsor?.map((item: any) => parseInt(item.id));
        const getCovers = await prisma.sponsors.findMany({
          where: {
            id: {
              in: ids,
            },
          },
        });

        // Cria o evento
        const createEvent = await prisma.eventsofMonth.update({
          where: {
            id: Number(slug),
          },
          data: {
            name,
            descript,
            banner: newBanner ? newBanner[0]?.linkUrl : banner[0],
            phone,
            email,
            cover: newCover ? newCover[0]?.linkUrl : cover,

            organizer: organizer,
            sponsors: {
              connect: getCovers.map((cover: any) => ({ id: cover.id })),
            },
          },
        });

        return res.status(200).json({ message: "Evento criado com sucesso" });
      });
    } catch (error) {
      console.log(error);
      return this.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }

  async deleteSponsorEvent(req: Request, res: Response) {
    const { eventID, id } = req.body;
    if (!eventID) {
      return res
        .status(403)
        .json({ message: "Não foi possível encontrar o evento!" });
    }
    try {
      const deletEmployeeMagazine = await prisma?.eventsofMonth.update({
        where: {
          id: Number(eventID),
        },
        data: {
          sponsors: {
            disconnect: {
              id: Number(id),
            },
          },
        },
      });
      return res
        .status(200)
        .json({ message: "Patrocinador removido  com sucesso!" });
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async deletEvent(req: Request, res: Response) {
    const { slug } = req.params;
    try {
      const createCover = await prisma?.eventsofMonth.delete({
        where: {
          id: Number(slug),
        },
      });

      return res.status(200).json({ message: "Evento Deletado com sucesso" });
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
}
export const EventController = new Events();
export const AdminEventController = new AdminEvents();
