import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { SocketProvider } from './context/SocketContext';
import { useAppDispatch } from './app/hooks';
import { getMe } from './features/auth/authSlice';

import Navbar from './components/Layout/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import GigList from './components/Gigs/GigList';
import GigDetail from './components/Gigs/GigDetail';
import CreateGig from './components/Gigs/CreateGig';
import MyGigs from './components/Gigs/MyGigs';
import MyBids from './components/Bids/MyBids';

function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if user is already logged in
    dispatch(getMe());
  }, [dispatch]);

  return (
    <Router>
      <SocketProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/"
              element={
                <PrivateRoute>
                  <GigList />
                </PrivateRoute>
              }
            />

            <Route
              path="/gigs/:id"
              element={
                <PrivateRoute>
                  <GigDetail />
                </PrivateRoute>
              }
            />

            <Route
              path="/create-gig"
              element={
                <PrivateRoute>
                  <CreateGig />
                </PrivateRoute>
              }
            />

            <Route
              path="/my-gigs"
              element={
                <PrivateRoute>
                  <MyGigs />
                </PrivateRoute>
              }
            />

            <Route
              path="/my-bids"
              element={
                <PrivateRoute>
                  <MyBids />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </SocketProvider>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
