// src/services/api.js — Complete API layer
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const getToken = () => localStorage.getItem('story_token');

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const handleRes = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

export const authAPI = {
  register:        (b) => fetch(`${BASE}/auth/register`,        { method: 'POST', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  login:           (b) => fetch(`${BASE}/auth/login`,           { method: 'POST', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  me:              ()  => fetch(`${BASE}/auth/me`,              { headers: headers() }).then(handleRes),
  updateMe:        (b) => fetch(`${BASE}/auth/me`,              { method: 'PATCH', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  changePassword:  (b) => fetch(`${BASE}/auth/change-password`, { method: 'PATCH', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  forgotPassword:  (b) => fetch(`${BASE}/auth/forgot`,          { method: 'POST', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  resetPassword:   (b) => fetch(`${BASE}/auth/reset`,           { method: 'POST', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
};

export const productsAPI = {
  list:    (p={}) => fetch(`${BASE}/products?${new URLSearchParams(p)}`, { headers: headers() }).then(handleRes),
  detail:  (slug) => fetch(`${BASE}/products/${slug}`,         { headers: headers() }).then(handleRes),
  related: (slug) => fetch(`${BASE}/products/${slug}/related`, { headers: headers() }).then(handleRes),
};

export const cartAPI = {
  get:    ()       => fetch(`${BASE}/cart`,       { headers: headers() }).then(handleRes),
  add:    (b)      => fetch(`${BASE}/cart`,       { method: 'POST',   headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  update: (id, q)  => fetch(`${BASE}/cart/${id}`, { method: 'PATCH',  headers: headers(), body: JSON.stringify({ quantity: q }) }).then(handleRes),
  remove: (id)     => fetch(`${BASE}/cart/${id}`, { method: 'DELETE', headers: headers() }).then(handleRes),
  clear:  ()       => fetch(`${BASE}/cart`,       { method: 'DELETE', headers: headers() }).then(handleRes),
};

export const ordersAPI = {
  place:  (b)  => fetch(`${BASE}/orders`,              { method: 'POST', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  list:   ()   => fetch(`${BASE}/orders`,              { headers: headers() }).then(handleRes),
  detail: (id) => fetch(`${BASE}/orders/${id}`,        { headers: headers() }).then(handleRes),
  cancel: (id) => fetch(`${BASE}/orders/${id}/cancel`, { method: 'POST', headers: headers() }).then(handleRes),
};

export const wishlistAPI = {
  get:    ()    => fetch(`${BASE}/wishlist`,        { headers: headers() }).then(handleRes),
  add:    (pid) => fetch(`${BASE}/wishlist`,        { method: 'POST',   headers: headers(), body: JSON.stringify({ product_id: pid }) }).then(handleRes),
  remove: (pid) => fetch(`${BASE}/wishlist/${pid}`, { method: 'DELETE', headers: headers() }).then(handleRes),
};

export const couponAPI = {
  apply: (code, subtotal) => fetch(`${BASE}/coupons/apply`, { method: 'POST', headers: headers(), body: JSON.stringify({ code, subtotal }) }).then(handleRes),
};

export const paymentAPI = {
  createOrder: (b) => fetch(`${BASE}/payment/create-order`, { method: 'POST', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  verify:      (b) => fetch(`${BASE}/payment/verify`,       { method: 'POST', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  failed:      (b) => fetch(`${BASE}/payment/failed`,       { method: 'POST', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
};

export const adminAPI = {
  stats:             ()       => fetch(`${BASE}/admin/stats`,                    { headers: headers() }).then(handleRes),
  orders:            (p={})   => fetch(`${BASE}/admin/orders?${new URLSearchParams(p)}`, { headers: headers() }).then(handleRes),
  updateOrderStatus: (id, b)  => fetch(`${BASE}/admin/orders/${id}/status`,      { method: 'PATCH', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  products:          (p={})   => fetch(`${BASE}/admin/products?${new URLSearchParams(p)}`, { headers: headers() }).then(handleRes),
  createProduct:     (b)      => fetch(`${BASE}/admin/products`,                 { method: 'POST',  headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  updateProduct:     (id, b)  => fetch(`${BASE}/admin/products/${id}`,           { method: 'PATCH', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  deleteProduct:     (id)     => fetch(`${BASE}/admin/products/${id}`,           { method: 'DELETE', headers: headers() }).then(handleRes),
  coupons:           ()       => fetch(`${BASE}/coupons`,                        { headers: headers() }).then(handleRes),
  createCoupon:      (b)      => fetch(`${BASE}/coupons`,                        { method: 'POST',  headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  updateCoupon:      (id, b)  => fetch(`${BASE}/coupons/${id}`,                  { method: 'PATCH', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  deleteCoupon:      (id)     => fetch(`${BASE}/coupons/${id}`,                  { method: 'DELETE', headers: headers() }).then(handleRes),
  inventory:         ()       => fetch(`${BASE}/inventory`,                      { headers: headers() }).then(handleRes),
  setStock:          (pid, b) => fetch(`${BASE}/inventory/${pid}`,               { method: 'PUT',   headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  users:             ()       => fetch(`${BASE}/admin/users`,                    { headers: headers() }).then(handleRes),
  updateUserRole:    (id, r)  => fetch(`${BASE}/admin/users/${id}/role`,         { method: 'PATCH', headers: headers(), body: JSON.stringify({ role: r }) }).then(handleRes),
  returns:           ()       => fetch(`${BASE}/returns/admin`,                  { headers: headers() }).then(handleRes),
  updateReturn:      (id, b)  => fetch(`${BASE}/returns/admin/${id}`,            { method: 'PATCH', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
};

export const addressAPI = {
  list:   ()    => fetch(`${BASE}/addresses`,        { headers: headers() }).then(handleRes),
  add:    (b)   => fetch(`${BASE}/addresses`,        { method: 'POST',   headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  update: (id,b)=> fetch(`${BASE}/addresses/${id}`,  { method: 'PATCH',  headers: headers(), body: JSON.stringify(b) }).then(handleRes),
  remove: (id)  => fetch(`${BASE}/addresses/${id}`,  { method: 'DELETE', headers: headers() }).then(handleRes),
};

export const returnsAPI = {
  myList:  ()   => fetch(`${BASE}/returns/my`,  { headers: headers() }).then(handleRes),
  request: (b)  => fetch(`${BASE}/returns`,     { method: 'POST', headers: headers(), body: JSON.stringify(b) }).then(handleRes),
};

export const newsletterAPI = {
  subscribe: (email) => fetch(`${BASE}/newsletter`, { method: 'POST', headers: headers(), body: JSON.stringify({ email }) }).then(handleRes),
};

// Upload helper — returns imageUrl
export async function uploadProductImage(file, productId) {
  const fd = new FormData();
  fd.append('image', file);
  if (productId) fd.append('product_id', productId);
  const res = await fetch(`${BASE}/upload/product-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.url;
}
