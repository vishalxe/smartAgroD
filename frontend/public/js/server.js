// server.js

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Stripe = require('stripe');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3001;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(__dirname)); // Serve static files from root

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/farm4', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('MongoDB connected'));

// SCHEMA: Product
const productSchema = new mongoose.Schema({
    productName: String,
    imageUrl: String,
    description: String,
    price: Number,
    category: String,
    unit: String
});
const Product = mongoose.model('Product', productSchema);

// SCHEMA: Availability
const availabilitySchema = new mongoose.Schema({
    product: String,
    availability: [
        {
            date: String,
            status: String
        }
    ]
});
const Availability = mongoose.model('Availability', availabilitySchema);

// Sample data insertion for availability (run once)
async function insertSampleData() {
    await Availability.deleteMany({});
    await Availability.insertMany([
        {
            product: "Mango",
            availability: [
                { date: "2025-05-19", status: "available" },
                { date: "2025-05-24", status: "coming" },
                { date: "2025-05-01", status: "not_available" },
                { date: "2025-05-06", status: "available" },
                { date: "2025-05-10", status: "coming" }
            ]
        },
        {
            product: "Tomato",
            availability: [
                { date: "2025-05-20", status: "available" },
                { date: "2025-05-23", status: "available" },
                { date: "2025-05-04", status: "not_available" },
                { date: "2025-05-15", status: "coming" },
                { date: "2025-05-18", status: "available" }
            ]
        },
        {
            product: "Carrot",
            availability: [
                { date: "2025-05-15", status: "coming" },
                { date: "2025-05-05", status: "available" },
                { date: "2025-05-03", status: "not_available" },
                { date: "2025-05-26", status: "available" },
                { date: "2025-05-30", status: "not_available" }
            ]
        }
    ]);
}
insertSampleData(); // Comment out after first run

// Multer for file upload
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage });

// ROUTES

// Upload Product
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).send({ success: false, message: 'No file uploaded.' });

    const { productName, productDescription, productPrice, productCategory, productUnit } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    const product = new Product({
        productName,
        imageUrl,
        description: productDescription,
        price: parseFloat(productPrice),
        category: productCategory,
        unit: productUnit
    });

    try {
        await product.save();
        res.send({ success: true });
    } catch {
        res.status(500).send({ success: false, message: 'Error uploading product.' });
    }
});

// Get Products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch {
        res.status(500).send({ success: false, message: 'Error fetching products.' });
    }
});

// Get Single Product
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        res.json(product);
    } catch {
        res.status(500).send({ success: false, message: 'Error fetching product.' });
    }
});

// Update Product
app.put('/products/:id', async (req, res) => {
    const { productName, productDescription, productPrice, productCategory, productUnit } = req.body;
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, {
            productName,
            description: productDescription,
            price: parseFloat(productPrice),
            category: productCategory,
            unit: productUnit
        }, { new: true });

        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        res.json({ success: true, product });
    } catch {
        res.status(500).send({ success: false, message: 'Error updating product.' });
    }
});

// Delete Product
app.delete('/delete/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

        const imagePath = path.join(__dirname, product.imageUrl);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

        res.json({ success: true });
    } catch {
        res.status(500).send({ success: false, message: 'Error deleting product.' });
    }
});

// Availability API
app.get('/api/availability/:product', async (req, res) => {
    try {
        const data = await Availability.findOne({ product: req.params.product });
        if (!data) return res.status(404).json({ message: "Product not found" });
        res.json(data);
    } catch {
        res.status(500).json({ message: "Server error" });
    }
});

// Stripe Checkout
app.post('/create-checkout-session', async (req, res) => {
    const { amount } = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: { name: 'Cart Total' },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: window.location.origin + '/success',
            cancel_url: window.location.origin + '/cancel',
        });
        res.send({ id: session.id });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
app.get('/success', (req, res) => res.sendFile(__dirname + '/success.html'));
app.get('/cancel', (req, res) => res.sendFile(__dirname + '/cancel.html'));

// Routes
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

app.get('/homepage', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'homepage.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/agriproduct', (req, res) => {
    res.sendFile(path.join(__dirname, 'agriproduct.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) console.error(err);
        res.redirect('/');
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
