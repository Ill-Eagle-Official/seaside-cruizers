// Basic Express + Stripe Checkout session creation
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const Stripe = require('stripe');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper: calculate total amount
function calculateAmount(data) {
  let total = 30; // base fee
  if (data.buyHat) total += 15;
  if (data.buyShirt) total += 20;
  return total * 100; // Stripe expects cents
}

// Create Stripe Checkout session
app.post('/api/create-checkout-session', async (req, res) => {
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
              description: 'Car show registration and swag',
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
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
