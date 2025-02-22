import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/auth/register";
import Login from "./pages/auth/login";
import Verify from "./pages/auth/verify";
import ForgotPassword from "./pages/auth/forgotpassword";
import ResetPassword from "./pages/auth/resetpassword";
import Home from "./pages/home/home";
import AddCompanies from "./pages/features/addCompanies";
import Investment from "./pages/features/investments";
import Explore from "./pages/features/explore";
import CompanyAnalysis from "./pages/features/company-analysis";
import AlertBreadCrumb from "./pages/alerts/alert-breadcrumb";
import Portfolio from "./pages/features/portfolio";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:token" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/add-companies" element={<AddCompanies />} />
        <Route path="/investments" element={<Investment />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/company/:companyName" element={<CompanyAnalysis />} />
        <Route path="/alert-breadCrumb" element={<AlertBreadCrumb/>} />
        <Route path="/portfolio" element={<Portfolio/>} />
      </Routes>
    </Router>
  );
}

export default App;
