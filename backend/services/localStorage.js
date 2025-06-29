const fs = require('fs-extra');
const path = require('path');

class LocalStorageService {
    constructor() {
        this.dataDir = path.join(__dirname, '../../data');
        this.productsFile = path.join(this.dataDir, 'products.json');
        this.usersFile = path.join(this.dataDir, 'users.json');
        this.ordersFile = path.join(this.dataDir, 'orders.json');
        this.availabilityFile = path.join(this.dataDir, 'availability.json');
        this.schemesFile = path.join(this.dataDir, 'schemes.json');
        this.farmerSchemesFile = path.join(this.dataDir, 'farmerSchemes.json');
        
        this.ensureDataDirectory();
        this.initializeDataFiles();
    }

    async ensureDataDirectory() {
        try {
            await fs.ensureDir(this.dataDir);
        } catch (error) {
            console.error('Error creating data directory:', error);
        }
    }

    async initializeDataFiles() {
        const files = [
            { path: this.productsFile, default: [] },
            { path: this.usersFile, default: [] },
            { path: this.ordersFile, default: [] },
            { path: this.availabilityFile, default: [] },
            { path: this.schemesFile, default: this.getDefaultSchemes() },
            { path: this.farmerSchemesFile, default: [] }
        ];

        for (const file of files) {
            try {
                const exists = await fs.pathExists(file.path);
                if (!exists) {
                    await fs.writeJson(file.path, file.default, { spaces: 2 });
                }
            } catch (error) {
                console.error(`Error initializing ${file.path}:`, error);
            }
        }
    }

    getDefaultSchemes() {
        return [
            {
                id: 'scheme_1',
                name: 'PM-KISAN Scheme',
                description: 'Direct income support of ₹6,000 per year to eligible farmer families',
                eligibility: ['Small and marginal farmers', 'Landholding up to 2 hectares'],
                benefits: ['₹6,000 per year in 3 installments', 'Direct bank transfer', 'No middlemen'],
                documents: ['Aadhaar card', 'Land records', 'Bank account details'],
                status: 'active',
                maxAmount: 6000,
                duration: '1 year',
                createdAt: new Date().toISOString()
            },
            {
                id: 'scheme_2',
                name: 'PM Fasal Bima Yojana',
                description: 'Crop insurance scheme to protect farmers against natural calamities',
                eligibility: ['All farmers growing notified crops', 'Loanee and non-loanee farmers'],
                benefits: ['Comprehensive crop insurance', 'Low premium rates', 'Quick claim settlement'],
                documents: ['Land records', 'Crop details', 'Bank account details'],
                status: 'active',
                maxAmount: 50000,
                duration: 'Crop season',
                createdAt: new Date().toISOString()
            },
            {
                id: 'scheme_3',
                name: 'Kisan Credit Card',
                description: 'Easy credit facility for farmers to meet agricultural needs',
                eligibility: ['Individual farmers', 'Joint borrowers', 'Tenant farmers'],
                benefits: ['Flexible credit limit', 'Low interest rates', 'Easy repayment options'],
                documents: ['Land records', 'Income certificate', 'Bank statements'],
                status: 'active',
                maxAmount: 300000,
                duration: '5 years',
                createdAt: new Date().toISOString()
            },
            {
                id: 'scheme_4',
                name: 'Soil Health Card Scheme',
                description: 'Free soil testing and recommendations for farmers',
                eligibility: ['All farmers', 'Landowners and tenants'],
                benefits: ['Free soil testing', 'Nutrient recommendations', 'Crop-specific advice'],
                documents: ['Land records', 'Aadhaar card'],
                status: 'active',
                maxAmount: 0,
                duration: 'Once every 3 years',
                createdAt: new Date().toISOString()
            },
            {
                id: 'scheme_5',
                name: 'PMKSY - Micro Irrigation',
                description: 'Subsidy for micro irrigation systems to save water',
                eligibility: ['Small and marginal farmers', 'Water-scarce areas'],
                benefits: ['Up to 55% subsidy', 'Water conservation', 'Increased productivity'],
                documents: ['Land records', 'Water source details', 'Bank account'],
                status: 'active',
                maxAmount: 50000,
                duration: 'One-time',
                createdAt: new Date().toISOString()
            }
        ];
    }

