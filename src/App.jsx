import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./Login";
import GymList from "./GymList";
import SettingScreen from "./settingScreen";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomeScreen from "./HomeScreen";
import CoachingList from "./analyzers/CoachList";




import HomeTennisX from "./HomeTx";

import InstallPage from "./InstallPage";

import GymRegistration from "./NewRegisterscreen";

import AIhubHere from "./AiHub";
import StrokeCorrectTracker from "./analyzers/StrokeCorrector";

import ImageCropper from "./ImageCropper";


import LiveSkeletonTracker from "./analyzers/LateralRise";
import ServeSpeedTool from "./analyzers/SpeedDet";

import VideoPoseSingleScreen from "./analyzers/UploadMotionT";

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
    <Router basename="/">
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
        <Route path="/" element={isStandalone ? <HomeTennisX /> : <HomeTennisX />} />
        <Route path="/login" element={<Login />} />
                <Route path="/GymList" element={<GymList />} />
                <Route path="/home" element={<HomeScreen />} />
                <Route path="/settings" element={<SettingScreen />} />
                               <Route path="/coach_list" element={<CoachingList />} />

        <Route path="/register-screen" element={<GymRegistration />} />
               <Route path="/home-screen" element={<HomeTennisX />} />

        <Route path="/install_page" element={<InstallPage />} />
              
    

                <Route path="/ai-hub" element={<AIhubHere />} />

                <Route path="/speedd-ai" element={<ServeSpeedTool />} />
                            <Route path="/upload-ai" element={<VideoPoseSingleScreen />} />
                            <Route path="/stroke-ai" element={<StrokeCorrectTracker />} />

                                <Route path="/lateral-ai" element={<LiveSkeletonTracker />} />




      </Routes>
    </Router>
    
  );
}

export default App;
