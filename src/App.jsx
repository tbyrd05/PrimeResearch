import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Detail from './pages/Detail';
import LabResults from './pages/LabResults';
import Support from './pages/Support';
import Cart from './pages/Cart';
import ProtectedRoute from './components/ProtectedRoute';
import OwnerRoute from './components/OwnerRoute';
import Orders from './pages/Orders';
import Account from './pages/Account';
import OwnerAnalytics from './pages/OwnerAnalytics';
import ShippingPolicy from './pages/ShippingPolicy';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundReturn from './pages/RefundReturn';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
        <Route path="/detail/:id" element={<ProtectedRoute><Detail /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/lab-results" element={<ProtectedRoute><LabResults /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/support/shipping-policy" element={<ProtectedRoute><ShippingPolicy /></ProtectedRoute>} />
        <Route path="/support/terms-and-conditions" element={<ProtectedRoute><TermsConditions /></ProtectedRoute>} />
        <Route path="/support/privacy-policy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
        <Route path="/support/refund-and-return" element={<ProtectedRoute><RefundReturn /></ProtectedRoute>} />
        <Route path="/owner/analytics" element={<OwnerRoute><OwnerAnalytics /></OwnerRoute>} />
        <Route path="/owner/orders" element={<OwnerRoute><Orders /></OwnerRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
