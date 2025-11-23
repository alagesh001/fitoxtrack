import React, { useState } from "react";
import './index.css';
import appIcon from './assets/ftox_icon.png'; // Import app icon
import bkIcon from './assets/bookmark.svg';
import feature1 from './assets/home.png';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

 import feature2 from './assets/analyticsscreen.png';

 import feature3 from './assets/active.png';

 import feature4 from './assets/transac.png';

import { X } from "lucide-react";

function InstallPage() {
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
      const navigate = useNavigate();
  const [installPromptShown, setInstallPromptShown] = useState(false); // Track if the prompt is shown
  const [showInstallPopup, setShowInstallPopup] = useState(false);

const features = [
  { title: "Home", image: feature1 },
  { title: "Analytics", image: feature2 },
  { title: "Active Clients", image: feature3 },
  { title: "Transaction", image: feature4 },
];
    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedInWeb");
        const roleType = localStorage.getItem("type");

        if (isLoggedIn === "true") {
            if(roleType == 1){
                navigate("/dashboard"); // Redirect to Dashboard

              }else{
                navigate("/dashboard_diet"); // Redirect to Dashboard

              }        }
      }, []);
  useEffect(() => {
 const ua = navigator.userAgent.toLowerCase();
const isIOS =
  /iphone|ipad|ipod/.test(ua) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

if (isIOS) {
  setShowInstallPopup(true);

  // navigate("/login", { replace: true });
  return;
}
   const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;

    if (isStandalone) {
      navigate("/login", { replace: true });
      return; // Exit early to avoid other logic
    }
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };



    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [navigate]);
    const handleInstallClick = async () => {
   
if(!deferredPrompt){
     navigate("/login", { replace: true });
     return;
}
    deferredPrompt.prompt(); // Show the install prompt
 setInstallPromptShown(true);
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
             setInstallPromptShown(false);
    setInstalling(true);

  setTimeout(() => {
        setInstalling(false);
    setInstalled(true);     // Reset installed after 3 seconds (3000 ms)
  }, 5000);
    } else {
      console.log("User dismissed the install prompt");
       setInstallPromptShown(false);
    }
    setDeferredPrompt(null); // Clear the saved event
  };
    // const handleInstallClick = async () => {
    //   if (deferredPrompt) {
    //     deferredPrompt.prompt();
    //     const { outcome } = await deferredPrompt.userChoice;
    //     if (outcome === 'accepted') {
    //       console.log('User accepted the install prompt');
    //     } else {
    //       console.log('User dismissed the install prompt');
    //     }
    //     setDeferredPrompt(null);
    //     setShowInstallButton(false);
    //   }
    // };
// const handleInstalld = async () => {
//   if (deferredPrompt) {
//     setInstalling(true);
//     deferredPrompt.prompt();

//     const result = await deferredPrompt.userChoice;
//     if (result.outcome === "accepted") {
//       console.log("User accepted the PWA install prompt");
//       setInstalled(true);
//     } else {
//       console.log("User dismissed the PWA install prompt");
//     }

