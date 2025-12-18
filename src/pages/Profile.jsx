import React, { useEffect, useState } from "react";
import OrganizerLayout from "../Layout/OrganizerLayout";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateEmail } from "firebase/auth";
import { FaUser, FaLock, FaBell, FaCamera, FaSave, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    photo: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  const IMGBB_KEY = "5c96460dbce35dbdb36e2e26b2dad63e";

  // 📌 Upload to imgbb
  const uploadToImgbb = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!data.success) throw new Error("Image upload failed");

    return data.data.url; // final image URL
  };

  useEffect(() => {
    async function loadData() {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setUserData({
            name: data.name || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            organization: data.organization || "",
            photo: data.photo || "",
          });
        } else {
             setUserData({
                ...userData,
                email: user.email || ""
             })
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setUserData({ ...userData, photo: file });
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveStatus(null);

    try {
      const user = auth.currentUser;
      const ref = doc(db, "users", user.uid);

      let photoURL = userData.photo;

      // If it's a new file → upload to imgbb
      if (userData.photo instanceof File) {
        photoURL = await uploadToImgbb(userData.photo);
      }

      // Update Firestore
      await updateDoc(ref, {
        name: userData.name,
        phone: userData.phone,
        organization: userData.organization,
        photo: photoURL,
      });

      // Update Firebase Auth email
      if (user.email !== userData.email) {
        await updateEmail(user, userData.email);
      }

      setSaveStatus({ type: "success", message: "Profile updated successfully" });

      // update preview
      if (photoURL) setPreviewImage(photoURL);
      setUserData((u) => ({ ...u, photo: photoURL }));

    } catch (err) {
      console.error("Update failed:", err);
      setSaveStatus({ type: "error", message: "Failed to update profile. " + err.message });
    }

    setSaveLoading(false);
  };

  if (loading)
    return (
      <OrganizerLayout>
         <div className="flex items-center justify-center h-screen text-gray-400">Loading settings...</div>
      </OrganizerLayout>
    );

  return (
    <OrganizerLayout>
      <main className="max-w-4xl mx-auto mt-8 px-4 w-full mb-20">

        <div className="bg-black p-6 md:p-10 rounded-3xl shadow-2xl text-white mb-8 border border-white/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <img
                    src={
                        previewImage ||
                        (typeof userData.photo === "string" && userData.photo ? userData.photo : null) ||
                        "https://placehold.co/150x150/222/fff?text=User"
                    }
                    alt="Profile"
                    className="relative w-28 h-28 rounded-full object-cover border-4 border-black shadow-2xl"
                />
                <label className="absolute bottom-1 right-1 bg-white text-gray-900 p-2.5 rounded-full cursor-pointer hover:bg-gray-100 transition shadow-lg z-10 scale-90 md:scale-100">
                    <FaCamera size={14} />
                    <input type="file" onChange={handleImageChange} accept="image/*" className="hidden" />
                </label>
              </div>
              
              <div className="flex-1">
                   <h2 className="text-3xl md:text-4xl font-black tracking-tighter">{userData.name || "Organizer"}</h2>
                   <p className="text-gray-400 text-sm md:text-base mt-2 font-medium opacity-80">{userData.email}</p>
                   <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                       <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black bg-white/10 text-white border border-white/10 tracking-widest uppercase">
                          {userData.organization || "Independent"}
                       </span>
                   </div>
              </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 space-x-1 w-full md:w-fit overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-black rounded-xl transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'profile' 
                    ? 'bg-white text-black shadow-lg shadow-black/5' 
                    : 'text-gray-500 hover:text-black'
                }`}
            >
                <FaUser className="text-xs" /> Profile
            </button>
            <button 
                onClick={() => setActiveTab('security')}
                className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-black rounded-xl transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'security' 
                    ? 'bg-white text-black shadow-lg shadow-black/5' 
                    : 'text-gray-500 hover:text-black'
                }`}
            >
                <FaLock className="text-xs" /> Security
            </button>
            <button 
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-black rounded-xl transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'notifications' 
                    ? 'bg-white text-black shadow-lg shadow-black/5' 
                    : 'text-gray-500 hover:text-black'
                }`}
            >
                <FaBell className="text-xs" /> Notifications
            </button>
        </div>

        {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition bg-gray-50 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">To change email, please contact support.</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Organization / Brand Name</label>
                  <input
                    type="text"
                    name="organization"
                    value={userData.organization}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
              </div>

                {/* Save Button */}
               <div className="flex flex-col md:flex-row items-center justify-between pt-8 mt-8 border-t border-gray-100 gap-6">
                   {saveStatus && (
                         <div className={`text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-lg ${saveStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                             {saveStatus.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                             {saveStatus.message}
                         </div>
                   )}
                   <div className="flex flex-col-reverse sm:flex-row gap-4 w-full md:w-auto md:ml-auto">
                     <button className="w-full sm:w-auto px-8 py-4 text-gray-500 hover:text-black font-black transition-all hover:bg-gray-100 rounded-2xl">
                         Cancel
                     </button>
                     <button
                         onClick={handleSave}
                         disabled={saveLoading}
                         className="w-full sm:w-auto flex items-center justify-center gap-2 px-12 py-4 bg-black text-white rounded-2xl font-black shadow-2xl hover:bg-white hover:text-black hover:ring-2 hover:ring-black transition-all duration-300 text-lg tracking-tight active:scale-95 disabled:opacity-70"
                     >
                         {saveLoading ? "Saving..." : <><FaSave /> SAVE CHANGES</>}
                     </button>
                   </div>
               </div>
            </div>
        )}

        {activeTab === 'security' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center py-20 animate-fade-in">
                 <FaLock className="text-gray-200 text-6xl mb-4" />
                 <h3 className="text-lg font-bold text-gray-900">Security Settings</h3>
                 <p className="text-gray-500 max-w-md mt-2">Password updates and 2FA are handled through our secure auth provider. We will add direct controls here soon.</p>
                 <button className="mt-6 px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                     Reset Password via Email
                 </button>
            </div>
        )}
        
        {activeTab === 'notifications' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center py-20 animate-fade-in">
                 <FaBell className="text-gray-200 text-6xl mb-4" />
                 <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                 <p className="text-gray-500 max-w-md mt-2">Manage your email and push notification preferences clearly.</p>
            </div>
        )}

      </main>
    </OrganizerLayout>
  );
}
