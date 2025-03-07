document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("connectBtn").addEventListener("click", () => {
        alert("Thank you for showing interest! We will connect with you soon.");
    });

    // Function to submit a new blog
    async function submitBlog(title, content) {
        const response = await fetch("http://localhost:3000/blogs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, content })
        });

        const result = await response.json();
        console.log(result);
        alert(result.message);
    }

    // Example: Submitting a blog (You need to add a form in HTML for this)
    document.getElementById("submitBlog").addEventListener("click", () => {
        const title = document.getElementById("blogTitle").value;
        const content = document.getElementById("blogContent").value;
        
        if (title && content) {
            submitBlog(title, content);
        } else {
            alert("Please enter both title and content!");
        }
    });
});

