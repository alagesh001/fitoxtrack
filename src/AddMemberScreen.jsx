import React, { useEffect, useState,useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import { upsertActiveClient,deleteActiveClient } from './helper/indexeddbhelper2';
import upgradeIcon from "./assets/upgrade.png"; // adjust path to match your project
import { showUpgradePopup } from './helper/reuse.js';

const AddMemberScreen = () => {
 const location = useLocation();
  const type = location.state?.type || "add"; // "add" is default
  const client = type != "add" ? location.state?.client : null; // Only set client if editing
    const lastClickTimeRef = useRef(0);

const formatDateToYMD = (date) => {
  return date.toISOString().split("T")[0]; // yyyy-mm-dd
};
    const [name, setName] = useState( type !== "add" && client ? client.name : "");
    const [mob, setMob] = useState( type !== "add" && client ? client.mobile : "");
      const [mode, setMode] = useState("months"); // "months" or "days"
  const [paidDays, setPaidDays] = useState("");
    const [paidmonths, setPaidMonths] = useState("");
const [height, setHeight] = useState(
  type !== "add" && client && client.height != null ? client.height : ""
);   const [weight, setWeight] = useState( type !== "add" && client && client.weight != null ? client.weight : "");
    const [goal, setGoal] = useState(type !== "add" && client && client.goal != null ? client.goal : 1);
        const [gender, setGender] = useState(type !== "add" && client && client.gender != null ? client.gender : "Male");
    const [referredBy, setReferredBy] = useState("");
    const [email, setEmail] = useState(type !== "add" && client ? client.email : ""); // ✅ Added email
    const navigate = useNavigate();

    const [dob, setDob] = useState(type !== "add" && client ? client.dob : "2000-01-01");
const today = new Date();
const defaultFromDate = formatDateToYMD(today);

const [fromDate, setFromDate] = useState(() => {
  if ((type === "renew" || type === "freeze") && client) {
    return client.renewal_date;
  }
  return defaultFromDate;
});

  const [loading, setLoading] = useState(false);

const defaultDob = "2000-01-01"; // already in yyyy-mm-dd
const [amountToBePaid, setAmountToBePaid] = useState(() => {
  if (type === "freeze") return "0";
  if (type === "due" && client) return client.due_amount;
  return "";
});   const [trainers, setTrainers] = useState([]);
const [selectedCoachId, setSelectedCoachId] = useState(
  type !== "add" && client ? client.coachid : trainers[0]?.coachid || -1
);  
const [amountPaid, setAmountPaid] = useState(type === "freeze" ? "0" : "");
      const apiBase = "https://oxadmedia.online";

const [error, setError] = useState(""); // 🔥 Add this
const handleFocus = (e) => {
    setTimeout(() => {
        e.target.scrollIntoView({ block: "center" });
    }, 100);
};
useEffect(() => {
    let lastScroll = 0;

    const handleFocusIn = () => {
        lastScroll = window.scrollY;
    };

    const handleFocusOut = () => {
        // Restore previous scroll after keyboard closes
        setTimeout(() => {
            window.scrollTo(0, lastScroll);
        }, 100); // Delay to let keyboard animation finish
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
        window.removeEventListener("focusin", handleFocusIn);
        window.removeEventListener("focusout", handleFocusOut);
    };
}, []);
let gymIdIs = 0;
    useEffect(() => {
        const selectedGymRaw = localStorage.getItem("selectedGym");
        if (selectedGymRaw) {
            try {
            
                const selectedGym = JSON.parse(selectedGymRaw);
              
                const cachedTrainers = localStorage.getItem(
                    `trainersdata_${selectedGym.GymId}`
                );
                if (cachedTrainers) {
                    const parsedData = JSON.parse(cachedTrainers);
                                                             //   console.log("AAsdfs",parsedData)

                if (Array.isArray(parsedData)) {
   
    const trainerList = [...parsedData];
   // console.log("✅ Trainers loaded:", trainerList);

    setTrainers(trainerList);
if (type === "add") {
  setSelectedCoachId(trainerList[0].coachid); // Default only for add
}} else {
  //  console.warn("❌ Cached data is not an array:", parsedData);
}
                }
            } catch (err) {
                console.error("Error parsing trainer data:", err);
            }
        }
    }, []);
  const dueAmount = Math.max(amountToBePaid - amountPaid, 0); // prevent negative
 const handleAmountPaidChange = (e) => {
    const value = Number(e.target.value);
    const numericValueAmtPaid = Number(value);

    if (numericValueAmtPaid > Number(amountToBePaid)) {
        setError("Amount Paid cannot exceed Amount to be Paid");
        setAmountPaid(""); // Reset to 0 instead of empty string
    } else {
        setError("");
        setAmountPaid(value);
    }
}; 
    const token = localStorage.getItem("accessToken"); // make sure you have the token
 const retryApi = async (newToken, memberData,apiurl) => {
    try {
        const res = await axios.post(
            `${apiBase}/${apiurl}`,
            memberData,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${newToken}`,
                },
            }
        );

        if (res.data.success) {
if(apiurl == "api/add-member"){
const userId = res.data.userid; // only userid comes from response
//const clientData = res.data.client;
    // Calculate renewal_date
    let renewalDate = fromDate;
    if (memberData.paidmonths) {
      const dt = new Date(fromDate);
      dt.setMonth(dt.getMonth() + memberData.paidmonths);
      renewalDate = dt.toISOString().split("T")[0];
    } else if (memberData.paiddays) {
      const dt = new Date(fromDate);
      dt.setDate(dt.getDate() + memberData.paiddays);
      renewalDate = dt.toISOString().split("T")[0];
    }

    // Build clientData from request + defaults
    const clientData = {
      name: name,
      mobile: mob,
      joiningdate: fromDate,
      renewal_date: renewalDate,
      email:  email || "NA",
      userid: userId,
      referral_id: 0, // backend may update later if needed
      dob: dob || "2000-01-01",
      t_type: 1, // depends on your logic (trial/paid/etc.)
      height:height || 10,
      weight: weight || 10,
      goal: goal,
      coachid:selectedCoachId,
      gender: gender,
      referred_by: referredBy || "",
      memb_entry_date: today,
      due_amount: dueAmount,
      attendance_count: 0,
      last_attend: "2000-01-01",
    };

    // console.log("✅ Client Data:", clientData);
  


              await upsertActiveClient(gymIdIs, clientData);

}else{
     switch(memberData.isRenew) {
      
      case 0:
      const clientData = {
      name: name,
      mobile: mob,
      joiningdate: client.joiningdate,
            renewal_date: client.renewal_date,

      email:  email || "NA",
      userid: client.userid ,
      referral_id: 0, // backend may update later if needed
      dob: dob || "2000-01-01",
      t_type: client.t_type, // depends on your logic (trial/paid/etc.)
      height:height || 10,
      weight: weight || 10,
      goal: goal,
      coachid:selectedCoachId,
      gender: gender,
      referred_by: referredBy || "",
      memb_entry_date: client.memb_entry_date,
      due_amount: client.due_amount,
      attendance_count: client.attendance_count,
      last_attend: client.last_attend,
    };
                  await upsertActiveClient(gymIdIs, clientData);
        break;
         case 1:
   let renewalDate = fromDate;
    if (memberData.paidmonths) {
      const dt = new Date(fromDate);
      dt.setMonth(dt.getMonth() + memberData.paidmonths);
      renewalDate = dt.toISOString().split("T")[0];
    } else if (memberData.paiddays) {
      const dt = new Date(fromDate);
      dt.setDate(dt.getDate() + memberData.paiddays);
      renewalDate = dt.toISOString().split("T")[0];
    }

                        const clientData1 = {
      name: client.name,
      mobile: client.mobile,
      joiningdate: fromDate,
            renewal_date: renewalDate,

      email:  client.email ,
      userid: client.userid ,
      referral_id: client.referral_id, // backend may update later if needed
      dob: client.dob ,
      t_type: 2, // depends on your logic (trial/paid/etc.)
      height:client.height ,
      weight: client.weight ,
      goal: client.goal,
      coachid:client.coachid,
      gender: client.gender,
      referred_by: client.referredBy,
      memb_entry_date: client.memb_entry_date,
      due_amount: dueAmount,
      attendance_count: client.attendance_count,
      last_attend: client.last_attend,
    };
              await upsertActiveClient(gymIdIs, clientData1);
              break;
           case 2:
             const clientData2 = {
      name: client.name,
      mobile: client.mobile,
      joiningdate: fromDate,
            renewal_date: client.renewal_date,

      email:  client.email ,
      userid: client.userid ,
      referral_id: client.referral_id, // backend may update later if needed
      dob: client.dob ,
      t_type: 2, // depends on your logic (trial/paid/etc.)
      height:client.height ,
      weight: client.weight ,
      goal: client.goal,
      coachid:client.coachid,
      gender: client.gender,
      referred_by: client.referredBy,
      memb_entry_date: client.memb_entry_date,
      due_amount: dueAmount,
      attendance_count: client.attendance_count,
      last_attend: client.last_attend,
    };
              await upsertActiveClient(gymIdIs, clientData2);
                break;
             case 3:
                            await deleteActiveClient(gymIdIs, client.userid);

                  break;

        
      // Add more types as needed
    }
}
     
             goBack();

//alert(`✅ ${res.data.message}`);
        } else {
            alert("❌ Failed even after retry: " + res.data.message);
        }
    } catch (err) {
        console.error("🔥 Retry API Error:", err);
        alert("Something went wrong while retrying.");
    }
};
const goBack = () => {
localStorage.setItem("activeclients-toast", "🎉 Success");
navigate(-1); // go back without new instance
};
// const goBack = ()=> {
//       navigate("/activeclients", {
//     state: { success: true, message: "Success" },  replace: true,
// });
// }
const handleupdateForm = async (e) => {
  if (!name?.trim() || !mob ) {
  alert("Please fill all required fields!");
  return;
}
  setLoading(true);
   let token = localStorage.getItem("accessToken"); // make sure you have the token

  const selectedGymRaw = localStorage.getItem("selectedGym");
        if (selectedGymRaw) {
                const selectedGym = JSON.parse(selectedGymRaw);
                gymIdIs = selectedGym.GymId;
        }
       const memberData = {
    name: name, // 🔥 default to empty string
    gymid: gymIdIs , // 🔥 fallback to null
    email: email || "NA",
    mob: mob ,
    date: fromDate, // 🔥 default today (yyyy-mm-dd)
    height: height || 10,
    weight: weight || 10,
    goal: goal ,
        userid: client.userid ,

    dob: dob || "2000-01-01", // 🔥 fallback date of birth
    trainer: selectedCoachId , // 🔥 -1 for "All Trainers" if none selected
    gender: gender , // 🔥 default Male
    referredBy: referredBy || "",
        isRenew: 0,

};
       // console.log("📤 Sending data:", memberData);
              // `${apiBase}/updatetablewebb.php`,

        try {
            const res = await axios.post(
                `${apiBase}/api/update-member`,
                memberData,
                {
                    headers: {
                        "Content-Type": "application/json",
                         Authorization: `Bearer ${token}`,

                    },
                }
            );

            if (res.data.success) {
              // const clientData = res.data.client;
              const clientData = {
      name: name,
      mobile: mob,
      joiningdate: client.joiningdate,
            renewal_date: client.renewal_date,

      email:  email || "NA",
      userid: client.userid ,
      referral_id: 0, // backend may update later if needed
      dob: dob || "2000-01-01",
      t_type: client.t_type, // depends on your logic (trial/paid/etc.)
      height:height || 10,
      weight: weight || 10,
      goal: goal,
      coachid:selectedCoachId,
      gender: gender,
      referred_by: referredBy || "",
      memb_entry_date: client.memb_entry_date,
      due_amount: client.due_amount,
      attendance_count: client.attendance_count,
      last_attend: client.last_attend,
    };
                  await upsertActiveClient(gymIdIs, clientData);

                 goBack();

//alert(`✅ ${res.data.message}`);
                // Optionally reset form
            }else if (res.data.error === 1) {
                    // Token expired (API error = 1)
                    console.log("Access token expired while fetching page " );
                               //    alert("❌ Failed: " + res.data.message);

                  token = await refreshAccessToken(); // Refresh token
                   
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryApi(token, memberData,"api/update-member"); // 🔁 Retry with new token

                    }
                //    console.log("✅ Token refreshed. Retrying page " + currentPage);
                } else {
                alert("❌ Failed: " + res.data.message);
            }
        } catch (err) {
           Swal.fire({
                  icon: "error",
                  title: "Network Error",
                  text: "Check your internet",
                  confirmButtonText: "OK",
                });
            console.error("🔥 API Error:", err);
           // alert("Something went wrong while adding member.");
        }
}
const handleDelete = async (e) => {
      const now = Date.now();

    if (now - lastClickTimeRef.current < 2000) {
      alert("⏳ Please wait 2 seconds before clicking again!");
      return; // ignore clicks within 2s
    }
    lastClickTimeRef.current = now;

  setLoading(true);
    let token = localStorage.getItem("accessToken"); // make sure you have the token

  const selectedGymRaw = localStorage.getItem("selectedGym");
        if (selectedGymRaw) {
                const selectedGym = JSON.parse(selectedGymRaw);
                gymIdIs = selectedGym.GymId;
        }
       const memberData = {
    gymid: gymIdIs , // 🔥 fallback to null
        userid: client.userid ,
        isRenew : 3



};
       // console.log("📤 Sending data:", memberData);
                //${apiBase}/deletemycustw.php`,

        try {
            const res = await axios.post(
                `${apiBase}/api/update-member`,
                memberData,
                {
                    headers: {
                        "Content-Type": "application/json",
                         Authorization: `Bearer ${token}`,

                    },
                }
            );

            if (res.data.success) {
              
              await deleteActiveClient(gymIdIs, client.userid);

                 goBack();

//alert(`✅ ${res.data.message}`);
                // Optionally reset form
            }else if (res.data.error === 1) {
                    // Token expired (API error = 1)
                    console.log("Access token expired while fetching page " );
                               //    alert("❌ Failed: " + res.data.message);

                  token = await refreshAccessToken(); // Refresh token
                   
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryApi(token, memberData,"api/update-member"); // 🔁 Retry with new token

                    }
                //    console.log("✅ Token refreshed. Retrying page " + currentPage);
                } else {
                alert("❌ Failed: " + res.data.message);
            }
        } catch (err) {
           Swal.fire({
                  icon: "error",
                  title: "Network Error",
                  text: "Check your internet",
                  confirmButtonText: "OK",
                });
            console.error("🔥 API Error:", err);
            //alert("Something went wrong while adding member.");
        }finally {
      setLoading(false); // ✅ enable again after response
    }
}

const handleRenew = async (e) => {
      const now = Date.now();

    if (now - lastClickTimeRef.current < 2000) {
      alert("⏳ Please wait 2 seconds before clicking again!");
      return; // ignore clicks within 2s
    }
    lastClickTimeRef.current = now;

     let token = localStorage.getItem("accessToken"); // make sure you have the token
if (
  !name?.trim() ||
  !fromDate ||
  !amountPaid ||
  (!paidDays && !paidmonths)
) {
  alert("Please fill all required fields!");
  return;
}

  setLoading(true);

  const selectedGymRaw = localStorage.getItem("selectedGym");
        if (selectedGymRaw) {
                const selectedGym = JSON.parse(selectedGymRaw);
                gymIdIs = selectedGym.GymId;
        }
       const memberData = {
    gymid: gymIdIs , // 🔥 fallback to null
      name: name, // 🔥 default to empty string

    date: fromDate, // 🔥 default today (yyyy-mm-dd)
  
        userid: client.userid ,
 amount_paid: amountPaid ,
    due_amount: dueAmount,
  
        isRenew: 1,

};
const hasPaidMonths = paidmonths !== "";
const hasPaidDays = paidDays !== "" ;

if (hasPaidMonths) {
  memberData.paidmonths = Number(paidmonths);
}
if (hasPaidDays) {
  memberData.paiddays = Number(paidDays);
}
       // console.log("📤 Sending data:", memberData);

        try {
            const res = await axios.post(
                `${apiBase}/api/update-member`,
                memberData,
                {
                    headers: {
                        "Content-Type": "application/json",
                         Authorization: `Bearer ${token}`,

                    },
                }
            );

            if (res.data.success) {
              // const clientData = res.data.client;
   let renewalDate = fromDate;
    if (memberData.paidmonths) {
      const dt = new Date(fromDate);
      dt.setMonth(dt.getMonth() + memberData.paidmonths);
      renewalDate = dt.toISOString().split("T")[0];
    } else if (memberData.paiddays) {
      const dt = new Date(fromDate);
      dt.setDate(dt.getDate() + memberData.paiddays);
      renewalDate = dt.toISOString().split("T")[0];
    }

                        const clientData = {
      name: client.name,
      mobile: client.mobile,
      joiningdate: fromDate,
            renewal_date: renewalDate,

      email:  client.email ,
      userid: client.userid ,
      referral_id: client.referral_id, // backend may update later if needed
      dob: client.dob ,
      t_type: 2, // depends on your logic (trial/paid/etc.)
      height:client.height ,
      weight: client.weight ,
      goal: client.goal,
      coachid:client.coachid,
      gender: client.gender,
      referred_by: client.referredBy,
      memb_entry_date: client.memb_entry_date,
      due_amount: dueAmount,
      attendance_count: client.attendance_count,
      last_attend: client.last_attend,
    };
              await upsertActiveClient(gymIdIs, clientData);
                 goBack();

//alert(`✅ ${res.data.message}`);
                // Optionally reset form

            }else if (res.data.error === 1) {
                    // Token expired (API error = 1)
                    console.log("Access token expired while fetching page " );
                               //    alert("❌ Failed: " + res.data.message);

                  token = await refreshAccessToken(); // Refresh token
                   
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryApi(token, memberData,"api/update-member"); // 🔁 Retry with new token

                    }
                //    console.log("✅ Token refreshed. Retrying page " + currentPage);
                } else {
                alert("❌ Failed: " + res.data.message);
            }
        } catch (err) {
            console.error("🔥 API Error:", err);
            alert("Something went wrong while adding member.");
        }finally {
      setLoading(false); // ✅ enable again after response
    }
}
const handleDuePay = async (e) => {
      const now = Date.now();

    if (now - lastClickTimeRef.current < 2000) {
      alert("⏳ Please wait 2 seconds before clicking again!");
      return; // ignore clicks within 2s
    }
    lastClickTimeRef.current = now;

  if (!amountPaid ) {
  alert("Please fill all required fields!");
  return;
}
  setLoading(true);

 let token = localStorage.getItem("accessToken"); // make sure you have the token

  const selectedGymRaw = localStorage.getItem("selectedGym");
        if (selectedGymRaw) {
                const selectedGym = JSON.parse(selectedGymRaw);
                gymIdIs = selectedGym.GymId;
        }
       const memberData = {
    gymid: gymIdIs , // 🔥 fallback to null
      name: name, // 🔥 default to empty string  
        userid: client.userid ,
 amount_paid: amountPaid ,
    due_amount: dueAmount,
     isRenew: 2,

};
       // console.log("📤 Sending data:", memberData);
           //     `${apiBase}/updatedueweb.php`,

        try {
            const res = await axios.post(
                `${apiBase}/api/update-member`,
                memberData,
                {
                    headers: {
                        "Content-Type": "application/json",
                         Authorization: `Bearer ${token}`,

                    },
                }
            );

            if (res.data.success) {
           //    const clientData = res.data.client;
               const clientData = {
      name: client.name,
      mobile: client.mobile,
      joiningdate: fromDate,
            renewal_date: client.renewal_date,

      email:  client.email ,
      userid: client.userid ,
      referral_id: client.referral_id, // backend may update later if needed
      dob: client.dob ,
      t_type: 2, // depends on your logic (trial/paid/etc.)
      height:client.height ,
      weight: client.weight ,
      goal: client.goal,
      coachid:client.coachid,
      gender: client.gender,
      referred_by: client.referredBy,
      memb_entry_date: client.memb_entry_date,
      due_amount: dueAmount,
      attendance_count: client.attendance_count,
      last_attend: client.last_attend,
    };
              await upsertActiveClient(gymIdIs, clientData);
                 goBack();

//alert(`✅ ${res.data.message}`);
                // Optionally reset form
            }else if (res.data.error === 1) {
                    // Token expired (API error = 1)
                    console.log("Access token expired while fetching page " );
                               //    alert("❌ Failed: " + res.data.message);

                  token = await refreshAccessToken(); // Refresh token
                   
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryApi(token, memberData,"api/update-member"); // 🔁 Retry with new token

                    }
                //    console.log("✅ Token refreshed. Retrying page " + currentPage);
                } else {
                alert("❌ Failed: " + res.data.message);
            }
        } catch (err) {
           Swal.fire({
                  icon: "error",
                  title: "Network Error",
                  text: "Check your internet",
                  confirmButtonText: "OK",
                });
            console.error("🔥 API Error:", err);
          //  alert("Something went wrong while adding member.");
        }finally {
      setLoading(false); // ✅ enable again after response
    }
}
 const handleModeChange = (e) => {
    const selected = e.target.value;
    setMode(selected);

    // Clear the opposite field
    if (selected === "months") {
      setPaidDays("");
    } else {
      setPaidMonths("");
    }
  };
 const handleSubmit = async (e) => {
              //console.error("🔥 handleSubmit");
                  const now = Date.now();

    if (now - lastClickTimeRef.current < 2000) {
      alert("⏳ Please wait 2 seconds before clicking again!");
      return; // ignore clicks within 2s
    }
    lastClickTimeRef.current = now;

    let token = localStorage.getItem("accessToken"); // make sure you have the token
if (!name?.trim() || !mob || !fromDate || !amountPaid ) {
  alert("Please fill all required fields!");
  return;
}

  const selectedGymRaw = localStorage.getItem("selectedGym");
        if (selectedGymRaw) {
                const selectedGym = JSON.parse(selectedGymRaw);
                gymIdIs = selectedGym.GymId;
        }
       const memberData = {
    name: name, // 🔥 default to empty string
    gymid: gymIdIs , // 🔥 fallback to null
    email: email || "NA",
    mob: mob ,


    date: fromDate, // 🔥 default today (yyyy-mm-dd)
    height: height || 10,
    weight: weight || 10,
    goal: goal ,
    dob: dob || "2000-01-01", // 🔥 fallback date of birth
    trainer: selectedCoachId , // 🔥 -1 for "All Trainers" if none selected
    gender: gender , // 🔥 default Male
    referredBy: referredBy || "",
    amount_paid: amountPaid ,
    due_amount: dueAmount,
};
const hasPaidMonths = paidmonths !== "";
const hasPaidDays = paidDays !== "" ;
if (!hasPaidMonths && !hasPaidDays) {
  alert("Please enter either paid months or paid days!");
  return;
}
              setLoading(true);

if (hasPaidMonths) {
  memberData.paidmonths = Number(paidmonths);
}
if (hasPaidDays) {
  memberData.paiddays = Number(paidDays);
}
       // console.log("📤 Sending data:", token);

        try {
            const res = await axios.post(
                `${apiBase}/api/add-member`,
                memberData,
                {
                    headers: {
                        "Content-Type": "application/json",
                         Authorization: `Bearer ${token}`,

                    },
                }
            );

            if (res.data.success) {
             // const clientData = res.data.client;

const userId = res.data.userid; // only userid comes from response
//const clientData = res.data.client;
    // Calculate renewal_date
    let renewalDate = fromDate;
    if (memberData.paidmonths) {
      const dt = new Date(fromDate);
      dt.setMonth(dt.getMonth() + memberData.paidmonths);
      renewalDate = dt.toISOString().split("T")[0];
    } else if (memberData.paiddays) {
      const dt = new Date(fromDate);
      dt.setDate(dt.getDate() + memberData.paiddays);
      renewalDate = dt.toISOString().split("T")[0];
    }

    // Build clientData from request + defaults
    const clientData = {
      name: name,
      mobile: mob,
      joiningdate: fromDate,
      renewal_date: renewalDate,
      email:  email || "NA",
      userid: userId,
      referral_id: 0, // backend may update later if needed
      dob: dob || "2000-01-01",
      t_type: 1, // depends on your logic (trial/paid/etc.)
      height:height || 10,
      weight: weight || 10,
      goal: goal,
      coachid:selectedCoachId,
      gender: gender,
      referred_by: referredBy || "",
      memb_entry_date: today,
      due_amount: dueAmount,
      attendance_count: 0,
      last_attend: "2000-01-01",
    };

   //  console.log("✅ Client Data:", clientData);
  


              await upsertActiveClient(gymIdIs, clientData);

                 goBack();

//alert(`✅ ${res.data.message}`);
                // Optionally reset form
            }else if (res.data.error === 1) {
                    // Token expired (API error = 1)
                    console.log("Access token expired while fetching page " );
                               //    alert("❌ Failed: " + res.data.message);

                  token = await refreshAccessToken(); // Refresh token
                   
                    if (!token) {
                        console.log("❌ Unable to refresh token. Logging out...");
                        handleLogout();
                        return;
                    }else{
                       return await retryApi(token, memberData,"api/add-member"); // 🔁 Retry with new token

                    }
                //    console.log("✅ Token refreshed. Retrying page " + currentPage);
                }else if(res.data.error == 12){
                 showUpgradePopup({
                   price: "₹5000 / Year",
                   titleIs: "Limit Exceeded"
                  });
                }else if(res.data.error == 99){
                 showUpgradePopup({
                   price: "₹5000 / Year",
                   titleIs: "Renew Now"
                  });
                } else {
                alert("❌ Failed: " + res.data.message);
            }
        } catch (err) {
            console.error("🔥 API Error:", err);
             Swal.fire({
                    icon: "error",
                    title: "Network Error",
                    text: "Check your internet",
                    confirmButtonText: "OK",
                  });
            //alert("Something went wrong while adding member.");
        }finally {
      setLoading(false); // ✅ enable again after response
    }
        

    };
      const handleLogout = () => {
        localStorage.removeItem("gyms");
        localStorage.removeItem("selectedGym");
    localStorage.setItem("isLoggedInWeb", "false");

        // ✅ Navigate back to login screen
        navigate("/login", { replace: true });
    };
const refreshAccessToken =  async (e) =>  {
  const selectedGymRaw = localStorage.getItem("selectedGym");
                const selectedGymA = JSON.parse(selectedGymRaw);
        
    try {
        const res = await axios.post(
            `${apiBase}/api/refresh-token`,
            { mob: selectedGymA.mob },
            { withCredentials: true }
        );

        if (res.data.success && res.data.access_token) {
            // ✅ Save and return new token
            localStorage.setItem("accessToken", res.data.access_token);
            console.log("✅ Access token refreshed");
            return res.data.access_token;
        } else {
            console.log("❌ Refresh token invalid or expired. Logging out...");
            handleLogout();
            return null;
        }
    } catch (err) {
        console.error("🔥 Failed to refresh token:", err);
       // handleLogout();
        return null;
    }
};
    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Title */}
{loading && (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm z-50">
    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-3 text-gray-700 font-medium">Processing...</p>
  </div>
)}
          <h1 className="text-3xl font-bold mb-6 text-center">
  {type === "add" && "Add New Member"}
  {type === "edit" && "Edit Member"}
    {type === "renew" && "Renew Member"}
    {type === "freeze" && "Freeze Member"}

  {type === "due" && "Due Pay"}

