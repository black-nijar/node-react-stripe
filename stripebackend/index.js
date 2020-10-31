require('dotenv').config()
const express = require('express');
const cors = require('cors');

const stripe = require('stripe')(process.env.STRIPE_KEY);
const uuid = require('uuid');

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// routes
app.get('/', (req, res) => {
  res.send('IT WORKS');
});

app.use('/payment', (req, res) => {
  const { product, token } = req.body;
  console.log('PROD :', product, token);
  const idempontencyKey = uuid();

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((cus) => {
      console.log(cus)
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: 'inr',
          customer: cus.id,
          receipt_email: token.email,
          description: ` purchase of product.name`,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempontencyKey }
      );
    })
    .then((res) => res.status(200).json(res))
    .catch((err) => console.log('ERR :', err));
});

// listen
const PORT = process.env.PORT || 8282;
app.listen(PORT, () => console.log(`Listening at port ${PORT}`));
