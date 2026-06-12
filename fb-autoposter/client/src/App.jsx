import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import GroupsLibraryPage from './pages/GroupsLibraryPage';
import ProfilesPage from './pages/ProfilesPage';
import DailyReportPage from './pages/DailyReportPage';

export default function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<OverviewPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="/groups-library" element={<GroupsLibraryPage />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/reports" element={<DailyReportPage />} />
        </Routes>
      </ProfileProvider>
    </BrowserRouter>
  );
}
