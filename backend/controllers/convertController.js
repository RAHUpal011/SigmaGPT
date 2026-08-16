import fs from "fs";
import path from "path";
import os from "os";
import { promisify } from "util";
import { execFile } from "child_process";
import { spawn } from "child_process";

const execFileAsync = promisify(execFile);

// ==================================================
// UPLOAD DIRECTORY
// ==================================================

const uploadDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}

// ==================================================
// LIBREOFFICE PATH
// ==================================================

const sofficePath =
    process.env.LIBREOFFICE_PATH ||
    (
        process.platform === "win32"
            ? "C:\\Program Files\\LibreOffice\\program\\soffice.exe"
            : "soffice"
    );

// ==================================================
// HELPER: DELETE FILE SAFELY
// ==================================================

const deleteFile = (filePath) => {

    if (!filePath) {
        return;
    }

    try {

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

    } catch (error) {

        console.error(
            "FILE DELETE ERROR:",
            error.message
        );

    }
};

// ==================================================
// IMAGE -> JPG
// ==================================================


export const imageToJpg = async (req, res) => {

    let outputPath = null;

    try {

        console.log("========== IMAGE TO JPG ==========");

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "No image uploaded"
            });

        }

        console.log("Image:", req.file.path);

        /*
         * IMPORTANT:
         *
         * We intentionally don't use sharp here because
         * sharp is currently causing your Render server
         * to crash.
         *
         * If you want image conversion, we can add a
         * separate Linux-compatible image solution later.
         */

        return res.status(501).json({
            success: false,
            message:
                "Image to JPG conversion is temporarily unavailable on the deployed server."
        });

    } catch (error) {

        console.error(
            "IMAGE TO JPG ERROR:",
            error
        );

        deleteFile(req.file?.path);
        deleteFile(outputPath);

        return res.status(500).json({
            success: false,
            message: "Image conversion failed",
            error: error.message
        });

    }

};

// ==================================================
// WORD -> PDF
// ==================================================

export const wordToPdf = async (req, res) => {

    let tempDir = null;
    let finalPath = null;

    try {

        console.log("========== WORD TO PDF ==========");

        // ------------------------------------------
        // 1. Check uploaded file
        // ------------------------------------------

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "No Word file uploaded"
            });

        }

        console.log("Word file:", req.file);

        // ------------------------------------------
        // 2. Check extension
        // ------------------------------------------

        const extension =
            path
                .extname(req.file.originalname)
                .toLowerCase();

        if (
            extension !== ".docx" &&
            extension !== ".doc"
        ) {

            deleteFile(req.file.path);

            return res.status(400).json({
                success: false,
                message:
                    "Only .doc and .docx files are supported"
            });

        }

        // ------------------------------------------
        // 3. Check LibreOffice
        // ------------------------------------------

        console.log(
            "Checking LibreOffice:",
            sofficePath
        );

        try {

            const version =
                await execFileAsync(
                    sofficePath,
                    ["--version"]
                );

            console.log(
                "LibreOffice:",
                version.stdout
            );

        } catch (error) {

            console.error(
                "LibreOffice check failed:",
                error
            );

            deleteFile(req.file.path);

            return res.status(500).json({
                success: false,
                message:
                    "LibreOffice is not installed or not available on the server.",
                error:
                    error.message
            });

        }

        // ------------------------------------------
        // 4. Create temporary directory
        // ------------------------------------------

        tempDir =
            fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    "sigmagpt-"
                )
            );

        console.log(
            "Temp directory:",
            tempDir
        );

        // ------------------------------------------
        // 5. Create input file
        // ------------------------------------------

        const inputPath =
            path.join(
                tempDir,
                `input${extension}`
            );

        fs.copyFileSync(
            req.file.path,
            inputPath
        );

        // ------------------------------------------
        // 6. Create output directory
        // ------------------------------------------

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

        // ------------------------------------------
        // 7. Convert DOCX -> PDF
        // ------------------------------------------

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
                    timeout: 120000
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

        // ------------------------------------------
        // 8. Find generated PDF
        // ------------------------------------------

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

        // ------------------------------------------
        // 9. Create final output
        // ------------------------------------------

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

        console.log(
            "PDF created:",
            finalPath
        );

        // ------------------------------------------
        // 10. Delete uploaded Word file
        // ------------------------------------------

        deleteFile(req.file.path);

        // ------------------------------------------
        // 11. Send PDF
        // ------------------------------------------

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

                deleteFile(finalPath);

            }
        );

    } catch (error) {

        console.error(
            "WORD TO PDF ERROR:",
            error
        );

        deleteFile(req.file?.path);
        deleteFile(finalPath);

        return res.status(500).json({
            success: false,
            message:
                "Word to PDF conversion failed",
            error:
                error.message
        });

    } finally {

        // ------------------------------------------
        // Cleanup temp directory
        // ------------------------------------------

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

            } catch (error) {

                console.error(
                    "TEMP CLEANUP ERROR:",
                    error.message
                );

            }

        }

    }

};

