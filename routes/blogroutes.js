const express = require("express");
const router = express.Router();

const blogController = require("../controllers/blogcontroller");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, blogController.createBlog);
router.get("/all", authMiddleware, blogController.getAllBlogs);

router.put("/:id", authMiddleware, blogController.updateBlog);
router.delete("/:id", authMiddleware, blogController.deleteBlog);

module.exports = router;
