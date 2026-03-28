import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { ShopProvider } from './context/ShopContext';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <ShopProvider>
        <RouterProvider router={router} />
        <Toaster 
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: 'Cairo, sans-serif',
              direction: 'rtl',
            },
          }}
        />
      </ShopProvider>
    </ErrorBoundary>
  );
}
