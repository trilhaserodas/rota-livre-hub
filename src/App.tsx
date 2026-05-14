/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import Converter from './pages/Converter';
import Clock from './pages/Clock';
import Map from './pages/Map';
import Calculators from './pages/Calculators';
import Blog from './pages/Blog';
import AlertHub from './pages/AlertHub';
import WeatherHub from './pages/WeatherHub';
import Admin from './pages/Admin';
import RoutesPage from './pages/Routes';
import CarreteraAustral from './pages/CarreteraAustral';
import About from './pages/About';
import AirTravel from './pages/AirTravel';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/conversor" element={<Converter />} />
            <Route path="/horarios" element={<Clock />} />
            <Route path="/mapa" element={<Map />} />
            <Route path="/calculadoras" element={<Calculators />} />
            <Route path="/rotas" element={<RoutesPage />} />
            <Route path="/rotas/carretera-austral" element={<CarreteraAustral />} />
            <Route path="/aviao" element={<AirTravel />} />
            <Route path="/alert-hub" element={<AlertHub />} />
            <Route path="/alert-hub/clima" element={<WeatherHub />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/termos" element={<Terms />} />
            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Layout>
      </Router>
    </HelmetProvider>
  );
}
