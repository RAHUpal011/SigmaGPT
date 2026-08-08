import multer from "multer";
import fs from "fs";
import path from "path";


const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// ========================================
// Storage Configuration
// ========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});


const allowedTypes = [

    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",

    // PDF
    "application/pdf",

    // Word
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Excel
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    // PowerPoint
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // Text
    "text/plain",

    // ZIP
    "application/zip",
    "application/x-zip-compressed"

];

// ========================================
// File Filter
// ========================================

const fileFilter = (req, file, cb) => {

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(new Error("Unsupported file type"), false);

    }

};

// ========================================
// Multer Upload
// ========================================

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 50 * 1024 * 1024 // 50MB

    }

});

export default upload;