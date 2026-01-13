import { Router } from "express";
import { listCabins, getCabinById } from "../controllers/publicCabins.controller";

const router = Router();

router.get("/cabins", listCabins);
router.get("/cabins/:id", getCabinById);

export default router;
