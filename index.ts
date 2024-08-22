import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import searchRouter from "./routes/search";
import { PORT } from "./config";
const app: Express = express();
app.use(express.json());
app.use(
  cors({
    origin: "*", //Perhaps we can use the frontend URL for the origin, but just going to use wildcard for now
  })
);
app.use(helmet());
app.use("/search", searchRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
