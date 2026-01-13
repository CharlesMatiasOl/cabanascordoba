import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth";
import {
  adminListBlocksForCabin,
  adminCreateBlockForCabin,
  adminDeleteBlock
} from "../controllers/adminBlocks.controller";

const router = Router();

router.get("/admin/cabins/:id/blocks", adminAuth, adminListBlocksForCabin);
router.post("/admin/cabins/:id/blocks", adminAuth, adminCreateBlockForCabin);
router.delete("/admin/blocks/:blockId", adminAuth, adminDeleteBlock);

export default router;
