import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SearchProvider>
            <AppRoutes />
          </SearchProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
