import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { Layout } from './components/layout/Layout';
import { useQueryClient } from '@tanstack/react-query';
import api from './lib/axios';

const Login = lazy(()=> import('./features/auth/Login'));
const Dashboard = lazy(()=> import('./features/dashboard/Dashboard'));
const ProductList = lazy(()=> import('./features/products/ProductList'));
const ProductForm = lazy(()=> import('./features/products/ProductForm'));
const BulkEntry = lazy(()=> import('./features/products/BulkEntry'));
const SalesList = lazy(()=> import('./features/sales/SalesList'));
const SaleForm = lazy(()=> import('./features/sales/SaleForm'));
const UsersList = lazy(()=> import('./features/users/UsersList'));
const UserForm = lazy(()=> import('./features/users/UserForm'));
const Profile = lazy(()=> import('./features/profile/Profile'));
const AuditLogs = lazy(()=> import('./features/audit/AuditLogs'));
const SystemPanel = lazy(()=> import('./features/system/SystemPanel'));
const Messages = lazy(()=> import('./features/messages/Messages'));

function Protected({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="h-7 w-7 rounded-full border-2 border-border border-t-foreground animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="h-7 w-7 rounded-full border-2 border-border border-t-foreground animate-spin" /></div>;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function PrefetchOnNav() {
  const qc = useQueryClient();
  const loc = useLocation();
  useEffect(()=>{
    if (loc.pathname.startsWith('/products')) {
      qc.prefetchQuery({ queryKey:['products',{search:'',status:'',page:1,sortBy:'createdAt',sortOrder:'desc'}], queryFn: async()=> (await api.get('/products',{params:{limit:20,page:1}})).data, staleTime: 1000*60*2 });
    }
    if (loc.pathname.startsWith('/sales')) {
      qc.prefetchQuery({ queryKey:['sales',1], queryFn: async()=> (await api.get('/sales',{params:{limit:20,page:1}})).data, staleTime:1000*60*2 });
    }
    if (loc.pathname.startsWith('/users')) {
      qc.prefetchQuery({ queryKey:['users',''], queryFn: async()=> (await api.get('/users',{params:{limit:50}})).data, staleTime:1000*60*2 });
    }
  },[loc.pathname, qc]);
  return null;
}

function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded-[10px]" />
      <div className="h-[120px] bg-muted rounded-[14px]" />
      <div className="h-[300px] bg-muted rounded-[14px]" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <PrefetchOnNav />
          <Routes>
            <Route path="/login" element={
              <PublicOnly>
                <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="h-7 w-7 rounded-full border-2 border-border border-t-foreground animate-spin" /></div>}>
                  <Login/>
                </Suspense>
              </PublicOnly>
            } />

            <Route element={<Protected><Layout/></Protected>}>
              <Route path="/" element={<Protected roles={['admin','super_admin']}><Suspense fallback={<PageSkeleton/>}><Dashboard/></Suspense></Protected>} />
              <Route path="/products" element={<Suspense fallback={<PageSkeleton/>}><ProductList/></Suspense>} />
              <Route path="/products/new" element={<Suspense fallback={<PageSkeleton/>}><ProductForm/></Suspense>} />
              <Route path="/products/bulk" element={<Suspense fallback={<PageSkeleton/>}><BulkEntry/></Suspense>} />
              <Route path="/products/edit/:id" element={<Suspense fallback={<PageSkeleton/>}><ProductForm/></Suspense>} />
              <Route path="/sales" element={<Suspense fallback={<PageSkeleton/>}><SalesList/></Suspense>} />
              <Route path="/sales/new" element={<Suspense fallback={<PageSkeleton/>}><SaleForm/></Suspense>} />
              <Route path="/messages" element={<Suspense fallback={<PageSkeleton/>}><Messages/></Suspense>} />
              <Route path="/users" element={<Protected roles={['admin','super_admin']}><Suspense fallback={<PageSkeleton/>}><UsersList/></Suspense></Protected>} />
              <Route path="/users/new" element={<Protected roles={['admin','super_admin']}><Suspense fallback={<PageSkeleton/>}><UserForm/></Suspense></Protected>} />
              <Route path="/users/:id" element={<Protected roles={['admin','super_admin']}><Suspense fallback={<PageSkeleton/>}><UserForm/></Suspense></Protected>} />
              <Route path="/audit" element={<Protected roles={['super_admin']}><Suspense fallback={<PageSkeleton/>}><AuditLogs/></Suspense></Protected>} />
              <Route path="/system" element={<Protected roles={['super_admin']}><Suspense fallback={<PageSkeleton/>}><SystemPanel/></Suspense></Protected>} />
              <Route path="/profile" element={<Suspense fallback={<PageSkeleton/>}><Profile/></Suspense>} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
