import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./Login";
import GymList from "./GymList";
import SettingScreen from "./settingScreen";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomeScreen from "./HomeScreen";
import HappyBirthdayImageGenerator from "./Generator";


import AIWorkoutCardGenerator from "./Aiworkoutcard";
import AIDietChartGenerator from "./Aidietchart2";
import TransformationImageGenerator from "./AiTransform";
import InvoiceGenerator from "./Invoice";


import GymRegistration from "./NewRegisterscreen";
import AIhubHere from "./AiHub";
import GymOfferCanvasOne from "./AiOfferGen";





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
    <Router basename="/fitoxai">
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
        <Route path="/register-screen" element={<GymRegistration />} />
                <Route path="/workout-ai" element={<AIWorkoutCardGenerator />} />
                <Route path="/birthday-ai" element={<HappyBirthdayImageGenerator />} />
                <Route path="/offer-ai" element={<GymOfferCanvasOne />} />
                <Route path="/diet-ai" element={<AIDietChartGenerator />} />
                {/* <Route path="/transform-ai" element={<ImageCropper />} /> */}
                    <Route path="/invoice-ai" element={<InvoiceGenerator />} />


                <Route path="/ai-hub" element={<AIhubHere />} />
                <Route path="/transform-ai" element={<TransformationImageGenerator />} />



      </Routes>
    </Router>
    
  );
}

export default App;
