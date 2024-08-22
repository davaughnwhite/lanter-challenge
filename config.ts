import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 8080;

export const VHS_SERVICE_URL =
  process.env.VHS_SERVICE_URL || "http://vhs.service.com/search";
export const DVD_SERVICE_URL =
  process.env.DVD_SERVICE_URL || "http://dvd.service.com/search";
export const PROJECTOR_SERVICE_URL =
  process.env.PROJECTOR_SERVICE_URL || "http://prjktr.service.com/search";
