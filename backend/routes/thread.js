import express from "express";
import Thread from "../models/Threads.js";

const router = express.Router();

/*
GET ALL THREADS
*/

router.get("/", async (req, res) => {

    try {
        const threads = await Thread
            .find({})
            .sort({ updatedAt: -1 });

        res.status(200).json(threads);

    } catch (err) {
        console.error(
            "GET THREAD ERROR:",
            err
        );
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

/*
GET SINGLE THREAD
*/

router.get("/:threadId", async (req, res) => {
    try {
        const thread = await Thread.findOne({
            threadId: req.params.threadId
        });
        if (!thread) {
            return res.status(404).json({
                success: false,
                message: "Thread not found"
            });
        }
        res.status(200).json(thread);
    } catch (err) {
        console.error(
            "GET SINGLE THREAD ERROR:",
            err
        );
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});


// DELETE THREAD
router.delete("/:threadId", async (req, res) => {
    try {
        await Thread.findByIdAndDelete(req.params.threadId);
        res.status(200).json({
            message: "Thread deleted successfully"
        });

    } catch (error) {
        console.log("DELETE THREAD ERROR:", error);

        res.status(500).json({
            error: "Failed to delete thread"
        });
    }
});


export default router;