import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import CampusSelection from './pages/CampusSelection'; // <-- Import halaman baru
import Home from './pages/Home';
import FoodDetail from './pages/FoodDetail';
import GalleryDetail from './pages/GalleryDetail';
import RatingForm from './pages/RatingForm';
import ReviewSuccess from './pages/ReviewSuccess';
import MapDirection from './pages/MapDirection';
import Favorites from './pages/Favorites';
import AddSpot from './pages/AddSpot';
import Profile from './pages/Profile';
import MyReviews from './pages/MyReviews';
import SubmissionStatus from './pages/SubmissionStatus';
import ChangePassword from './pages/ChangePassword';
import LocationSettings from './pages/LocationSettings';
import HelpCenter from './pages/HelpCenter';
import AboutPrivacy from './pages/AboutPrivacy';
import EditProfile from './pages/EditProfile';
import AddReview from './pages/AddReview';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/select-campus" element={<CampusSelection />} /> {/* <-- Jalur Kampus */}
        <Route path="/home" element={<Home />} />
        <Route path="/detail" element={<FoodDetail />} />
        <Route path="/gallery-detail" element={<GalleryDetail />} />
        <Route path="/give-rating" element={<RatingForm />} />
        <Route path="/review-success" element={<ReviewSuccess />} />
        <Route path="/map-direction" element={<MapDirection />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/add-spot" element={<AddSpot />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-reviews" element={<MyReviews />} />
        <Route path="/submission-status" element={<SubmissionStatus />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/location-settings" element={<LocationSettings />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/about-privacy" element={<AboutPrivacy />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/location-settings" element={<LocationSettings />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/about-privacy" element={<AboutPrivacy />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/add-review" element={<AddReview />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;