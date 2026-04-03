import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { motion } from 'motion/react';
import { User, Settings, Bell, Shield, LogOut, Edit2, Bookmark, ChevronRight, Heart, MapPin } from 'lucide-react';
import { UserProfile } from '../types';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleLogout = () => signOut(auth);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center overflow-hidden">
            {auth.currentUser?.photoURL ? (
              <img src={auth.currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-primary" />
            )}
          </div>
          <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-xl flex items-center justify-center border-4 border-dark">
            <Edit2 className="w-4 h-4 text-white" />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile?.username || 'User'}</h1>
          <p className="text-white/40 text-sm">{profile?.email}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">Diet</p>
          <p className="font-bold text-primary">{profile?.dietPreference || 'Not Set'}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">Travel</p>
          <p className="font-bold text-secondary">{profile?.travelInterest || 'Not Set'}</p>
        </div>
      </div>

      <section className="space-y-2">
        <h3 className="text-xs text-white/40 font-bold uppercase tracking-wider px-2 mb-4">Account Settings</h3>
        <div className="glass-card overflow-hidden">
          {[
            { icon: Bookmark, label: 'My Bookmarks', color: 'text-blue-500' },
            { icon: Bell, label: 'Notifications', color: 'text-orange-500' },
            { icon: Shield, label: 'Privacy & Security', color: 'text-emerald-500' },
            { icon: Settings, label: 'App Settings', color: 'text-white/60' },
          ].map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-4">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20" />
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>

      <footer className="text-center py-4">
        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">SmartLife Planner v1.0.0</p>
      </footer>
    </div>
  );
}