    // Generic CRUD operations
    async readData(filePath) {
        try {
            const data = await fs.readJson(filePath);
            return data;
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error);
            return [];
        }
    }

    async writeData(filePath, data) {
        try {
            await fs.writeJson(filePath, data, { spaces: 2 });
            return true;
        } catch (error) {
            console.error(`Error writing ${filePath}:`, error);
            return false;
        }
    }

    // Product operations
    async getAllProducts() {
        return await this.readData(this.productsFile);
    }

    async getProductById(id) {
        const products = await this.readData(this.productsFile);
        return products.find(product => product.id === id);
    }

    async createProduct(productData) {
        const products = await this.readData(this.productsFile);
        const newProduct = {
            id: Date.now().toString(),
            ...productData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        products.push(newProduct);
        await this.writeData(this.productsFile, products);
        return newProduct;
    }

    async updateProduct(id, updateData) {
        const products = await this.readData(this.productsFile);
        const index = products.findIndex(product => product.id === id);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            await this.writeData(this.productsFile, products);
            return products[index];
        }
        return null;
    }

    async deleteProduct(id) {
        const products = await this.readData(this.productsFile);
        const filteredProducts = products.filter(product => product.id !== id);
        await this.writeData(this.productsFile, filteredProducts);
        return true;
    }

    // User operations
    async getAllUsers() {
        return await this.readData(this.usersFile);
    }

    async getUserById(id) {
        const users = await this.readData(this.usersFile);
        return users.find(user => user.id === id);
    }

    async getUserByEmail(email) {
        const users = await this.readData(this.usersFile);
        return users.find(user => user.email === email);
    }

    async createUser(userData) {
        const users = await this.readData(this.usersFile);
        const newUser = {
            id: Date.now().toString(),
            ...userData,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        await this.writeData(this.usersFile, users);
        return newUser;
    }

    async updateUser(id, updateData) {
        const users = await this.readData(this.usersFile);
        const index = users.findIndex(user => user.id === id);
        if (index !== -1) {
            users[index] = {
                ...users[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            await this.writeData(this.usersFile, users);
            return users[index];
        }
        return null;
    }

    // Order operations
    async getAllOrders() {
        return await this.readData(this.ordersFile);
    }

    async getOrderById(id) {
        const orders = await this.readData(this.ordersFile);
        return orders.find(order => order.id === id);
    }

    async getOrdersByCustomer(customerEmail) {
        const orders = await this.readData(this.ordersFile);
        return orders.filter(order => order.customerEmail === customerEmail);
    }

    async createOrder(orderData) {
        const orders = await this.readData(this.ordersFile);
        const newOrder = {
            id: orderData.id || `order_${Date.now()}`,
            ...orderData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        orders.push(newOrder);
        await this.writeData(this.ordersFile, orders);
        return newOrder;
    }

    async updateOrderStatus(orderId, status) {
        const orders = await this.readData(this.ordersFile);
        const index = orders.findIndex(order => order.id === orderId);
        if (index !== -1) {
            orders[index].status = status;
            orders[index].updatedAt = new Date().toISOString();
            await this.writeData(this.ordersFile, orders);
            return orders[index];
        }
        return null;
    }

    // Scheme operations
    async getAllSchemes() {
        return await this.readData(this.schemesFile);
    }

    async getSchemeById(id) {
        const schemes = await this.readData(this.schemesFile);
        return schemes.find(scheme => scheme.id === id);
    }

    async createScheme(schemeData) {
        const schemes = await this.readData(this.schemesFile);
        const newScheme = {
            id: `scheme_${Date.now()}`,
            ...schemeData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        schemes.push(newScheme);
        await this.writeData(this.schemesFile, schemes);
        return newScheme;
    }

    async updateScheme(id, updateData) {
        const schemes = await this.readData(this.schemesFile);
        const index = schemes.findIndex(scheme => scheme.id === id);
        if (index !== -1) {
            schemes[index] = {
                ...schemes[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            await this.writeData(this.schemesFile, schemes);
            return schemes[index];
        }
        return null;
    }

    // Farmer Scheme Applications
    async getAllFarmerSchemes() {
        return await this.readData(this.farmerSchemesFile);
    }

    async getFarmerSchemeById(id) {
        const farmerSchemes = await this.readData(this.farmerSchemesFile);
        return farmerSchemes.find(fs => fs.id === id);
    }

    async getFarmerSchemesByFarmer(farmerId) {
        const farmerSchemes = await this.readData(this.farmerSchemesFile);
        return farmerSchemes.filter(fs => fs.farmerId === farmerId);
    }

    async createFarmerScheme(farmerSchemeData) {
        const farmerSchemes = await this.readData(this.farmerSchemesFile);
        const newFarmerScheme = {
            id: `fs_${Date.now()}`,
            ...farmerSchemeData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        farmerSchemes.push(newFarmerScheme);
        await this.writeData(this.farmerSchemesFile, farmerSchemes);
        return newFarmerScheme;
    }

    async updateFarmerSchemeStatus(id, status, remarks = '') {
        const farmerSchemes = await this.readData(this.farmerSchemesFile);
        const index = farmerSchemes.findIndex(fs => fs.id === id);
        if (index !== -1) {
            farmerSchemes[index].status = status;
            farmerSchemes[index].remarks = remarks;
            farmerSchemes[index].updatedAt = new Date().toISOString();
            await this.writeData(this.farmerSchemesFile, farmerSchemes);
            return farmerSchemes[index];
        }
        return null;
    }

    // Availability operations
    async getAvailability(productName) {
        const availability = await this.readData(this.availabilityFile);
        return availability.find(item => item.product === productName);
    }

    async updateAvailability(productName, availabilityData) {
        const availability = await this.readData(this.availabilityFile);
        const index = availability.findIndex(item => item.product === productName);
        if (index !== -1) {
            availability[index] = {
                ...availability[index],
                ...availabilityData,
                updatedAt: new Date().toISOString()
            };
        } else {
            availability.push({
                product: productName,
                ...availabilityData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        await this.writeData(this.availabilityFile, availability);
        return availability[index] || availability[availability.length - 1];
    }

    // Search and filter operations
    async searchProducts(query) {
        const products = await this.readData(this.productsFile);
        const lowerQuery = query.toLowerCase();
        return products.filter(product => 
            product.name.toLowerCase().includes(lowerQuery) ||
            product.description.toLowerCase().includes(lowerQuery) ||
            product.category.toLowerCase().includes(lowerQuery)
        );
    }

    async getProductsByCategory(category) {
        const products = await this.readData(this.productsFile);
        return products.filter(product => product.category.toLowerCase() === category.toLowerCase());
    }

    async getProductsByFarmer(farmerId) {
        const products = await this.readData(this.productsFile);
        return products.filter(product => product.farmerId === farmerId);
    }

    // Data backup and maintenance
    async backupData() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(this.dataDir, 'backups', timestamp);
        
        try {
            await fs.ensureDir(backupDir);
            const files = [
                this.productsFile,
                this.usersFile,
                this.ordersFile,
                this.availabilityFile,
                this.schemesFile,
                this.farmerSchemesFile
            ];

            for (const file of files) {
                if (await fs.pathExists(file)) {
                    const fileName = path.basename(file);
                    await fs.copy(file, path.join(backupDir, fileName));
                }
            }

            console.log(`Backup created at: ${backupDir}`);
            return backupDir;
        } catch (error) {
            console.error('Backup error:', error);
            throw error;
        }
    }

    async getDataStats() {
        const products = await this.readData(this.productsFile);
        const users = await this.readData(this.usersFile);
        const orders = await this.readData(this.ordersFile);
        const schemes = await this.readData(this.schemesFile);
        const farmerSchemes = await this.readData(this.farmerSchemesFile);

        return {
            totalProducts: products.length,
            totalUsers: users.length,
            totalOrders: orders.length,
            totalSchemes: schemes.length,
            totalFarmerSchemes: farmerSchemes.length,
            farmers: users.filter(user => user.role === 'farmer').length,
            buyers: users.filter(user => user.role === 'buyer').length,
            completedOrders: orders.filter(order => order.status === 'completed').length,
            pendingOrders: orders.filter(order => order.status === 'pending').length,
            activeSchemes: schemes.filter(scheme => scheme.status === 'active').length
        };
    }
}

module.exports = new LocalStorageService(); 