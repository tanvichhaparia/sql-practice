export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TxJBpuhQ7h7snj';
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(400).json({ 
      error: 'RAZORPAY_KEY_SECRET not set in server environment. Please configure it in Vercel project environment variables.' 
    });
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
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

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.description || 'Failed to create Razorpay order' 
      });
    }

    return res.status(200).json({ 
      order_id: data.id, 
      amount: data.amount, 
      currency: data.currency 
    });
  } catch (err) {
    return res.status(500).json({ 
      error: err.message || 'Server error creating Razorpay order' 
    });
  }
}
