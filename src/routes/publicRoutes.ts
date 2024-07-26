// routes/userRoutes.js
import { Router } from "express";
import { MagazineController } from "../Controllers/Magazine";
import { ArticleController } from "../Controllers/Article";
import CoversController from "../Controllers/CoversOfMonth";
import { CategoriesController } from "../Controllers/Categories";
import BannerController from "../Controllers/Banner";
import { EventController } from "../Controllers/Events";
import SponsorsController from "../Controllers/Sponsors";
const { Storage } = require("@google-cloud/storage");
import teste from "../utils/cloud.json";
const path = require("path");
const router = Router();

// Public routes
router.get("/most-Views-magazine", MagazineController.getMostViews);
router.get("/magazine/:slug", MagazineController.getOneMagazine);
router.get("/last-magazines", MagazineController.getLastMagazines);
router.get("/categories", CategoriesController.getAllCategories);
router.get("/category/:slug", CategoriesController.getOneCategory);
router.get("/articles-most-read", ArticleController.getArticleMostRead);
router.get("/articles-recommended", ArticleController.getArticleRecommended);
router.get("/articles/:slug", ArticleController.getOneArticle);
router.get("/articles-most-views", ArticleController.getArticleMostViews);
router.get("/articles-trend", ArticleController.getArticleTrend);
router.get("/articles-free", ArticleController.getArticleFree);
router.get("/banners", BannerController.getAllBanners);
router.get("/events", EventController.getAllEvents);
router.get("/event/:slug", EventController.getEventID);
router.get("/cover-events", CoversController.getAllCoverEvents);
router.get("/sponsors", SponsorsController.getAllSponsorsPublic);
router.delete("/dvl", SponsorsController.del);
router.post("/bucket", async (req: any, res: any) => {
  // Caminho para o arquivo de credenciais
  const keyFilenamePath = path.resolve(__dirname, "../utils/cloud.json");

  // Inicializando o cliente de armazenamento
  const storage = new Storage({ keyFilename: keyFilenamePath });

  async function createPublicBucket() {
    try {
      // Nome do bucket público
      const bucketName = "plash_bucket";
      const corsConfiguration = [
        {
          origin: ["http://77.37.69.19:3000", "http://localhost:3000"],
          method: ["GET", "HEAD", "POST"],
          responseHeader: ["Content-Type"],
          maxAgeSeconds: 3600,
        },
      ];
      // Criando o bucket público
      await storage.bucket(bucketName).setCorsConfiguration(corsConfiguration);
      console.log(`CORS configuration set for bucket ${bucketName}`);

      return res.status(200).json({ message: "Criado com sucesso" });
    } catch (err) {
      console.error("ERROR:", err);
    }
  }

  createPublicBucket();
});
export default router;
