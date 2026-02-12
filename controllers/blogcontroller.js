const db = require("../models");
const Blog = db.Blog;

// =====================
// CREATE BLOG
// =====================
 exports.createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const blog = await Blog.create({
      title,
      content,
      userId: req.user.id
    });

    return res.status(201).json({
      message: "Blog created successfully",
      blog
    });
  } catch (error) {
    console.error("Create blog error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================
// GET ALL BLOGS
// =====================
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json(blogs);
  } catch (error) {
    console.error("Get blogs error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // allow only owner to update
    if (blog.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await blog.update(req.body);

    res.status(200).json({
      message: "Blog updated successfully",
      blog
    });

  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ message: error.message });
  }
};


// =====================
// DELETE BLOG
// DELETE /api/blogs/:id
// =====================
exports.deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.id; // from JWT middleware

    // 1️⃣ Find blog
    const blog = await Blog.findByPk(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // 2️⃣ Check ownership
    if (blog.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 3️⃣ Delete blog
    await blog.destroy();

    res.status(200).json({
      message: "Blog deleted successfully"
    });

  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: error.message });
  }
};