// ==================================================
// PDF -> WORD
// ==================================================
//
// Uses:
// Python + pdf2docx
//
// This preserves PDF layout much better than
// extracting plain text and creating paragraphs.
//
// ==================================================

export const pdfToWord = async (req, res) => {

    let outputPath = null;

    try {

        console.log("========== PDF TO WORD ==========");

        // ------------------------------------------
        // 1. Check uploaded PDF
        // ------------------------------------------

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "No PDF uploaded"
            });

        }

        console.log(
            "PDF:",
            req.file.path
        );

        console.log(
            "Original name:",
            req.file.originalname
        );

        console.log(
            "Size:",
            req.file.size
        );

        // ------------------------------------------
        // 2. Check extension
        // ------------------------------------------

        const extension =
            path
                .extname(req.file.originalname)
                .toLowerCase();

        if (extension !== ".pdf") {

            deleteFile(req.file.path);

            return res.status(400).json({
                success: false,
                message:
                    "Only PDF files are allowed"
            });

        }

        // ------------------------------------------
        // 3. Make absolute PDF path
        // ------------------------------------------

        const pdfPath =
            path.resolve(
                req.file.path
            );

        // ------------------------------------------
        // 4. Generate output DOCX path
        // ------------------------------------------

        const outputName =
            `converted-${Date.now()}.docx`;

        outputPath =
            path.join(
                uploadDir,
                outputName
            );

        console.log(
            "PDF absolute path:",
            pdfPath
        );

        console.log(
            "DOCX:",
            outputPath
        );

        // ------------------------------------------
        // 5. Python script
        // ------------------------------------------

        const pythonScript =
            path.join(
                process.cwd(),
                "python",
                "pdf_to_word.py"
            );

        console.log(
            "Python script:",
            pythonScript
        );

        if (!fs.existsSync(pythonScript)) {

            throw new Error(
                `Python converter not found: ${pythonScript}`
            );

        }

        // ------------------------------------------
        // 6. Select Python command
        // ------------------------------------------

        let pythonCommand;

        if (process.platform === "win32") {

            // Windows
            pythonCommand = "py";

        } else {

            // Render/Linux
            pythonCommand = "python3";

        }

        console.log(
            "Python command:",
            pythonCommand
        );

        // ------------------------------------------
        // 7. Run Python converter
        // ------------------------------------------

        const pythonArgs = [
            pythonScript,
            pdfPath,
            outputPath
        ];

        console.log(
            "Python arguments:",
            pythonArgs
        );

        const python =
            spawn(
                pythonCommand,
                pythonArgs,
                {
                    cwd: process.cwd(),
                    stdio: [
                        "ignore",
                        "pipe",
                        "pipe"
                    ]
                }
            );

        let stdout = "";
        let stderr = "";

        // ------------------------------------------
        // Python stdout
        // ------------------------------------------

        python.stdout.on(
            "data",
            (data) => {

                const text =
                    data.toString();

                stdout += text;

                console.log(
                    "Python:",
                    text.trim()
                );

            }
        );

        // ------------------------------------------
        // Python stderr
        // ------------------------------------------

        python.stderr.on(
            "data",
            (data) => {

                const text =
                    data.toString();

                stderr += text;

                console.error(
                    "Python Error:",
                    text.trim()
                );

            }
        );

        // ------------------------------------------
        // Wait for Python
        // ------------------------------------------

        const exitCode =
            await new Promise(
                (resolve, reject) => {

                    python.on(
                        "close",
                        (code) => {

                            resolve(code);

                        }
                    );

                    python.on(
                        "error",
                        (error) => {

                            reject(error);

                        }
                    );

                }
            );

        console.log(
            "Python exited:",
            exitCode
        );

        // ------------------------------------------
        // Check Python result
        // ------------------------------------------

        if (exitCode !== 0) {

            throw new Error(
                stderr ||
                stdout ||
                "PDF to Word conversion failed"
            );

        }

        // ------------------------------------------
        // Check DOCX
        // ------------------------------------------

        if (!fs.existsSync(outputPath)) {

            throw new Error(
                "Python completed but DOCX file was not created."
            );

        }

        console.log(
            "DOCX successfully created:",
            outputPath
        );

        // ------------------------------------------
        // Delete uploaded PDF
        // ------------------------------------------

        deleteFile(req.file.path);

        // ------------------------------------------
        // Download DOCX
        // ------------------------------------------

        return res.download(
            outputPath,
            outputName,
            (err) => {

                if (err) {

                    console.error(
                        "DOWNLOAD ERROR:",
                        err
                    );

                }

                deleteFile(outputPath);

            }
        );

    } catch (error) {

        console.error(
            "PDF TO WORD ERROR:",
            error
        );

        deleteFile(req.file?.path);
        deleteFile(outputPath);

        return res.status(500).json({
            success: false,
            message:
                "PDF to Word conversion failed",
            error:
                error.message
        });

    }

}; 