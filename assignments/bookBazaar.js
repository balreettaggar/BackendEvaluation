const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

// MIDDLEWARE
app.use(express.json());

// Storing
const PRODUCTS_FILE = 'products.json';
const REVIEWS_FILE = 'reviews.json';

// Read data from file
const readData = (file) => {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
        return []; // Return empty array if there's an error or file doesn't exist
    }
};

const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

// ADD A NEW PRODUCT
app.post('/products', (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
    }

    const products = readData(PRODUCTS_FILE);
    let product_id = products.length === 0 ? 1 : products[products.length - 1].id + 1;
    
    const newProduct = {
        id: product_id,
        name,
        description,
        averagerating: 0
    };

    products.push(newProduct);
    writeData(PRODUCTS_FILE, products);
    res.status(201).json(newProduct);
});

// GET ALL PRODUCTS
app.get('/products', (req, res) => {
    let products = readData(PRODUCTS_FILE);
    
    if (req.query.sortBy === 'rating') {
        products.sort((a, b) => b.averagerating - a.averagerating);
    }
    
    res.json(products);
});

// ADD A REVIEW
app.post('/reviews', (req, res) => {
    const { productId, rating, message } = req.body;

    if (!productId || !rating || !message) {
        return res.status(400).json({ error: 'Product ID, rating, and message are required' });
    }

    if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    }

    const products = readData(PRODUCTS_FILE);
    const product = products.find(p => p.id === Number(productId));

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const reviews = readData(REVIEWS_FILE);
    let review_id = reviews.length === 0 ? 1 : reviews[reviews.length - 1].id + 1;
    
    const newReview = {
        id: review_id,
        productId: Number(productId),
        timestamp: new Date().toISOString(),
        rating: Number(rating),
        message
    };

    reviews.push(newReview);
    writeData(REVIEWS_FILE, reviews);

    // Update product's average rating
    const productReviews = reviews.filter(r => r.productId === Number(productId));
    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
    product.averagerating = totalRating / productReviews.length;

    writeData(PRODUCTS_FILE, products);

    res.status(201).json(newReview);
});

// GET ALL REVIEWS
app.get('/reviews', (req, res) => {
    const reviews = readData(REVIEWS_FILE).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(reviews);
});

// GET PRODUCT BY ID
app.get('/products/:id', (req, res) => {
    const products = readData(PRODUCTS_FILE);
    const product = products.find(p => p.id === Number(req.params.id));

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const reviews = readData(REVIEWS_FILE).filter(r => r.productId === Number(req.params.id));
    res.json({ ...product, reviews });
});

// SERVER START
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});