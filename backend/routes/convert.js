import express from "express";
import upload from "../middleware/upload.js";

import {
    imageToJpg,
    wordToPdf,
    pdfToWord
} from "../controllers/convertController.js";

const router = express.Router();

router.post(
    "/image-to-jpg",
    upload.single("image"),
    imageToJpg
);

router.post(
    "/word-to-pdf",
    upload.single("word"),
    wordToPdf
);

router.post(
    "/pdf-to-word",
    upload.single("pdf"),
    pdfToWord
);

export default router;