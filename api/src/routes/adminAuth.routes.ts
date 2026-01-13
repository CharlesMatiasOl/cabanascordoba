import { Router } from "express";
import { adminLogin, adminLogout, adminMe } from "../controllers/adminAuth.controller";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

router.post("/admin/login", adminLogin);
router.post("/admin/logout", adminLogout);
router.get("/admin/me", adminAuth, adminMe);

export default router;