</h1>

            {/* Form Box */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                    {/* Name, Mobile, Email */}
                  <div className="flex flex-col w-full">
  <label htmlFor="name" className="mb-1 text-sm font-medium text-red-700">
    Name*
  </label>
<input
  id="name"
  type="text"
  placeholder=""
 value={name}
  onChange={(e) => setName(e.target.value)}
  className={`w-full border border-gray-300 p-2 rounded ${
    [ "renew", "due","freeze"].includes(type) ? "bg-gray-100 text-gray-700 cursor-not-allowed" : ""
  }`}
  readOnly={["renew", "due","freeze"].includes(type)} // 👈 Read-only for edit/renew/due
  required
/>
</div>
   {!["renew", "due","freeze"].includes(type) && ( // 👈 Hide for renew/due
  <div>
  <div className="flex flex-col w-full">
  <label htmlFor="name" className="mb-1 text-sm font-medium text-red-700">
    Mobile*
  </label>
                    <input
                      onFocus={handleFocus}
   value={mob}
                onChange={(e) => setMob(e.target.value)}
                        type="tel"
                        placeholder=""
                        className="w-full border border-gray-300 p-2 rounded"
                        required
                    />
                    </div>
 
                    <div className="flex flex-col w-full">
  <label htmlFor="name" className="mb-1 text-sm font-medium text-gray-700">
    Email
  </label>
   
                    <input
                      onFocus={handleFocus}
value={email}
                onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder=""
                        className="w-full border border-gray-300 p-2 rounded"
                    />
 </div>
                    {/* Referral ID, DOB */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {/* <div className="flex flex-col w-full">
  <label htmlFor="name" className="mb-1 text-sm font-medium text-gray-700">
    Referral ID
  </label>
                        <input
                            type="text"
                            placeholder=""
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                        </div> */}
     <div className="flex flex-col w-full">
  <label htmlFor="dob" className="mb-1 text-sm font-medium text-gray-700">Date of Birth</label>
  <input
    onFocus={handleFocus}
value={dob}
                onChange={(e) => setDob(e.target.value)}
    id="dob"
    type="date"
    className="w-full border border-gray-300 p-2 rounded"
  />
</div>
                    </div>

                    {/* Height and Weight */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col w-full">
  <label htmlFor="name" className="mb-1 text-sm font-medium text-gray-700">
    Height (cm)
  </label>
                        <input
                          onFocus={handleFocus}
value={height}
                onChange={(e) => setHeight(e.target.value)}
                            type="number"
                            placeholder=""
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                        </div>
                           <div className="flex flex-col w-full">
  <label htmlFor="name" className="mb-1 text-sm font-medium text-gray-700">
    Weight (kg)
  </label>
                        <input
                          onFocus={handleFocus}
value={weight}
                onChange={(e) => setWeight(e.target.value)}
                            type="number"
                            placeholder=""
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                        </div>
                    </div>

                    {/* Goal and Gender same row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="flex flex-col w-full">
  <label htmlFor="name" className="mb-1 text-sm font-medium text-gray-700">
    Goal
  </label>
  <select
     value={goal}
                onChange={(e) => setGoal(e.target.value)}
    className="w-full sm:w-1/2 border border-gray-300 p-2 rounded"
  >                        
                            <option value="1">Weight Loss</option>
                            <option value="2">Weight Gain</option>
                            <option value="3">Muscle Tone</option>
                            <option value="4">Other</option>
                        </select>
</div>
   <div className="flex flex-col w-full">
  <label htmlFor="name" className="mb-1 text-sm font-medium text-gray-700">
    Gender
  </label>
 <select
     value={gender}
                onChange={(e) => setGender(e.target.value)}
    className="w-full sm:w-1/2 border border-gray-300 p-2 rounded"
  >                     
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        </div>
                    </div>
                   </div>
   )}
                    {/* Admin (Trainer), Paid Months */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {!["renew", "due","freeze"].includes(type) && ( // 👈 Hide for renew/due
  <div>
                          <div className="flex flex-col w-full">

    <label
      htmlFor="admin"
      className="mb-1 text-sm font-medium text-gray-700"
    >
      Admin
    </label>
    <select
      value={selectedCoachId}
      onChange={(e) => setSelectedCoachId(parseInt(e.target.value, 10))}
      className={`border p-2 rounded w-full `}
      required

      //  className={`border p-2 rounded w-full ${
      //   type === "edit" ? "bg-gray-100 text-gray-700 cursor-not-allowed" : ""
      // }`}
      // required
      // disabled={type === "edit"} // 👈 Disable in edit mode
    >
      {trainers.map((trainer) => (
        <option key={trainer.coachid} value={trainer.coachid}>
          {trainer.name}
        </option>
      ))}
    </select>

</div>
  </div>
  
)}

   {!["edit", "due"].includes(type) && ( // 👈 Hide for renew/due
    <div className="space-y-4 w-full">
      {/* Mode selection */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">
          Choose Duration Type
        </label>
        <select
          value={mode}
          onChange={handleModeChange}
          className="border border-gray-300 p-2 rounded w-full"
        >
          <option value="months">      {type === "freeze" ? "Freeze Months" : "Paid Months"}
</option>
          <option value="days">      {type === "freeze" ? "Freeze Days" : "Paid Days"}
</option>
        </select>
      </div>

      {/* Conditional input based on mode */}
{mode === "months" ? (
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-red-700">
      {type === "freeze" ? "Freeze Months*" : "Paid Months*"}
    </label>
    <input
      type="number"
      required
      onFocus={handleFocus}
      value={paidmonths}
      onChange={(e) => setPaidMonths(e.target.value)}
      className="w-full border border-gray-300 p-2 rounded"
      placeholder={
        type === "freeze" ? "Enter number of freeze months" : "Enter number of months"
      }
    />
  </div>
) : (
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-red-700">
      {type === "freeze" ? "Freeze Days*" : "Paid Days*"}
    </label>
    <input
      type="number"
      required
      onFocus={handleFocus}
      value={paidDays}
      onChange={(e) => setPaidDays(e.target.value)}
      className="w-full border border-gray-300 p-2 rounded"
      placeholder={
        type === "freeze" ? "Enter number of freeze days" : "Enter number of days"
      }
    />
  </div>
)}

    </div>
)}
                    </div>

                    {/* From Date */}
                     {!["edit","due","freeze"].includes(type) && ( // 👈 Hide for renew/due
  <div>
                               <div className="flex flex-col w-full mt-4">
  
  <label htmlFor="fromDate" className="mb-1 text-sm font-medium text-gray-700">From Date</label>
  <input
    onFocus={handleFocus}

    id="fromDate"
    type="date"
    value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
    className="w-full border border-gray-300 p-2 rounded"
  />

</div>
                               </div>
)}              

                    {/* Amounts */}
 
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                                   {!["edit"].includes(type) && ( // 👈 Hide for renew/due
  <div>
                        <div className="flex flex-col w-full">

  <label htmlFor="name" className="mb-1 text-sm font-medium text-red-700">
    Amount to be Paid*
  </label>
                        <input
                                  id="amountToBePaid"
  onFocus={handleFocus}
  value={amountToBePaid}
required
                            type="number"
                            placeholder=""
                            onChange={(e) => setAmountToBePaid(Number(e.target.value))}
                            className={`w-full border border-gray-300 p-2 rounded ${
    [  "due"].includes(type) ? "bg-gray-100 text-gray-700 cursor-not-allowed" : ""
  }`}
          
                              readOnly={["due"].includes(type)}
                        />

                        </div>
                                                   </div>
)}

                                                                              {!["edit"].includes(type) && ( // 👈 Hide for renew/due
  <div>
                           <div className="flex flex-col w-full">

  <label htmlFor="amountPaid" className="mb-1 text-sm font-medium text-red-700">
    Amount Paid*
</label>
<input
  onFocus={handleFocus}
required
    id="amountPaid"
    type="number"
    placeholder="Enter amount paid"
    value={amountPaid} // ✅ Controlled value
    onChange={handleAmountPaidChange}

                            // onChange={(e) => setAmountPaid(Number(e.target.value))}
          className="w-full border border-gray-300 p-2 rounded"
                            className="w-full border border-gray-300 p-2 rounded"
                       
                       />  
                       
                        {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p> // ✅ Show error
            )}
                  
                        </div>
                                                                     </div>
)}
                                  {!["edit"].includes(type) && ( // 👈 Hide for renew/due
  <div>
                       <div className="flex flex-col w-full">
   
        <label htmlFor="dueAmount" className="mb-1 text-sm font-medium text-gray-700">
          Due Amount
        </label>
        <input
          onFocus={handleFocus}

          id="dueAmount"
          type="number"
          value={dueAmount}
          
          readOnly
          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
        />

      </div>
                                                                             </div>
)}
                    </div>

                    {/* Add Button */}
                {["add"].includes(type) && ( // 👈 Hide for renew/due
  <div>
                   <button
    onClick={handleSubmit} // 🔥 Manual call
    type="submit"
    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition mt-4" // 👈 Added mt-4 for margin-top
>
    Add Member
</button>
</div>)}
                {["edit"].includes(type) && ( // 👈 Hide for renew/due
  <div>
        
 <button
    onClick={handleupdateForm} // 🔥 Manual call
    type="submit"
    className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition mt-4" // 👈 Added mt-4 for margin-top
>
   Update
</button>
<button
    onClick={() =>{
      Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the member",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
               handleDelete(); // ✅ Only runs if confirmed
              // Swal.fire({
              //   title: "Deleted!",
              //   text: "Leads have been cleared successfully.",
              //   icon: "success",
              //   confirmButtonColor: "#3085d6"
              // });
            }
          });
      
      
     } }// 🔥 Manual call
    type="submit"
    className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition mt-4" // 👈 Added mt-4 for margin-top
>
   Delete
</button>
</div>
                )}
                               {["renew"].includes(type) && ( // 👈 Hide for renew/due
  <div>
                   <button
    onClick={handleRenew} // 🔥 Manual call
    type="submit"
    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition mt-4" // 👈 Added mt-4 for margin-top
>
    Renew
</button>
</div>)}
                              {["freeze"].includes(type) && ( // 👈 Hide for renew/due
  <div>
                   <button
    onClick={handleRenew} // 🔥 Manual call
    type="submit"
    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition mt-4" // 👈 Added mt-4 for margin-top
>
    Freeze
</button>
</div>)}
               {["due"].includes(type) && ( // 👈 Hide for renew/due
  <div>
                   <button
    onClick={handleDuePay} // 🔥 Manual call
    type="submit"
    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition mt-4" // 👈 Added mt-4 for margin-top
>
    Due Pay
</button>
</div>)}
            </div>
        </div>
    );
};

export default AddMemberScreen;
