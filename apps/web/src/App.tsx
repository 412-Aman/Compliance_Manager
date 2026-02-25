import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import AlertDetail from './pages/AlertDetail';
import Regulatory from './pages/Regulatory';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Layout from './components/Layout';

import RedirectionOverlay from './components/RedirectionOverlay';

function App() {
  return (
    <BrowserRouter>
      {/* 🚀 GLOBAL REDIRECT OVERLAY */}
      <RedirectionOverlay />

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="alerts/:id" element={<AlertDetail />} />
          <Route path="regulatory" element={<Regulatory />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
