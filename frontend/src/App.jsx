import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserReadinessPage from './pages/AdminUserReadinessPage';
import AdminLogin from './pages/AdminLogin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import ReadinessPage from './pages/ReadinessPage';
import AttemptHistoryPage from './pages/AttemptHistoryPage';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
        <Switch>
          <ProtectedRoute exact path="/admin" component={AdminDashboard} adminOnly={true} layout={AdminLayout} />
          <ProtectedRoute exact path="/admin/overview" component={AdminDashboard} adminOnly={true} layout={AdminLayout} />
          <ProtectedRoute exact path="/admin/assessments" component={AdminDashboard} adminOnly={true} layout={AdminLayout} />
          <ProtectedRoute exact path="/admin/users/:id/readiness" component={AdminUserReadinessPage} adminOnly={true} layout={AdminLayout} />
          <ProtectedRoute exact path="/admin/users" component={AdminDashboard} adminOnly={true} layout={AdminLayout} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <ProtectedRoute path="/dashboard" component={Dashboard} layout={UserLayout} userOnly={true} />
          <ProtectedRoute path="/quiz/:id" component={QuizPage} userOnly={true} />
          <ProtectedRoute path="/results/:id" component={ResultsPage} layout={UserLayout} userOnly={true} />
          <ProtectedRoute path="/results" component={ResultsPage} layout={UserLayout} userOnly={true} />
          <ProtectedRoute path="/readiness" component={ReadinessPage} layout={UserLayout} userOnly={true} />
          <ProtectedRoute path="/history" component={AttemptHistoryPage} layout={UserLayout} userOnly={true} />
          <ProtectedRoute path="/profile" component={Profile} layout={UserLayout} userOnly={true} />
          <Route path="/" exact component={LandingPage} />
          <Route path="*" component={NotFound} />
        </Switch>
        </AuthProvider>
        <ToastContainer position="top-right" autoClose={2800} newestOnTop pauseOnFocusLoss theme="colored" />
      </ThemeProvider>
    </Router>
  );
};

export default App;
