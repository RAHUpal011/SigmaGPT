import fs from "fs";
import path from "path";
import sharp from "sharp";
import libre from "libreoffice-convert";
import { PDFDocument } from "pdf-lib";
import { Document, Packer, Paragraph } from "docx";
import { promisify } from "util";

// Promise Wrapper
libre.convertAsync =
    libre.convertAsync ||
    ((input, ext, filter) => {
        return new Promise((resolve, reject) => {
            libre.convert(input, ext, filter, (err, done) => {
                if (err) reject(err);
                else resolve(done);
            });
        });
    });

/* ==========================================
   IMAGE -> JPG
========================================== */

export const imageToJpg = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded",
            });
        }

        const inputPath = req.file.path;
        const outputName = `${Date.now()}.jpg`;
        const outputPath = path.join("uploads", outputName);
        await sharp(inputPath)
            .jpeg({
                quality: 100,
            })
            .toFile(outputPath);

        fs.unlinkSync(inputPath);

        return res.download(outputPath, outputName, (err) => {
            if (!err && fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

/* ==========================================
   WORD -> PDF
========================================== */

export const wordToPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No Word file uploaded",
            });
        }

        const wordBuffer = fs.readFileSync(req.file.path);

        const pdfBuffer = await libre.convertAsync(
            wordBuffer,
            ".pdf",
            undefined
        );

        const pdfName = `${Date.now()}.pdf`;
        const pdfPath = path.join("uploads", pdfName);
        fs.writeFileSync(pdfPath, pdfBuffer);
        fs.unlinkSync(req.file.path);
        return res.download(pdfPath, pdfName, (err) => {
            if (!err && fs.existsSync(pdfPath)) {
                fs.unlinkSync(pdfPath);
            }
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

/* ==========================================
   PDF -> WORD (Demo Only)
========================================== */

// export const pdfToWord = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No PDF uploaded",
//             });
//         }
//         const pdfBytes = fs.readFileSync(req.file.path);
//         await PDFDocument.load(pdfBytes);
//         const doc = new Document({
//             sections: [
//                 {
//                     children: [
//                         new Paragraph(
//                             "PDF loaded successfully.\n\nReal PDF to Word conversion requires LibreOffice or another dedicated converter."
//                         ),
//                     ],
//                 },
//             ],
//         });

//         const buffer = await Packer.toBuffer(doc);
//         const docName = `${Date.now()}.docx`;
//         const docPath = path.join("uploads", docName);
//         fs.writeFileSync(docPath, buffer);
//         fs.unlinkSync(req.file.path);
//         return res.download(docPath, docName, (err) => {
//             if (!err && fs.existsSync(docPath)) {
//                 fs.unlinkSync(docPath);
//             }
//         });
//     } catch (err) {
//         console.log(err);

//         res.status(500).json({
//             success: false,
//             message: err.message,
//         });
//     }
// };

export const pdfToWord = async (req,res)=>{

    try{

        const input =
            fs.readFileSync(req.file.path);

        const docx =
            await convert(
                input,
                ".docx",
                undefined
            );

        const output =
            path.join(
                "converted",
                Date.now()+".docx"
            );

        fs.writeFileSync(
            output,
            docx
        );

        fs.unlinkSync(req.file.path);

        res.download(output);

    }

    catch(err){

        console.log(err);

        res.status(500).json({
            success:false,
            message:err.message
        });

    }

}