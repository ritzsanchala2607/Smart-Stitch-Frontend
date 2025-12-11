import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <AppRoutes />
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
