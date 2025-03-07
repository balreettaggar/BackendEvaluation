const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(bodyParser.json());

const LIFESTYLE_FILE = "./lifestyle.json";

// Ensure the JSON file exists
if (!fs.existsSync(LIFESTYLE_FILE)) {
    fs.writeFileSync(LIFESTYLE_FILE, "[]", "utf-8");
}

// Fetch all lifestyle blogs
app.get("/lifestyle-blogs", (req, res) => {
    fs.readFile(LIFESTYLE_FILE, "utf-8", (err, data) => {
        if (err || !data) return res.json([]);
        try {
            res.json(JSON.parse(data));
        } catch {
            res.status(500).json({ error: "Failed to parse blog data" });
        }
    });
});

// Add a lifestyle blog
app.post("/add-lifestyle-blog", (req, res) => {
    const { title, author, content } = req.body;
    if (!title || !author || !content) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    fs.readFile(LIFESTYLE_FILE, "utf-8", (err, data) => {
        let blogs = err || !data ? [] : JSON.parse(data);
        const newBlog = {
            id: Date.now(),
            title,
            author,
            content,
            likes: 0,
            dislikes: 0,
            comments: [],
            date: new Date().toISOString()
        };

        blogs.push(newBlog);
        fs.writeFile(LIFESTYLE_FILE, JSON.stringify(blogs, null, 2), "utf-8", (err) => {
            if (err) return res.status(500).json({ error: "Failed to save blog" });
            res.status(201).json({ message: "Blog added successfully!", blog: newBlog });
        });
    });
});

// Like a blog
app.patch("/like-lifestyle-blog/:id", (req, res) => {
    const blogId = parseInt(req.params.id);

    fs.readFile(LIFESTYLE_FILE, "utf-8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read data" });

        let blogs = JSON.parse(data);
        const blogIndex = blogs.findIndex((blog) => blog.id === blogId);
        if (blogIndex === -1) return res.status(404).json({ error: "Blog not found" });

        blogs[blogIndex].likes += 1;

        fs.writeFile(LIFESTYLE_FILE, JSON.stringify(blogs, null, 2), "utf-8", (err) => {
            if (err) return res.status(500).json({ error: "Failed to update likes" });
            res.json({ message: "Blog liked!", likes: blogs[blogIndex].likes });
        });
    });
});

// Dislike a blog
app.patch("/dislike-lifestyle-blog/:id", (req, res) => {
    const blogId = parseInt(req.params.id);

    fs.readFile(LIFESTYLE_FILE, "utf-8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read data" });

        let blogs = JSON.parse(data);
        const blogIndex = blogs.findIndex((blog) => blog.id === blogId);
        if (blogIndex === -1) return res.status(404).json({ error: "Blog not found" });

        blogs[blogIndex].dislikes += 1;

        fs.writeFile(LIFESTYLE_FILE, JSON.stringify(blogs, null, 2), "utf-8", (err) => {
            if (err) return res.status(500).json({ error: "Failed to update dislikes" });
            res.json({ message: "Blog disliked!", dislikes: blogs[blogIndex].dislikes });
        });
    });
});

// Edit a blog
app.patch("/edit-lifestyle-blog/:id", (req, res) => {
    const blogId = parseInt(req.params.id);
    const { title, content } = req.body;

    fs.readFile(LIFESTYLE_FILE, "utf-8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read data" });

        let blogs = JSON.parse(data);
        const blog = blogs.find(blog => blog.id === blogId);
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        blog.title = title;
        blog.content = content;

        fs.writeFile(LIFESTYLE_FILE, JSON.stringify(blogs, null, 2), "utf-8", (err) => {
            if (err) return res.status(500).json({ error: "Failed to update blog" });
            res.json({ message: "Blog updated successfully!" });
        });
    });
});

// Delete a blog
app.delete("/delete-lifestyle-blog/:id", (req, res) => {
    const blogId = parseInt(req.params.id);

    fs.readFile(LIFESTYLE_FILE, "utf-8", (err, data) => {
        let blogs = JSON.parse(data).filter(blog => blog.id !== blogId);
        
        fs.writeFile(LIFESTYLE_FILE, JSON.stringify(blogs, null, 2), "utf-8", (err) => {
            if (err) return res.status(500).json({ error: "Failed to delete blog" });
            res.json({ message: "Blog deleted successfully!" });
        });
    });
});

// Add a comment
app.post("/add-comment-lifestyle-blog/:id", (req, res) => {
    const blogId = parseInt(req.params.id);
    const { user, text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Comment cannot be empty" });
    }

    fs.readFile(LIFESTYLE_FILE, "utf-8", (err, data) => {
        let blogs = JSON.parse(data);
        const blog = blogs.find(blog => blog.id === blogId);
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        blog.comments.push({ user: user || "Anonymous", text });

        fs.writeFile(LIFESTYLE_FILE, JSON.stringify(blogs, null, 2), "utf-8", (err) => {
            res.json({ message: "Comment added!" });
        });
    });
});

// Rate a blog
app.post("/rate-lifestyle-blog/:id", (req, res) => {
    const blogId = parseInt(req.params.id);
    const { rating } = req.body; // Expect rating from 1 to 5

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Invalid rating. Please provide a rating between 1 and 5." });
    }

    fs.readFile(LIFESTYLE_FILE, "utf-8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read data" });

        let blogs = JSON.parse(data);
        const blog = blogs.find(blog => blog.id === blogId);
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        if (!blog.ratings) {
            blog.ratings = [];
        }

        blog.ratings.push(rating);
        blog.averageRating = (blog.ratings.reduce((a, b) => a + b, 0) / blog.ratings.length).toFixed(1);

        fs.writeFile(LIFESTYLE_FILE, JSON.stringify(blogs, null, 2), "utf-8", (err) => {
            if (err) return res.status(500).json({ error: "Failed to update rating" });
            res.json({ message: "Rating submitted!", averageRating: blog.averageRating });
        });
    });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
