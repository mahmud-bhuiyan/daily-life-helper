import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/home/HomePage';

/**
 * Route table — keep routes only here, no providers.
 * Step 02+: public (/login), protected (dashboard, expenses), admin (/admin/*).
 */
const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
