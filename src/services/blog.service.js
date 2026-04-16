const db = require("../models");
const Blog = db.Blog;

const createBlog = async ({ title, content, userId }) => {
  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  return await Blog.create({
    title,
    content,
    userId
  });
};

const getAllBlogs = async () => {
  return await Blog.findAll({
    order: [["createdAt", "DESC"]]
  });
};

const updateBlog = async ({ blogId, userId, payload }) => {
  const blog = await Blog.findByPk(blogId);
  if (!blog) {
    throw new Error("Blog not found");
  }

  if (blog.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await blog.update(payload);
  return blog;
};

const deleteBlog = async ({ blogId, userId }) => {
  const blog = await Blog.findByPk(blogId);
  if (!blog) {
    throw new Error("Blog not found");
  }

  if (blog.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await blog.destroy();
};

module.exports = {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog
};
