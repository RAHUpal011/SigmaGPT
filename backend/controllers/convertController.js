import fs from "fs";
import path from "path";
import os from "os";
import { promisify } from "util";
import { execFile } from "child_process";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createRequire } from "module";
import { spawn } from "child_process";

const require = createRequire(import.meta.url);

import sharp from "sharp";
// import libre from "libreoffice-convert";
import { Document, Packer, Paragraph, TextRun } from "docx";


const execFileAsync = promisify(execFile);

/*
==================================================
CREATE UPLOAD DIRECTORY
==================================================
*/

const uploadDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}


const sofficePath =
    "C:\\Program Files\\LibreOffice\\program\\soffice.exe";




export const imageToJpg = async (req, res) => {
    let outputPath = null;
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded"
            });
        }
        const inputPath = path.resolve(req.file.path);
        const outputName =`${Date.now()}.jpg`;

        outputPath = path.join(uploadDir,outputName);

        await sharp(inputPath)
            .jpeg({
                quality: 100
            })
            .toFile(outputPath);
        if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }
        return res.download(
            outputPath,
            outputName,
            (err) => {
                if (
                    !err &&
                    fs.existsSync(outputPath)
                ) {
                    fs.unlinkSync(outputPath);
                }
            }
        );
    } catch (err) {
        console.error("IMAGE TO JPG ERROR:",err);
        if (
            outputPath &&
            fs.existsSync(outputPath)
        ) {
            fs.unlinkSync(outputPath);
        }
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};




export const wordToPdf = async (req, res) => {

    let tempDir = null;
    let finalPath = null;

    try {

        console.log("========== WORD TO PDF ==========");

        console.log(
            "Word file:",
            req.file
        );

        // 1. Check file

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "No Word file uploaded"
            });

        }

        // 2. Check LibreOffice

        if (!fs.existsSync(sofficePath)) {

            return res.status(500).json({

                success: false,

                message:
                    `LibreOffice not found at ${sofficePath}`

            });

        }

        // 3. Check extension

        const extension =
            path.extname(
                req.file.originalname
            ).toLowerCase();

        if (
            extension !== ".docx" &&
            extension !== ".doc"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Only .doc and .docx files are supported"

            });

        }

        // 4. Create temporary directory

        tempDir = fs.mkdtempSync(

            path.join(
                os.tmpdir(),
                "sigmagpt-"
            )

        );

        // 5. Give file correct extension

        const inputPath =
            path.join(
                tempDir,
                `input${extension}`
            );

        fs.copyFileSync(
            req.file.path,
            inputPath
        );

        // 6. Output directory

        const outputDir =
            path.join(
                tempDir,
                "output"
            );

        fs.mkdirSync(
            outputDir,
            {
                recursive: true
            }
        );

        console.log(
            "Input:",
            inputPath
        );

        console.log(
            "Output:",
            outputDir
        );

        // 7. Run LibreOffice

        const result =
            await execFileAsync(

                sofficePath,

                [
                    "--headless",
                    "--convert-to",
                    "pdf",
                    "--outdir",
                    outputDir,
                    inputPath
                ],

                {
                    windowsHide: true
                }

            );

        console.log(
            "LibreOffice stdout:",
            result.stdout
        );

        console.log(
            "LibreOffice stderr:",
            result.stderr
        );

        // 8. Find generated PDF

        const pdfPath =
            path.join(
                outputDir,
                "input.pdf"
            );

        if (!fs.existsSync(pdfPath)) {

            throw new Error(
                "LibreOffice did not generate the PDF."
            );

        }

        // 9. Create final file

        const outputName =
            `converted-${Date.now()}.pdf`;

        finalPath =
            path.join(
                uploadDir,
                outputName
            );

        fs.copyFileSync(
            pdfPath,
            finalPath
        );

        // 10. Delete uploaded Word file

        if (
            fs.existsSync(req.file.path)
        ) {

            fs.unlinkSync(
                req.file.path
            );

        }

        // 11. Send PDF

        return res.download(

            finalPath,

            outputName,

            (err) => {

                if (err) {

                    console.error(
                        "DOWNLOAD ERROR:",
                        err
                    );

                }

                if (
                    finalPath &&
                    fs.existsSync(finalPath)
                ) {

                    fs.unlinkSync(
                        finalPath
                    );

                }

            }

        );

    } catch (err) {

        console.error(
            "WORD TO PDF ERROR:",
            err
        );

        if (
            req.file?.path &&
            fs.existsSync(req.file.path)
        ) {

            try {
                fs.unlinkSync(req.file.path);
            } catch {}

        }

        return res.status(500).json({

            success: false,

            message:
                "Word to PDF conversion failed",

            error:
                err.message

        });

    } finally {

        if (
            tempDir &&
            fs.existsSync(tempDir)
        ) {

            try {

                fs.rmSync(
                    tempDir,
                    {
                        recursive: true,
                        force: true
                    }
                );

            } catch {}

        }

    }
};
/*
==================================================
PDF -> WORD
==================================================
*/
export const pdfToWord = async (req, res) => {

    let outputPath = null;

    try {

        console.log("========== PDF TO WORD ==========");

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No PDF uploaded"
            });
        }

        const extension =
            path.extname(req.file.originalname).toLowerCase();

        if (extension !== ".pdf") {

            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(400).json({
                success: false,
                message: "Only PDF files are allowed"
            });
        }

        const outputName =
            `converted-${Date.now()}.docx`;

        outputPath =
            path.join(uploadDir, outputName);

        const pythonScript =
            path.join(
                process.cwd(),
                "python",
                "pdf_to_word.py"
            );

        console.log("PDF:", req.file.path);

        console.log("DOCX:", outputPath);

        const python =
            spawn("py", ["-3",
                pythonScript,
                req.file.path,
                outputPath
            ]);

        let stdout = "";
        let stderr = "";

        python.stdout.on("data", (data) => {

            stdout += data.toString();

            console.log(
                "Python:",
                data.toString()
            );

        });

        python.stderr.on("data", (data) => {

            stderr += data.toString();

            console.error(
                "Python Error:",
                data.toString()
            );

        });

        python.on("close", (code) => {

            console.log(
                "Python exited:",
                code
            );

            if (code !== 0) {

                if (
                    req.file?.path &&
                    fs.existsSync(req.file.path)
                ) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(500).json({
                    success: false,
                    message:
                        "PDF to Word conversion failed",
                    error: stderr
                });

            }

            if (!fs.existsSync(outputPath)) {

                return res.status(500).json({
                    success: false,
                    message:
                        "DOCX file was not created"
                });

            }

            // Delete uploaded PDF
            if (
                req.file?.path &&
                fs.existsSync(req.file.path)
            ) {

                fs.unlinkSync(req.file.path);

            }

            // Send DOCX
            return res.download(
                outputPath,
                outputName,
                (err) => {

                    if (err) {

                        console.error(
                            "Download error:",
                            err
                        );

                    }

                    if (
                        outputPath &&
                        fs.existsSync(outputPath)
                    ) {

                        fs.unlinkSync(
                            outputPath
                        );

                    }

                }
            );

        });

    } catch (error) {

        console.error(
            "PDF TO WORD ERROR:",
            error
        );

        if (
            req.file?.path &&
            fs.existsSync(req.file.path)
        ) {

            try {
                fs.unlinkSync(req.file.path);
            } catch {}

        }

        if (
            outputPath &&
            fs.existsSync(outputPath)
        ) {

            try {
                fs.unlinkSync(outputPath);
            } catch {}

        }

        return res.status(500).json({

            success: false,

            message:
                "PDF to Word conversion failed",

            error:
                error.message

        });

    }

};