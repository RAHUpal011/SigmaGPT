import express from "express";
import multer from "multer";

import {
    imageToJpg,
    wordToPdf,
    pdfToWord
} from "../controllers/convertController.js";

const router = express.Router();

const upload = multer({
    dest: "uploads/"
});


router.post(
    "/image-to-jpg",
    upload.single("file"),
    imageToJpg
);


router.post(
    "/word-to-pdf",
    upload.single("file"),
    wordToPdf
);


router.post(
    "/pdf-to-word",
    upload.single("file"),
    pdfToWord
);


export default router;