import { useEffect, useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GlobalStyles from './styles/GlobalStyles';
import AppLayout from './components/layout/AppLayout';
import { routes } from './navigation/routes';
import senzaSDK from './services/senza-sdk';
import appLifecycle, { AppEventType } from './services/app-lifecycle';
import { AppProvider } from './context/AppContext';
import { UserProvider } from './context/UserContext';
import { ContentProvider } from './context/ContentContext';
import { PlayerProvider } from './context/PlayerContext';
import NotFound from './pages/NotFound';
import { initEnvironment } from './utils/environmentValidation';

// Loading component for lazy-loaded routes
const Loading = () => (
  <div style={{ color: 'white', padding: '20px', backgroundColor: '#121212', height: '100vh' }}>
    <h1>Loading...</h1>
    <p>Please wait while the content loads</p>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div style={{ color: 'red', padding: '20px', backgroundColor: '#121212', height: '100vh' }}>
    <h1>Error</h1>
    <p>{error.message}</p>
    <p>Please check the console for more details.</p>
  </div>
);

function App() {
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Initialize environment validation
    initEnvironment();

    const initializeSenzaSDK = async () => {
      try {
        await senzaSDK.initialize();
        setSdkInitialized(true);
        console.log('Senza SDK initialized successfully');
      } catch (err) {
        console.error('Failed to initialize Senza SDK:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize Senza SDK'));
      }
    };

    // Initialize the SDK
    initializeSenzaSDK();

    // Set up application lifecycle event logging
    const unsubscribe = appLifecycle.subscribe(AppEventType.APP_ERROR, (event) => {
      console.error('Application error:', event.data);
      if (event.data?.error) {
        setError(event.data.error);
      }
    });

    // Clean up on component unmount
    return () => {
      unsubscribe();
    };
  }, []);

  if (error) {
    return <ErrorFallback error={error} />;
  }

  if (!sdkInitialized) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <AppProvider>
        <UserProvider>
          <ContentProvider>
            <PlayerProvider>
              <GlobalStyles />
              <Suspense fallback={<Loading />}>
                <AppLayout initialFocus="browse-button">
                  <Routes>
                    {routes.map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={<route.component />}
                      />
                    ))}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </Suspense>
            </PlayerProvider>
          </ContentProvider>
        </UserProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App; 