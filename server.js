// Basic Express + Stripe Checkout session creation
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const Stripe = require('stripe');
const nodemailer = require('nodemailer');
const getRawBody = require('raw-body');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());

// Stripe webhook endpoint
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const data = session.metadata || {};
    try {
      // Send email
      const email = formatEmail(data, session);
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER, // or a different admin/club email
        subject: email.subject,
        text: email.text,
      });
      console.log('Registration email sent for', data.firstName, data.lastName);
    } catch (err) {
      console.error('Failed to send registration email:', err);
    }
  }
  res.json({ received: true });
});

app.use(bodyParser.json());
app.use(express.static('public'));

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Helper: calculate total amount
function calculateAmount(data) {
  let total = 30; // base fee
  if (data.buyHat) total += 15;
  if (data.buyShirt) total += 20;
  return total * 100; // Stripe expects cents
}

// Helper: format registration email
function formatEmail(data, session) {
  const hat = data.buyHat === 'true' || data.buyHat === true;
  const shirt = data.buyShirt === 'true' || data.buyShirt === true;
  return {
    subject: 'New Seaside Cruizers Car Show Registration',
    text: `Personal Information:
  • Name: ${data.firstName} ${data.lastName}
  • Email: ${data.email}
  • Address: ${data.country ? data.country + ', ' : ''}${data.province ? data.province + ', ' : ''}${data.city ? data.city + ', ' : ''}${data.postalCode ? data.postalCode : ''}

Car Information:
  • Make: ${data.make}
  • Model: ${data.model}
  • Year: ${data.year}
  • Car Club Affiliation: ${data.clubName || 'None'}

Swag Purchases:
  • Hat: ${hat ? 'Yes' : 'No'}${hat ? `\n    – Colour: ${data.hatColour}\n    – Size: ${data.hatSize}` : ''}
  • Shirt: ${shirt ? 'Yes' : 'No'}${shirt ? `\n    – Colour: ${data.shirtColour}\n    – Gender Cut: ${data.shirtGender}\n    – Size: ${data.shirtSize}` : ''}

Payment Details:
  • Base Registration: $30.00
  • Hat: $${hat ? '15.00' : '0.00'}
  • Shirt: $${shirt ? '20.00' : '0.00'}
  • Total Charged: $${(session.amount_total / 100).toFixed(2)}
  • Payment Transaction ID: ${session.payment_intent}

Date/Time of Registration: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} (PST)
`
  };
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
