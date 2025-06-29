const express = require('express');
const router = express.Router();
const localStorage = require('../services/localStorage');

// Initialize Stripe
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_dummy_key_for_testing') {
    const Stripe = require('stripe');
    stripe = Stripe(process.env.STRIPE_SECRET_KEY);
}

// Create checkout session
router.post('/create-session', async (req, res) => {
    if (!stripe) {
        return res.status(503).json({
            success: false,
            message: 'Payment service not configured. Please set STRIPE_SECRET_KEY in environment variables.'
        });
    }

    try {
        const { amount, items, customerEmail, orderId } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid items array is required'
            });
        }

        // Convert INR to USD (approximate rate: 1 USD = 83 INR)
        const inrToUsdRate = 1 / 83;
        const amountInUsd = amount * inrToUsdRate;
        
        // Check if amount meets Stripe's minimum requirement ($0.50)
        if (amountInUsd < 0.50) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount is ₹${Math.ceil(0.50 / inrToUsdRate)} (approximately $0.50). Your order total is ₹${amount.toFixed(2)}.`
            });
        }

        // Create line items for Stripe (using USD)
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd', // Use USD instead of INR
                product_data: {
                    name: item.name || 'Product',
                    description: item.description || 'Agricultural product',
                    images: item.image ? [item.image] : []
                },
                unit_amount: Math.round((item.price * inrToUsdRate) * 100), // Convert to USD cents
            },
            quantity: item.quantity || 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            customer_email: customerEmail,
            metadata: {
                orderId: orderId || `order_${Date.now()}`,
                customerEmail: customerEmail,
                originalAmountInr: amount.toString(),
                amountInUsd: amountInUsd.toString()
            },
            success_url: `${req.protocol}://${req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'IN', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL']
            }
        });

        // Store order in local storage
        await localStorage.createOrder({
            id: orderId || `order_${Date.now()}`,
            sessionId: session.id,
            customerEmail: customerEmail,
            items: items,
            totalAmount: amount,
            totalAmountUsd: amountInUsd,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        res.json({
            success: true,
            sessionId: session.id,
            url: session.url,
            amountInUsd: amountInUsd
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment session',
            error: error.message
        });
    }
});

// Get payment session status
router.get('/session/:sessionId', async (req, res) => {
    if (!stripe) {
        return res.status(503).json({
            success: false,
            message: 'Payment service not configured'
        });
    }

    try {
        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        res.json({
            success: true,
            session: {
                id: session.id,
                status: session.status,
                paymentStatus: session.payment_status,
                amount: session.amount_total / 100,
                customerEmail: session.customer_email
            }
        });
    } catch (error) {
        console.error('Session retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment session'
        });
    }
});

// Create payment intent (for custom payment forms)
router.post('/create-payment-intent', async (req, res) => {
    if (!stripe) {
        return res.status(503).json({
            success: false,
            message: 'Payment service not configured'
        });
    }

    try {
        const { amount, currency = 'usd', customerEmail } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        // If amount is in INR, convert to USD
        let amountInUsd = amount;
        if (currency === 'inr') {
            const inrToUsdRate = 1 / 83;
            amountInUsd = amount * inrToUsdRate;
            
            // Check minimum amount
            if (amountInUsd < 0.50) {
                return res.status(400).json({
                    success: false,
                    message: `Minimum order amount is ₹${Math.ceil(0.50 / inrToUsdRate)} (approximately $0.50). Your order total is ₹${amount.toFixed(2)}.`
                });
            }
        } else if (amountInUsd < 0.50) {
            return res.status(400).json({
                success: false,
                message: 'Minimum order amount is $0.50'
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amountInUsd * 100), // Convert to cents
            currency: 'usd', // Always use USD for Stripe
            receipt_email: customerEmail,
            metadata: {
                customerEmail: customerEmail,
                originalAmount: amount.toString(),
                originalCurrency: currency
            }
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amountInUsd: amountInUsd
        });
    } catch (error) {
        console.error('Payment intent error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment intent'
        });
    }
});

// Payment success webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe) {
        return res.status(503).json({
            success: false,
            message: 'Payment service not configured'
        });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                console.log('Payment completed for session:', session.id);
                
                // Update order status in local storage
                await localStorage.updateOrderStatus(session.metadata.orderId, 'completed');
                
                // Send confirmation email (implement email service)
                // await sendOrderConfirmationEmail(session.customer_email, session.metadata.orderId);
                break;

            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('Payment succeeded:', paymentIntent.id);
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('Payment failed:', failedPayment.id);
                
                // Update order status to failed
                if (failedPayment.metadata.orderId) {
                    await localStorage.updateOrderStatus(failedPayment.metadata.orderId, 'failed');
                }
                break;

            case 'invoice.payment_succeeded':
                console.log('Subscription payment succeeded');
                break;

            case 'invoice.payment_failed':
                console.log('Subscription payment failed');
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Get payment methods for a customer
router.get('/payment-methods/:customerId', async (req, res) => {
    if (!stripe) {
        return res.status(503).json({
            success: false,
            message: 'Payment service not configured'
        });
    }

    try {
        const { customerId } = req.params;
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });

        res.json({
            success: true,
            paymentMethods: paymentMethods.data
        });
    } catch (error) {
        console.error('Payment methods error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment methods'
        });
    }
});

// Refund payment
router.post('/refund', async (req, res) => {
    if (!stripe) {
        return res.status(503).json({
            success: false,
            message: 'Payment service not configured'
        });
    }

    try {
        const { paymentIntentId, amount, reason } = req.body;
        
        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID is required'
            });
        }

        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount ? Math.round(amount * 100) : undefined,
            reason: reason || 'requested_by_customer'
        });

        res.json({
            success: true,
            refund: {
                id: refund.id,
                amount: refund.amount / 100,
                status: refund.status,
                reason: refund.reason
            }
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing refund'
        });
    }
});

// Get order history
router.get('/orders', async (req, res) => {
    try {
        const { customerEmail, status, limit = 10, offset = 0 } = req.query;
        
        let orders = await localStorage.getAllOrders();
        
        // Filter by customer email if provided
        if (customerEmail) {
            orders = orders.filter(order => order.customerEmail === customerEmail);
        }
        
        // Filter by status if provided
        if (status) {
            orders = orders.filter(order => order.status === status);
        }
        
        // Apply pagination
        const paginatedOrders = orders.slice(offset, offset + limit);
        
        res.json({
            success: true,
            orders: paginatedOrders,
            total: orders.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Orders retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving orders'
        });
    }
});

module.exports = router; 