import express from "express";
import Thread from "../models/Threads.js"
import getOpenAIAPIResponse from "../utils/openai.js";


const router = express.Router();

// route.post("/test" , async(req ,res)=>{
//     try{
//         const thread = new Thread
//     }catch(err){
//         console.log(err);
//     }
// })


//get all therads
router.get("/thread" , async(req, res)=>{
    try{
        const threads = await Thread.find({}).sort({updatedAt:-1});
        res.json(threads);
    }catch(err){
        console.log(err);
        res.status(500).json({error: "failed to fetch threads"});
    }
})

//get all threads with id
router.get("/thread/:threadId" , async(req , res)=>{
    const {threadId} = req.params;

    try{
        const thread = await Thread.findOne({threadId})
        if(!thread){
            res.status(404).json({error:"Thread not found"});
        }
        res.json(thread.messages);
    }catch(err){
        console.log(err);
        res.status(500).json({error : "failed to fetch chat"});
    }
})

// Delet the thread
router.delete("/thread/:threadId", async(req, res)=>{
    const {threadId} = req.params;
    try{
        const deleteThread = await Thread.findOneAndDelete({threadId});
        if(!deleteThread){
            res.status(404).json({error: "thread not found"});
        }
        res.status(200).json({success:"thread was delete"})
    }catch(err){
        console.log(err);
        res.status(500).json({error:"failed to delete thread"})
    }
})

// chat route this is main rout 
router.post("/chat" , async(req, res) =>{
    const {threadId , message} = req.body;
    if(!threadId || !message){
        res.status(400).json({error : "missing required fields"});
    }
    try{
        const thread = await Thread.findOne({threadId});

        if(!thread){
            // create a new thread in db
            thread = new Thread({
                threadId,
                title: message,
                messages:[{role:"user" , content: message}]
            })
        }else{
            thread.messages.push({role:"user" , content:message});
        }
        const assistantReplay = getOpenAIAPIResponse(message);
        thread.messages.push({role:"assistant" , content:assistantReply});
        thread.updatedAt = new Date();

        await thread.save();
        res.json({reply: assistantReplay})
    }catch(err){
        console.log(err);
        res.status(500).json({error: "somthing went wrong"});
    }
})



export default router;