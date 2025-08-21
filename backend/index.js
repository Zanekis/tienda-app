import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Datos simulados
let products = [
  { id: 1, name: 'Camiseta', price: 200 },
  { id: 2, name: 'Pantalón', price: 350 },
  { id: 3, name: 'Zapatos', price: 500 },
  { id: 4, name: 'Gorra', price: 120 },
  { id: 5, name: 'Sudadera', price: 400 },
  { id: 6, name: 'Mochila', price: 600 },
  { id: 7, name: 'Calcetines', price: 80 },
  { id: 8, name: 'Reloj', price: 1500 },
  { id: 9, name: 'Lentes de sol', price: 900 },
  { id: 10, name: 'Bufanda', price: 180 }
];

let cart = [];
let coupons = { 'DESCUENTO10': 0.1 };
let appliedCoupon = null;
let lastOrder = null;

// Endpoints
app.get('/products', (req, res) => {
  res.json(products);
});

app.get('/cart', (req, res) => {
  res.json({ cart, appliedCoupon });
});


app.post('/cart/add', (req, res) => {
  const { productId } = req.body;
  const product = products.find(p => p.id === productId);
  if (product) {
    cart.push(product);
    res.json({ success: true, cart });
  } else {
    res.status(404).json({ success: false, message: 'Producto no encontrado' });
  }
});

app.post('/cart/remove', (req, res) => {
  const { index } = req.body;
  if (typeof index === 'number' && index >= 0 && index < cart.length) {
    cart = cart.filter((_, i) => i !== index);
    res.json({ success: true, cart });
  } else {
    res.status(400).json({ success: false, message: 'Índice inválido' });
  }
});

app.post('/cart/apply-coupon', (req, res) => {
  const { code } = req.body;
  if (coupons[code]) {
    appliedCoupon = code;
    res.json({ success: true, discount: coupons[code] });
  } else {
    res.status(400).json({ success: false, message: 'Cupón inválido' });
  }
});


app.post('/cart/confirm', (req, res) => {
  let total = cart.reduce((sum, p) => sum + p.price, 0);
  if (appliedCoupon) {
    total = total - total * coupons[appliedCoupon];
  }
  lastOrder = { cart: [...cart], total, coupon: appliedCoupon };
  cart = [];
  appliedCoupon = null;
  res.json({ success: true, total });
});

// Simulación de validación de pago
app.post('/api/validate-payment', (req, res) => {
  const { cardNumber, amount } = req.body;
  // Simulación simple: si el número de tarjeta termina en par, es válido
  if (cardNumber && typeof cardNumber === 'string' && cardNumber.length >= 4) {
    const lastDigit = parseInt(cardNumber.slice(-1));
    if (!isNaN(lastDigit) && lastDigit % 2 === 0) {
      res.json({ success: true, message: 'Pago validado correctamente' });
    } else {
      res.status(400).json({ success: false, message: 'Pago rechazado por el banco' });
    }
  } else {
    res.status(400).json({ success: false, message: 'Datos de tarjeta inválidos' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
