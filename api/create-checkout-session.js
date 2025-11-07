import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper: calculate total amount
function calculateAmount(data) {
  let total = 30; // base fee
  if (data.pokerRun) total += 5; // poker run additional fee
  return total * 100; // Stripe expects cents
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    const amount = calculateAmount(data);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'Seaside Cruizers Car Show Registration',
              description: 'Car show registration' + (data.pokerRun ? ' + Poker Run' : ''),
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${data.origin}/registration.html?success=true&firstName=${encodeURIComponent(data.firstName)}`,
      cancel_url: `${data.origin}/registration.html?canceled=true`,
      metadata: data, // Store all registration data for later use
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create Stripe session' });
  }
}
