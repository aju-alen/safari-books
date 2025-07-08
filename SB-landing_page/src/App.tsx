import { createBrowserRouter, RouterProvider, Outlet, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header';
import Footer from './components/Footer';
import { lazy, Suspense } from 'react';
import Error404 from './pages/Error404';




const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideNavBarPages = ['/'];
  const hideFooterPages = ['/'];
  const isDynamicRoute = (path:string) => /^\/user-survey\/.+$/.test(path);
  const shouldHideNavBar = hideNavBarPages.includes(location.pathname) || isDynamicRoute(location.pathname);
  const shouldHideFooter = hideFooterPages.includes(location.pathname) || isDynamicRoute(location.pathname);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", maxWidth: "100vw" }}>
      {!shouldHideNavBar && <Header />}
      <div style={{ flex: 1 }}>
        {children}
      </div>
     {!shouldHideFooter && <Footer />}  
       </div>
  );
};

const Home = lazy(() => import('./pages/Home'));
const DeleteAccountGuide = lazy(() => import('./pages/DeleteAccountGuide'));


const App = () => {

  // Function to check if the user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem('dubaiAnalytica-userAccess'); // Change this according to your authentication mechanism
  };

  // const isSuperAdmin = () => {
  //   console.log(JSON.parse(localStorage.getItem('dubaiAnalytica-userAccess')).isSuperAdmin, 'isSuperAdmin in protected routes');
  //   return JSON.parse(localStorage.getItem('dubaiAnalytica-userAccess')).isSuperAdmin; // Change this according to your authentication mechanism
  // };

  // const SuperAdminProtectedRoute = ({ element, ...rest }) => {
  //   if (isSuperAdmin()) {
  //     return element;
  //   } else {
  //     console.log(isSuperAdmin(), 'isSuperAdmin in FINALSprotected routes');
  //     console.log('User is not Super Admin');
  //     return <Navigate to="/404" />;
  //   }
  // };


  // const ProtectedRoute = ({ element, ...rest }) => {
  //   if (isAuthenticated()) {
  //     console.log('User is authenticated');
  //     return element;
  //   } else {
  //     console.log('User is not authenticated');
  //     return <Navigate to="/login" />;
  //   }
  // };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Layout> {/* Render Layout component here */}
        {/* <GoogleAnalytics /> */}
        <Suspense fallback={
          <div style={{
            padding: '20px',
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%'
          }}>
            {/* Header skeleton */}
            <div style={{
              height: '50px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'loading 1.5s infinite',
              borderRadius: '8px',
              marginBottom: '30px'
            }} />

            {/* Kanban board layout */}
            <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', padding: '12px 0' }}>
              {/* Multiple Kanban columns */}
              {[...Array(4)].map((_, columnIndex) => (
                <div key={columnIndex} style={{
                  minWidth: '300px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '16px',
                }}>
                  {/* Column header */}
                  <div style={{
                    height: '24px',
                    width: '60%',
                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'loading 1.5s infinite',
                    borderRadius: '4px',
                    marginBottom: '16px'
                  }} />
                  
                  {/* Kanban cards */}
                  {[...Array(3)].map((_, cardIndex) => (
                    <div key={cardIndex} style={{
                      height: '100px',
                      background: '#ffffff',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '12px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    }}>
                      {/* Card content skeleton */}
                      <div style={{
                        height: '16px',
                        width: '80%',
                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'loading 1.5s infinite',
                        borderRadius: '4px',
                        marginBottom: '12px'
                      }} />
                      <div style={{
                        height: '12px',
                        width: '60%',
                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'loading 1.5s infinite',
                        borderRadius: '4px'
                      }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <style>
              {`
                @keyframes loading {
                  0% { background-position: 200% 0; }
                  100% { background-position: -200% 0; }
                }
              `}
            </style>
          </div>
        }>
          <Outlet />
        </Suspense>
        </Layout>
      ),
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "/delete-account-guide",
          element: <DeleteAccountGuide />,
        },
        {
          path: "/404",
          element: <Error404 /> // Wrap Dashboard inside ProtectedRoute
        },
        {
          path: "*",  // Catch-all route for any unmatched URLs
          element: <Navigate to="/404" />
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
};

export default App;