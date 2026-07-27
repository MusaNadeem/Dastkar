// Route map. Landing + auth + payment are standalone; app screens render inside AppShell
// (role-adaptive nav + footer, warm theme).
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import DevPanel from './pages/DevPanel.jsx';
import Login from './pages/Login.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import RoleSelect from './pages/RoleSelect.jsx';
import Account from './pages/Account.jsx';
import AppShell from './components/app/AppShell.jsx';
import Catalog from './pages/Catalog.jsx';
import Product from './pages/Product.jsx';
import Shop from './pages/Shop.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import MockPayment from './pages/MockPayment.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import MyOrders from './pages/MyOrders.jsx';
import SellerOnboarding from './pages/SellerOnboarding.jsx';
import CustomOrderRequest from './pages/CustomOrderRequest.jsx';
import BuyerCustomOrder from './pages/BuyerCustomOrder.jsx';
import SellerDashboard from './pages/SellerDashboard.jsx';
import AddEditProduct from './pages/AddEditProduct.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import Legal from './pages/Legal.jsx';

export default function App() {
  return (
    <Routes>
      {/* Marketing + auth + payment (no app shell) */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/role" element={<RoleSelect />} />
      <Route path="/dev" element={<DevPanel />} />
      <Route path="/pay/:orderId" element={<MockPayment />} />

      {/* App screens (inside the role-adaptive shell) */}
      <Route element={<AppShell />}>
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/shop/:id" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmed" element={<OrderConfirmation />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/account" element={<Account />} />
        <Route path="/sell/onboarding" element={<SellerOnboarding />} />
        {/* Custom orders */}
        <Route path="/custom/new/:sellerId" element={<CustomOrderRequest />} />
        <Route path="/custom/:id" element={<BuyerCustomOrder />} />
        {/* Seller */}
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller/products/new" element={<AddEditProduct />} />
        <Route path="/seller/products/:id/edit" element={<AddEditProduct />} />
        {/* Admin */}
        <Route path="/admin" element={<AdminPanel />} />
        {/* Legal */}
        <Route path="/legal/:doc" element={<Legal />} />
      </Route>
    </Routes>
  );
}
