import '../src/index.css';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';

// This is a minimal Next.js wrapper around our React application
function MyApp() {
  // When using Next.js in a static export, we need to check if we're running in the browser
  if (typeof window === 'undefined') {
    return null;
  }
  
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default MyApp;
