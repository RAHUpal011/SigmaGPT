import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateImage = async (req, res) => {

    try {
        const { prompt } = req.body;
        if (!prompt || prompt.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Prompt is required"
            });
        }

        const response = await client.images.generate({
            model: "gpt-image-1",
            prompt: prompt,
            size: "1024x1024",
            quality: "medium",
            n: 1
        });

        const imageBase64 = response.data[0].b64_json;
        res.status(200).json({
            success: true,
            image: `data:image/png;base64,${imageBase64}`
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



// ======================================
// Image Variations (Optional)
// ======================================

export const imageVariation = async (req, res) => {

    try {

        return res.json({

            success: false,

            message: "Image variation feature will be added later."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};



// ======================================
// Edit Image (Optional)
// ======================================

export const editImage = async (req, res) => {

    try {

        return res.json({

            success: false,

            message: "Image editing feature will be added later."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};