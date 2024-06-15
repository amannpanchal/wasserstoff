const express = require("express");
const router = express.Router();

// REST API routes
router.get("/fast", (req, res) => {
  res.send({ message: "Fast response" });
});

router.get("/slow", (req, res) => {
  setTimeout(() => {
    res.send({ message: "Slow response" });
  }, 5000);
});

router.post("/payload", (req, res) => {
  res.send({ message: "Received payload", payload: req.body });
});

module.exports = router;
