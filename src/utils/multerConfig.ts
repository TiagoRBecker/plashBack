
import Multer, { memoryStorage } from "multer";

const { Storage } = require("@google-cloud/storage");


import MulterGoogleCloudStorage from "multer-cloud-storage";

export const storage = new Storage({
  //Troque para o seu arquivo de credenciais google
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    //@ts-ignore
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
  }
});
export const bucket = storage.bucket(process.env.BUCKET);

export const GCLOUD = Multer({
  storage: new MulterGoogleCloudStorage({
    bucket: process.env.BUCKET,
    projectId: "lithe-lens-423414-q6",
    credentials: {
      //@ts-ignore
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    } 
  }),
});

