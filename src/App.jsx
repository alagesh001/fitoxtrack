import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./Login";
import GymList from "./GymList";
import SettingScreen from "./settingScreen";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomeScreen from "./HomeScreen";
import ActiveClients from "./ActiveClients";
import AddMemberScreen from "./AddMemberScreen";
import TrainerList from "./TrainerList";
import InactiveClients from "./InactiveClients";
import LeadData from "./LeadData";
import HappyBirthdayImageGenerator from "./Generator";


import AIWorkoutCardGenerator from "./Aiworkoutcard";
import AIDietChartGenerator from "./Aidietchart2";
import TransformationImageGenerator from "./AiTransform";

import InstallPage from "./InstallPage";
import TransactionHistory from "./TransactionHistory";
import DashboardAdmin from "./DashboardAdmin";
import AnalyticsScreen from "./AnalyticsScreen";
import GymRegistration from "./NewRegisterscreen";
import EnquireGym from "./enquirenow";
import AddLeadHere from "./addlead";
import BiometricDashboard from "./biometricdash";
import Fitoxhub from "./Fitoxhub";
import AIhubHere from "./AiHub";
import GymOfferCanvasOne from "./AiOfferGen";

import ImageCropper from "./ImageCropper";


import BicepCurlFormCorrector from "./BicepForm";
import SquatFormCorrector from "./Squatform";
import LiveSkeletonTracker from "./analyzers/LateralRise";
import LiveSkeletonTrackerSide from "./analyzers/Formtrackside";
import SpeedDetect from "./CameraRecorder";

// import SquatFormCorrector from "./analyzers/SquatFormTrack";
// import LiveSkeletonTracker from "./analyzers/FrontFormTrack";
// import LiveSkeletonTrackerSide from "./analyzers/SideFormTrack";

function App() {
  // Helper function to check standalone mode
  const isRunningStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const [isStandalone, setIsStandalone] = useState(isRunningStandalone);

  useEffect(() => {
    setIsStandalone(isRunningStandalone);
  }, []);

  return (
    <Router basename="/tennisx">
        <ToastContainer
        position="top-center"
        autoClose={1500} // close after 3 seconds
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Root route renders dynamically based on standalone mode */}
        <Route path="/" element={isStandalone ? <Login /> : <Login />} />
        <Route path="/login" element={<Login />} />
                <Route path="/GymList" element={<GymList />} />
                <Route path="/home" element={<HomeScreen />} />
                <Route path="/settings" element={<SettingScreen />} />
                <Route path="/activeClients" element={<ActiveClients />} />
        <Route path="/add-member" element={<AddMemberScreen />} />
        <Route path="/trainer-list" element={<TrainerList />} />
        <Route path="/transac-hist" element={<TransactionHistory />} />
        <Route path="/dash-admin" element={<DashboardAdmin />} />
        <Route path="/analytics-screen" element={<AnalyticsScreen />} />
        <Route path="/inactive-screen" element={<InactiveClients />} />
        <Route path="/register-screen" element={<GymRegistration />} />
        <Route path="/enquire_now" element={<EnquireGym />} />
        <Route path="/lead_data" element={<LeadData />} />
        <Route path="/add_lead" element={<AddLeadHere />} />
        <Route path="/install_page" element={<InstallPage />} />
        <Route path="/bio-dash" element={<BiometricDashboard />} />
         <Route path="/fitox-hub" element={<Fitoxhub />} /> 
                <Route path="/workout-ai" element={<AIWorkoutCardGenerator />} />
                <Route path="/birthday-ai" element={<HappyBirthdayImageGenerator />} />
                <Route path="/offer-ai" element={<GymOfferCanvasOne />} />
                <Route path="/diet-ai" element={<AIDietChartGenerator />} />
                {/* <Route path="/transform-ai" element={<ImageCropper />} /> */}
    

                <Route path="/ai-hub" element={<AIhubHere />} />
                <Route path="/transform-ai" element={<TransformationImageGenerator />} />

                            <Route path="/bicep-ai" element={<BicepCurlFormCorrector />} />
                <Route path="/squat-ai" element={<SquatFormCorrector />} />
                                <Route path="/lateral-ai" element={<LiveSkeletonTracker />} />
                        <Route path="/lateralside-ai" element={<LiveSkeletonTrackerSide />} />
                                                    <Route path="/speed-ai" element={<SpeedDetect />} />




      </Routes>
    </Router>
    
  );
}

export default App;
