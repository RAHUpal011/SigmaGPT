import fs from "fs";
import cloudinary from "../config/cloudinary.js";



// ===========================================
// Upload Multiple Files
// POST /api/upload
// ===========================================

export const uploadFiles = async (req, res) => {

    try {

        if (!req.files || req.files.length === 0) {

            return res.status(400).json({

                success: false,

                message: "No files uploaded"

            });

        }

        const uploadedFiles = [];

        for (const file of req.files) {

            const result = await cloudinary.uploader.upload(

                file.path,

                {

                    resource_type: "auto",

                    folder: "SigmaGPT"

                }

            );

            uploadedFiles.push({

                originalName: file.originalname,
                fileName: file.filename,
                mimeType: file.mimetype,
                size: file.size,
                url: result.secure_url,
                public_id: result.public_id
            });
            fs.unlinkSync(file.path);
        }
        res.status(200).json({
            success: true,
            files: uploadedFiles
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// ===========================================
// Upload Single File
// POST /api/upload/single
// ===========================================

export const uploadSingleFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }
        const result = await cloudinary.uploader.upload(
            req.file.path,
            {
                resource_type: "auto",
                folder: "SigmaGPT"
            }
        )
        fs.unlinkSync(req.file.path);
        res.status(200).json({
            success: true,
            file: {
                originalName: req.file.originalname,
                fileName: req.file.filename,
                mimeType: req.file.mimetype,
                size: req.file.size,
                url: result.secure_url,
                public_id: result.public_id
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// ===========================================
// Delete File
// POST /api/upload/delete
// ===========================================

export const deleteFile = async (req, res) => {

    try {

        const { public_id } = req.body;

        if (!public_id) {

            return res.status(400).json({

                success: false,

                message: "public_id is required"

            });

        }

        await cloudinary.uploader.destroy(

            public_id,

            {

                resource_type: "image"

            }

        );

        res.status(200).json({

            success: true,

            message: "File deleted"

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};



// ===========================================
// Get Uploaded Files
// ===========================================

export const getUploadedFiles = async (req, res) => {

    try {

        const result = await cloudinary.search

            .expression("folder:SigmaGPT")

            .sort_by("created_at", "desc")

            .max_results(100)

            .execute();

        res.status(200).json({

            success: true,

            files: result.resources

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};