//     setInstalling(false);
//     deferredPrompt = null; // clear it after use
//   } else {
//     console.log("Install prompt not available");
//     alert("App install prompt is not available right now.");
//   }
// };

  return (
<div className="min-h-screen bg-white text-gray-800 p-6 font-sans w-full  ">
   {showInstallPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full relative">
            {/* Close */}
            <button
              onClick={() => setShowInstallPopup(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img
                src={appIcon}
                alt="App Logo"
                className="w-16 h-16 rounded-xl shadow"
              />
            </div>

            <h2 className="text-xl font-semibold text-center mb-2">
              Add to Home Screen
            </h2>
            <p className="text-gray-600 text-sm text-center">
              To install this app on your iPhone or iPad:
            </p>
          <div className="flex justify-center">
  <ol className="text-gray-700 text-sm mt-3 space-y-2 text-left">
    <li>
      1. Tap the <span className="font-medium">Share</span> button in Safari.
    </li>
    <li>
      2. Scroll down and select{" "}
      <span className="font-medium">Add to Home Screen</span>.
    </li>
    <li>
      3. Confirm by tapping <span className="font-medium">Add</span>.
    </li>
  </ol>
</div>

            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setShowInstallPopup(false)}
                className="px-4 py-2 bg-green-700 text-white rounded-xl shadow hover:bg-green-800 transition"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
<div className="w-full flex items-start space-x-4">
        <img
          src={appIcon} // Use local image
          alt="App Icon"
          className="w-20 h-20 rounded-lg"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-medium">Fitox Admin - Gym Management</h1>
          <p className="text-green-600 mt-4 font-semibold">Productivity App</p>
        </div>
      </div>

      <div className="flex justify-center items-center w-full mt-1 pt-6 text-center text-sm divide-x divide-gray-300">
        <div className="flex-1 py-1">
          <p className="font-bold">4.7★</p>
<p className="text-xs text-gray-500">48.7K reviews</p>
        </div>
        <div className="flex-1  py-1">
          <p className="font-bold">100K+</p>
          <p className="text-xs text-gray-500">Downloads</p>
        </div>
        <div className="flex-1 py-1">
          <span className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs">18</span>
          <p className="text-xs text-gray-500 mt-1">Rated for 18+</p>
        </div>
      </div>

      <button
  onClick={installed ? () =>  navigate("/login", { replace: true }) : handleInstallClick}
  disabled={installing}
  className={`mt-6 w-full bg-green-700 hover:bg-green-800 text-white py-2 px-2 rounded-lg text-base font-bold ${installing ? 'opacity-50 cursor-not-allowed' : ''}`}
>
 {installed
            ? "Open"
            : installing
            ? installPromptShown
              ? "Confirm Install"
              : "Installing..."
            : "Install"}</button>

    <button className="mt-2 text-green-700 text-sm font-medium hover:underline mx-auto block font-semibold flex items-center gap-1">
  <img src={bkIcon} alt="Bookmark" className="w-4 h-4" />
  <span>Add to Wishlist</span>
</button>
 <div className="w-full max-w-2xl py-8">
      <h2 className="text-s font-medium mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6"></path>
        </svg>
        This app is available for your device
      </h2>

<div className="overflow-x-auto sm:overflow-x-visible">
  <div className="grid grid-cols-4 sm:grid-cols-4 gap-8 min-w-[800px] sm:min-w-0">
    {features.map((feature, index) => (
      <div
        key={index}
        className="bg-gradient-to-b from-yellow-500 to-gray-800 rounded-xl p-3 shadow-md min-w-[200px] sm:min-w-0"
      >
        <img
          src={feature.image}
          alt={feature.title}
          className="rounded-lg w-full"
        />
        <div className="mt-2 text-white text-sm font-semibold text-center">
          {feature.title}
        </div>
      </div>
    ))}
  </div>
</div>


    </div>
<div className="mt-4  bg-white text-gray-800 font-sans w-full">
 <section className="flex items-start justify-between">
  <h2 className="text-xl font-semibold">About this app</h2>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
</section>
<p className="mt-6 text-s mt-1">
  Top App in Productivity! Manage your Gym Attendance, Products, Diet and profile.  🔥🔥🔥
</p>

      <section>
        <h3 className="mt-6 font-medium">Updated on</h3>
        <p className="text-s text-gray-500">Aug 27, 2025</p>
      </section>

      <section>
        <h3 className="mt-6 font-medium">Data safety</h3>
        <p className="text-s text-gray-500">
          Developers can show information here about how their app collects and uses your data.
        </p>
      </section>

<section className="mt-6 flex items-center justify-between mb-2">
  <h2 className="text-xl font-semibold">Ratings and reviews</h2>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
</section>
        <p className="mt-6 text-sm text-gray-500">Ratings and reviews are verified</p>

        <div className="mt-4 flex items-center space-x-4">
          <div className="text-5xl font-bold">4.6</div>
          <div className="text-green-600 text-sm">★★★★★</div>
          <p className="text-gray-500 text-sm">48.7K reviews</p>
        </div>

        <div className="mt-6 space-y-4">
          <Review
            name="Sanjay Kumar"
            date="August 30, 2025"
                        comment="Fitox has completely transformed how I run my gym. Managing memberships, payments, and class schedules is now effortless. The dashboard is super clean, and my staff picked it up instantly. Highly recommend!"
          />
          <Review
            name="Rohith"
            date="June 22, 2025"
            comment="Before Fitox, I was juggling spreadsheets and WhatsApp groups. Now everything is in one place — client tracking, attendance, and even reminders."
          />
          <Review
            name="JJ Fitness"
            date="June 19, 2025"
            comment="What I like most about Fitox is how easy it is to onboard new members and manage their memberships. The support team is also quick to respond whenever we have questions. Saves me lots of time every week."
          />
           <Review
            name="Sneha M"
            date="May 19, 2025"
            comment="Fitox is a game-changer for us. Affordable, simple, and powerful. Since switching, cancellations dropped and client engagement went up. Couldn’t imagine running without it now.
"
          />
        </div>
    </div>
    </div>
  );
}
function Review({ name, date, comment }) {
  return (
  <div className="border-t border-gray-200 pt-4">
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-green-600">★★★★★</p>
      <p className="text-xs text-gray-500">{date}</p>
      <p className="mt-1">{comment}</p>
    </div>
  );
}
export default InstallPage;