

import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  useEffect(() => {
    window.onbeforeunload = () => 'Recargar la página perderá los productos del carrito.';
    setAppliedCoupon(null);
    return () => { window.onbeforeunload = null; };
  }, []);
  function removeCoupon() {
    setAppliedCoupon(null);
    setCoupon('');
    setDiscount(0);
  }
  const [showPayment, setShowPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  function removeFromCart(index) {
    fetch('http://localhost:4000/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCart(data.cart);
        }
      });
  }
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch('http://localhost:4000/products')
      .then(res => res.json())
      .then(setProducts);
    fetchCart();
  }, []);

  function fetchCart() {
    fetch('http://localhost:4000/cart')
      .then(res => res.json())
      .then(data => {
        setCart(data.cart);
        setAppliedCoupon(data.appliedCoupon);
      });
  }

  function addToCart(productId) {
    fetch('http://localhost:4000/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setCart(data.cart);
      });
  }

  function applyCoupon() {
    fetch('http://localhost:4000/cart/apply-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: coupon })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAppliedCoupon(coupon);
          setDiscount(data.discount);
        } else {
          alert(data.message);
        }
      });
  }

  function confirmOrder() {
    fetch('http://localhost:4000/cart/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTotal(data.total);
          setShowPayment(true);
        }
      });
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0002', padding: 32 }}>
      <div style={{ background: '#fffbea', color: '#b7791f', borderRadius: 8, padding: '10px 16px', marginBottom: 18, textAlign: 'center', fontWeight: 500 }}>
        ⚠️ Si recargas la página perderás los productos del carrito y el estado de la tienda.
      </div>
      <h1 style={{ textAlign: 'center', color: '#2d3748', marginBottom: 32 }}>🛒 Tienda Online</h1>
      <h2 style={{ color: '#4a5568', marginBottom: 12 }}>Productos</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {products.map(p => (
          <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, background: '#f7fafc', borderRadius: 8, padding: '10px 16px' }}>
            <span style={{ color: '#000' }}>{p.name} <span style={{ color: '#718096' }}>${p.price}</span></span>
            <button onClick={() => addToCart(p.id)} style={{ background: '#3182ce', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer' }}>Agregar</button>
          </li>
        ))}
      </ul>
      <h2 style={{ color: '#4a5568', margin: '24px 0 12px' }}>Carrito</h2>
      {cart.length === 0 ? (
        <div style={{ color: '#a0aec0', marginBottom: 12 }}>El carrito está vacío.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {cart.map((p, i) => (
            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, background: '#edf2f7', borderRadius: 8, padding: '8px 14px' }}>
              <span style={{ color: '#000' }}>{p.name}</span>
              <span style={{ color: '#000' }}>${p.price}</span>
              <button onClick={() => removeFromCart(i)} style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginLeft: 10, cursor: 'pointer' }}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
      <div style={{ margin: '24px 0 12px', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Cupón"
          value={coupon}
          onChange={e => setCoupon(e.target.value)}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #cbd5e0', marginRight: 10, flex: 1 }}
        />
        <button onClick={applyCoupon} style={{ background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}>Aplicar cupón</button>
        {appliedCoupon && (
          <span style={{ marginLeft: 14, color: '#38a169', fontWeight: 500 }}>
            Cupón aplicado: {appliedCoupon}
            <button onClick={removeCoupon} style={{ marginLeft: 8, background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}>Quitar cupón</button>
          </span>
        )}
      </div>
      <button onClick={confirmOrder} style={{ background: '#2d3748', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 0', width: '100%', fontSize: 18, cursor: 'pointer', marginTop: 18 }}>Confirmar pedido</button>
      {showPayment && (
        <div style={{ marginTop: 28, textAlign: 'center', background: '#f7fafc', borderRadius: 8, padding: 18 }}>
          <h3 style={{ color: '#3182ce', marginBottom: 8 }}>Pago</h3>
          <p style={{ fontSize: 18, color: '#000' }}>Total a pagar: <span style={{ fontWeight: 600 }}>${total}</span></p>
          <input
            type="text"
            placeholder="Número de tarjeta"
            value={cardNumber}
            onChange={e => setCardNumber(e.target.value)}
            style={{ padding: '8px', borderRadius: 6, border: '1px solid #cbd5e0', marginRight: 10, width: '60%' }}
          />
          <button
            onClick={() => {
              fetch('http://localhost:4000/api/validate-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardNumber, amount: total })
              })
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                    setPaymentStatus('success');
                    setConfirmed(true);
                    setShowPayment(false);
                  } else {
                    setPaymentStatus('error');
                  }
                })
                .catch(() => setPaymentStatus('error'));
            }}
            style={{ background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', marginTop: 10 }}
          >Pagar</button>
          {paymentStatus === 'success' && (
            <div style={{ color: '#38a169', marginTop: 12 }}>¡Pago validado y pedido confirmado!</div>
          )}
          {paymentStatus === 'error' && (
            <div style={{ color: '#e53e3e', marginTop: 12 }}>Pago rechazado. Verifica tu tarjeta.</div>
          )}
        </div>
      )}
      {confirmed && !showPayment && (
        <div style={{ marginTop: 28, textAlign: 'center', background: '#f0fff4', borderRadius: 8, padding: 18 }}>
          <h3 style={{ color: '#38a169', marginBottom: 8 }}>¡Pedido confirmado!</h3>
          <p style={{ fontSize: 18 }}>Total pagado: <span style={{ fontWeight: 600 }}>${total}</span></p>
        </div>
      )}
    </div>
  );
}

export default App;
