import { Response, Request } from "express";
import prisma from "../../server/prisma";
import { bucket } from "../../utils/multerConfig";
class Employee {
  //Funçao para tratar dos erros no servidor
  private handleError(error: any, res: Response) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  //Função para desconetar o orm prisma
  private async handleDisconnect() {
    return await prisma?.$disconnect();
  }
  async getAllEmployees(req: Request, res: Response) {
    const { name,email, page, take, profession } = req.query;
 
    try {
    
        const totalTake = Number(take) || 8; 
      const currentPage = Number(page) || 1; 
      const skip = (currentPage - 1) * totalTake;
        const employees = await prisma?.employee.findMany({
         take:totalTake,
         skip:skip  ,
          where: {
            
            name: {
              contains: (name as string) || "",
              mode: "insensitive",
            },
            email: {
              contains: (email as string) || "",
              mode: "insensitive",
            },
           profession:{
            contains: (profession as string) || "",
              mode: "insensitive",
           }
          },
          select:{
            id:true,
            avatar:true,
            name:true,
            email:true,
            phone:true,
            commission:true,
            profession:true,
            magazines:true

          }
          
        });
  
        const listCount = await prisma?.employee.count({
          where: {
            name: {
              contains: (name as string) || "",
              mode: "insensitive",
            },
            email: {
              contains: (email as string) || "",
              mode: "insensitive",
            },
           profession:{
            contains: (profession as string) || "",
              mode: "insensitive",
           }
          },
        });
        const finalPage = Math.ceil(Number(listCount) / totalTake);
   
        return res.status(200).json({ employee:employees, total:finalPage });
      
     
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getLastEmployees(req: Request, res: Response) {
    
    try {
      const getAllEmployee = await prisma?.employee.findMany({
        take: 5,
        orderBy: {
          createDate: "asc",
        },
      });
      return res.status(200).json(getAllEmployee);
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async getOneEmployee(req: Request, res: Response) {
     const {slug} = req.params
try {
  const employeeWithDvls = await prisma?.employee.findUnique({
    where: {
      id: Number(slug),
    },
    include:{
      dvl_employee:{
        distinct:["name"]
      },
      magazines:true,
    }
   
    
  });
  return res
      .status(200)
      .json(employeeWithDvls);
} catch (error) {
  return this?.handleError(error, res);
} finally {
  return this?.handleDisconnect();
}
    
    
  }
  async createEmployee(req: Request, res: Response, next: any) {
    const { name, email, password, profession, phone,commission } = req.body;
    const file = req.file as any;
  
   const cover = file.linkUrl.split('plash_bucket/')
   const read = await  bucket.file(cover[1]);
   const expires = new Date();
   expires.setFullYear(expires.getFullYear() + 2);
   const [url] = await read.getSignedUrl({
    action: 'read',
    expires:expires
    
});


    
    const chekingEmail = await prisma?.employee.findUnique({
      where: {
        email: email,
      },
    });
    if (chekingEmail) {
      return res.status(400).json({ message: "E-mail já cadastrado!" });
    }
    try {
      const create = await prisma?.employee.create({
        data: {
          name,
          email,
          profession,
          phone,
          password,
          avatar: url,
          commission:Number(commission)
        },
      });
      return res
        .status(200)
        .json({ message: "Colaborador criado com sucesso!" });
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
    
 
  }
  async editEmployee(req: Request, res: Response) {
    const { slug } = req.params;
    const { name, email, profession, phone,avatar} = req.body;
    const newProfile = req?.file as any;
    let newAvatar = avatar

    try {
      if (req.file) {
       
        
        //@ts-ignore
       
          //@ts-ignore
          const newC = newProfile.linkUrl.split("plash_bucket/");
          const read = await bucket.file(newC[1]);
          const expires = new Date();
          expires.setFullYear(expires.getFullYear() + 2);
          const [url] = await read.getSignedUrl({
            action: "read",
            expires: expires,
          });
          newAvatar = url;
        
        const update = await prisma?.employee.update({
          where: {
            id: Number(slug),
          },
          data: {
            name,
            email,
            profession,
            phone,
            avatar: newAvatar,
          },
        });
        return res
          .status(200)
          .json({ message: "Colaborador editado com sucesso!" });
      }else{
        const update = await prisma?.employee.update({
          where: {
            id: Number(slug),
          },
          data: {
            name,
            email,
            profession,
            phone,
            avatar: avatar,
          },
        });
        return res
          .status(200)
          .json({ message: "Colaborador editado com sucesso!" });
      }
     
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
 
  }
  async getEmployeeDvl(req: Request, res: Response) {
    const { slug } = req.params;
    
  

    try {
    
        const dvlEmployee = await prisma?.dvls_Employee.findUnique({
          where: {
            id: Number(slug),
          },
          include:{
            employee:true
          }
         
        });
         console.log(dvlEmployee)
        return res
          .status(200)
          .json(dvlEmployee);
     
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
 
  }
  async updateEmployeeCommissiom(req: Request, res: Response) {
    const { slug } = req.params;
    const {pay} = req.body
 
  
    try {
    
        const dvlEmployee = await prisma?.dvls_Employee.update({
           where:{
            id:Number(slug)
           },
           data: {
            toReceive: {
              increment: Number(pay),
            },
            paidOut: {
              decrement:  Number(pay),
            },
          },
         
         
        });
       
         
        return res
          .status(200)
          .json({message:"Comissão paga com sucesso"});
          
     
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
      
      
    
      
 
  }
  async deletEmployee(req: Request, res: Response) {
    const { id } = req.body;
    console.log(id)
    if (!id) {
      return res.status(404).json({ message: "Colaborador não encontrado!" });
    }
    try {
      const deletEmployee = await prisma?.employee.delete({
        where: {
          id: Number(id),
        },
      });
      return res
        .status(200)
        .json({ message: "Colaborador deletado com sucesso" });
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  async deletDvls(req: Request, res: Response) {
  
    try {
      const deletEmployee = await prisma?.dvls_Employee.deleteMany({
       
      });
      return res
        .status(200)
        .json({ message: "Colaborador deletado com sucesso" });
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
}
const AdminEmployeeController = new Employee();
export default AdminEmployeeController;
