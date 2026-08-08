import express from "express";

import upload from "../middleware/upload.js";

import {
    uploadFiles,
    uploadSingleFile,
    deleteFile,
    getUploadedFiles
} from "../controllers/uploadController.js";

const router = express.Router();

router.post(
    "/",
    upload.array("files"),
    uploadFiles
);

router.post(
    "/single",
    upload.single("file"),
    uploadSingleFile
);

router.post(
    "/delete",
    deleteFile
);

router.get(
    "/all",
    getUploadedFiles
);

export default router;