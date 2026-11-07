import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'razorpay-order-api',
        configureServer(server) {
          server.middlewares.use('/api/create-razorpay-order', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
            }

            const keyId = env.VITE_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
            const keySecret = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

            if (!keyId || !keySecret) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                error: 'Razorpay credentials not configured in environment (.env). Please provide VITE_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' 
              }));
              return;
            }

            try {
              const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
              const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Basic ${auth}`,
                },
                body: JSON.stringify({
                  amount: 19900, // 199 INR in paise
                  currency: 'INR',
                  receipt: `rcpt_${Date.now()}`,
                  notes: {
                    plan: 'SQLEdge_Pro_Student_Pass',
                  },
                }),
              });

              const orderData = await rzpRes.json();
              if (!rzpRes.ok) {
                res.statusCode = rzpRes.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: orderData.error?.description || 'Failed to create order' }));
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ order_id: orderData.id, amount: orderData.amount, currency: orderData.currency }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Server error creating Razorpay order' }));
            }
          });
        },
      },
    ],
    optimizeDeps: {
      exclude: ['sql.js'],
    },
    build: {
      rollupOptions: {
        external: [],
      },
    },
    server: {
      // Third-party payment gateways (Razorpay) require standard cross-origin headers without restrictive COOP/COEP isolation
      cors: true,
    },
  };
});
