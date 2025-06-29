const localStorage = require('../services/localStorage');
const path = require('path');

const sampleProducts = [
    {
        productName: "Fresh Organic Tomatoes",
        description: "Sweet and juicy organic tomatoes grown without pesticides. Perfect for salads, sauces, and cooking.",
        price: 2.99,
        category: "vegetables",
        unit: "kg",
        stock: 50,
        isAvailable: true,
        imageUrl: "/images/tomatoes.jpg"
    },
    {
        productName: "Organic Strawberries",
        description: "Sweet and fragrant organic strawberries. Rich in antioxidants and perfect for desserts.",
        price: 4.99,
        category: "fruits",
        unit: "kg",
        stock: 30,
        isAvailable: true,
        imageUrl: "/images/strawberry.jpg"
    },
    {
        productName: "Fresh Farm Eggs",
        description: "Farm-fresh eggs from free-range chickens. Rich in protein and essential nutrients.",
        price: 3.49,
        category: "dairy",
        unit: "dozen",
        stock: 25,
        isAvailable: true,
        imageUrl: "/images/eggs.jpg"
    },
    {
        productName: "Organic Spinach",
        description: "Fresh organic spinach leaves. High in iron and perfect for salads and smoothies.",
        price: 1.99,
        category: "vegetables",
        unit: "kg",
        stock: 40,
        isAvailable: true,
        imageUrl: "/images/spinach.jpg"
    },
    {
        productName: "Fresh Broccoli",
        description: "Crisp and nutritious broccoli heads. Great for steaming, roasting, or stir-frying.",
        price: 2.49,
        category: "vegetables",
        unit: "kg",
        stock: 35,
        isAvailable: true,
        imageUrl: "/images/broccoli.jpg"
    },
    {
        productName: "Organic Almonds",
        description: "Premium organic almonds. Rich in healthy fats and perfect for snacking.",
        price: 8.99,
        category: "other",
        unit: "kg",
        stock: 20,
        isAvailable: true,
        imageUrl: "/images/almonds.jpg"
    },
    {
        productName: "Fresh Cottage Cheese",
        description: "Creamy and fresh cottage cheese. High in protein and perfect for healthy meals.",
        price: 4.49,
        category: "dairy",
        unit: "kg",
        stock: 15,
        isAvailable: true,
        imageUrl: "/images/cottagecheese.jpg"
    },
    {
        productName: "Organic Pumpkin",
        description: "Sweet organic pumpkins. Perfect for soups, pies, and roasting.",
        price: 3.99,
        category: "vegetables",
        unit: "kg",
        stock: 25,
        isAvailable: true,
        imageUrl: "/images/pumpkins.jpg"
    },
    {
        productName: "Fresh Mango Saplings",
        description: "Healthy mango saplings ready for planting. Grow your own mango trees.",
        price: 12.99,
        category: "other",
        unit: "pieces",
        stock: 10,
        isAvailable: true,
        imageUrl: "/images/mangosapling.jpg"
    },
    {
        productName: "Organic Herb Seeds",
        description: "Assorted organic herb seeds including basil, mint, and rosemary.",
        price: 5.99,
        category: "herbs",
        unit: "packets",
        stock: 30,
        isAvailable: true,
        imageUrl: "/images/herbseeds.jpg"
    }
];

const sampleUsers = [
    {
        uid: "user123",
        email: "user@example.com",
        name: "John User",
        role: "user"
    },
    {
        uid: "farmer123",
        email: "farmer@example.com",
        name: "Jane Farmer",
        role: "farmer"
    },
    {
        uid: "admin123",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin"
    }
];

const sampleAvailability = [
    {
        product: "Fresh Organic Tomatoes",
        available: true,
        quantity: 50,
        unit: "kg",
        lastUpdated: new Date().toISOString()
    },
    {
        product: "Organic Strawberries",
        available: true,
        quantity: 30,
        unit: "kg",
        lastUpdated: new Date().toISOString()
    },
    {
        product: "Fresh Farm Eggs",
        available: true,
        quantity: 25,
        unit: "dozen",
        lastUpdated: new Date().toISOString()
    }
];

async function initializeData() {
    try {
        console.log('🔄 Initializing sample data...');

        // Initialize products
        const existingProducts = await localStorage.getAllProducts();
        if (existingProducts.length === 0) {
            console.log('📦 Adding sample products...');
            for (const product of sampleProducts) {
                await localStorage.createProduct(product);
            }
            console.log(`✅ Added ${sampleProducts.length} sample products`);
        } else {
            console.log(`📦 Found ${existingProducts.length} existing products`);
        }

        // Initialize users
        const existingUsers = await localStorage.getAllUsers();
        if (existingUsers.length === 0) {
            console.log('👥 Adding sample users...');
            for (const user of sampleUsers) {
                await localStorage.createUser(user);
            }
            console.log(`✅ Added ${sampleUsers.length} sample users`);
        } else {
            console.log(`👥 Found ${existingUsers.length} existing users`);
        }

        // Initialize availability
        console.log('📊 Setting up availability data...');
        for (const availability of sampleAvailability) {
            await localStorage.updateAvailability(availability.product, availability);
        }
        console.log(`✅ Set up availability for ${sampleAvailability.length} products`);

        console.log('🎉 Data initialization completed successfully!');
        console.log('\n📋 Sample Login Credentials:');
        console.log('👤 User: user@example.com / password123');
        console.log('👨‍🌾 Farmer: farmer@example.com / password123');
        console.log('👨‍💼 Admin: admin@example.com / password123');

    } catch (error) {
        console.error('❌ Error initializing data:', error);
    }
}

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeData();
}

module.exports = { initializeData }; 