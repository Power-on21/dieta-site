import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dietRouter from "./diet";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dietRouter);

export default router;
