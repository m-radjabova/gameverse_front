import { FaShoppingCart, FaTrash, FaArrowLeft,  FaTag, FaTruck, FaCreditCard } from 'react-icons/fa';
import { IoBagCheckOutline } from 'react-icons/io5';
import useContextPro from '../../hooks/useContextPro';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import type { Product } from '../../types/types';
import { useState } from 'react';

function CartPage() {
    const { state: { cart }, dispatch } = useContextPro();
    const [isSaving, setIsSaving] = useState(false)
    const toNumber = (value: unknown) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    };

    const formatMoney = (value: unknown) => toNumber(value).toFixed(2);

    const totalPrice = cart.reduce((total, item) => total + toNumber(item.price) * toNumber(item.quantity ?? 1), 0);
    const navigate = useNavigate();

    const deleteProduct = (cart : Product) => {
        if(cart.quantity === 1) {
            dispatch({ type: 'REMOVE_FROM_CART', payload: cart.id });
        }else{
            dispatch({ type: 'DECREASE_QUANTITY', payload: cart.id });
        }
    }

    const handleAddOrder = async () => {
        if (cart.length === 0) return;
        try {
            setIsSaving(true);
            const auth = getAuth();
            const userId = auth.currentUser?.uid || '';
            const orderRef = await addDoc(collection(db, 'orders'), {
                userId,
                totalPrice: totalPrice,
                createdAt: new Date(),
                status: 'pending',
                paymentMethod: 'cash',
                shippingAddress: '',
                notes: '',
                deliveryDate: ''
            });
            for (const item of cart) {
                const priceNum = Number(item.price) || 0;
                const qtyNum = Number(item.quantity ?? 1) || 0;
                await addDoc(collection(db, 'orders', orderRef.id, 'orderProducts'), {
                    productId: String(item.id ?? ""),
                    name: String(item.name ?? ""),
                    imageUrl: item.imageUrl ?? "",
                    description: String(item.description ?? ""),
                    weight: String(item.weight ?? ""),
                    price: priceNum,
                    quantity: qtyNum,
                    totalPrice: priceNum * qtyNum,
                    createdAt: new Date()
                });
            }
            navigate('/cart/order-status');
            dispatch({ type: 'CLEAR_CART' });
        } catch (e) {
            console.error('Failed to place order', e);
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className='cart-page-title'>
                    <h1 >
                        <FaShoppingCart className="cart-title-icon" />
                        Shopping Cart
                    </h1>
                </div>
                
                {cart.length === 0 ? (
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛒</div>
                        <p>Your cart is feeling lonely 😔</p>
                        <div className='orders-btn'>
                            <button 
                            className="continue-shopping-btn"
                            onClick={ () => navigate('/') }
                            >
                                <FaArrowLeft className="btn-icon" />
                                Continue Shopping
                            </button>
                            <button 
                                onClick={ () => navigate('/cart/order-status') } 
                                className="order-status-btn"
                            >
                                <FaTag className="btn-icon" />
                                My orders status
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items">
                            {cart.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <div className="item-image">
                                        <img src={item.imageUrl} alt={item.name} />
                                    </div>
                                    <div className="item-details">
                                        <h2 className="item-name">{item.name}</h2>
                                        <p className="item-description">{item.description}</p>
                                        <div className="price-container">
                                            <span className="current-price">${formatMoney(toNumber(item.price) * toNumber(item.quantity ?? 1))}</span>
                                            {toNumber(item.oldPrice) > toNumber(item.price) && (
                                                <span className="old-price">${formatMoney(toNumber(item.oldPrice) * toNumber(item.quantity ?? 1))}</span>
                                            )}
                                        </div>
                                        <div className="quantity-score">
                                            <button 
                                                className="remove-btn"
                                                onClick={() => dispatch({ type: "REMOVE_FROM_CART", payload: item.id })}
                                            >
                                                <FaTrash className="btn-icon" />
                                                Remove
                                            </button>
                                            <div className="quantity-container">
                                                <button
                                                    className="quantity-add"
                                                    onClick={() => deleteProduct(item)}
                                                >-</button>
                                                <h2 className="quantity">
                                                    {item.quantity}
                                                </h2>
                                                <button
                                                    className="quantity-add"
                                                    onClick={() => dispatch({ type: "INCREASE_QUANTITY", payload: item.id })}
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="cart-summary">
                            <div className="summary-card">
                                <h3>
                                    <IoBagCheckOutline className="summary-icon" />
                                    Order Summary
                                </h3>
                                <div className="summary-line">
                                    <span>Items ({cart.length})</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="summary-line total">
                                    <span>Total Amount</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="checkout-btn-container">
                                    <button
                                        className={`checkout-btn ${isSaving ? "saving" : ""}`}
                                        onClick={handleAddOrder}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="spinner"></div>
                                            </>
                                        ) : (
                                            <>
                                                <FaCreditCard className="btn-icon" />
                                                Order
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className="checkout-btn"
                                        onClick={() => navigate('/cart/delivery')}
                                    >
                                        <FaTruck className="btn-icon" />
                                        Delivery
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CartPage;