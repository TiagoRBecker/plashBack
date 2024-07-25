import { Response, Request } from "express";
import prisma from "../../server/prisma";

class Orders {
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
  async chartJsOrders(req: Request, res: Response) {
    try {
      const orders = await prisma?.orders.findMany({});

      return res.status(200).json(orders);
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getAllOrders(req: Request, res: Response) {
    const { name, email, page, city, take, status, id, date } = req.query;
    console.log(status);
    try {
      const totalTake = Number(take) || 8;
      const currentPage = Number(page) || 1;
      const skip = (currentPage - 1) * totalTake;
      const enumStatus = ["andamento", "enviado", "entregue"];
      const where = {
        ...(name && {
          name: { contains: name as string, mode: "insensitive" },
        }),
        ...(email && {
          email: { contains: email as string, mode: "insensitive" },
        }),
        ...(city && {
          city: { contains: city as string, mode: "insensitive" },
        }),
        ...(id && { id: Number(id) }),
        ...(date &&
          !isNaN(Date.parse(date as any)) && {
            createDate: { gte: new Date(date as any) },
          }),
        ...(status &&
          enumStatus.includes(status as string) && {
            status: status as any,
          }),
      };

      const orders = await prisma?.orders.findMany({
        take: totalTake,
        skip: skip,
        where: Object.keys(where).length ? (where as any) : undefined,
      });

      const listCount = await prisma?.orders.count();
      const finalPage = Math.ceil(Number(listCount) / totalTake);

      return res.status(200).json({ orders: orders, total: finalPage });
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getLastOrders(req: Request, res: Response) {
    try {
      const orders = await prisma?.orders.findMany({
        take: 5,
        orderBy: {
          createDate: "desc", // Ordena pela data de criação em ordem decrescente
        },
        where: {
          status: "andamento",
        },
        include: {
          user: {
            select: {
              name: true,
              lastName: true,
              email: true,
              adress: true,
              city: true,
              district: true,
              cep: true,
              complement: true,
            },
          },
        },
      });
     

      return res.status(200).json(orders);
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  //Retorna uma categoria especifica
  async getOneOrder(req: Request, res: Response) {
    const { slug } = req.params;

    try {
      const getOrder = await prisma?.orders.findUnique({
        where: { id: Number(slug) },

        include: {
          user: {
            select: {
              name: true,
              lastName: true,
            },
          },
        },
      });

      return res.status(200).json(getOrder);
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }

  //Atualiza uma categoria especifica
  async updateOrder(req: Request, res: Response) {
    const { data } = req.body;
    const { slug } = req.params;

    if (!slug) {
      return res
        .status(404)
        .json({ message: "Não foi possivel localizar a ordem de serviço!" });
    }
    try {
      const updateOrder = await prisma?.orders.update({
        where: {
          id: Number(slug),
        },
        data: {
          codeEnv: data.codEnv,
          status: data.status,
        },
      });
      return res
        .status(200)
        .json({ message: "Ordem de serviço atualizada com sucesso!" });
    } catch (error) {
      return this.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  //Delete uma categoria especifica
  async deletOrder(req: Request, res: Response) {
    try {
      const deletOrder = await prisma?.orders.deleteMany({});
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

const OrdersController = new Orders();
export default OrdersController;
