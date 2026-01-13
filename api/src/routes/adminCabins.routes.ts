import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth";
import {
  adminListCabins,
  adminCreateCabin,
  adminUpdateCabin,
  adminSetCabinActive
} from "../controllers/adminCabins.controller";

const router = Router();

router.get("/admin/cabins", adminAuth, adminListCabins);
router.post("/admin/cabins", adminAuth, adminCreateCabin);
router.put("/admin/cabins/:id", adminAuth, adminUpdateCabin);
router.patch("/admin/cabins/:id/active", adminAuth, adminSetCabinActive);

export default router;
