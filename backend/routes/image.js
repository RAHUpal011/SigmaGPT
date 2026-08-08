import express from "express";

import {
    generateImage,
    editImage,
    imageVariation
} from "../controllers/imageController.js";

const router = express.Router();

router.post("/generate", generateImage);

router.post("/edit", editImage);

router.post("/variation", imageVariation);

export default router;