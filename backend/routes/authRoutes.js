import express from "express";

const router = express.Router();

router.post("/signup", (req, res) => {
  res.json({
    message: "Signup route working",
  });
});

router.post("/login", (req, res) => {
  res.json({
    message: "Login route working",
  });
});

export default router;