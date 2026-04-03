import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Wallet, Utensils, Plane, Target, Bookmark, Share2, Heart, Sparkles } from 'lucide-react';
import { geminiFlash } from '../lib/gemini';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const quickActions = [
    { icon: Wallet, label: 'Track Expense', color: 'bg-emerald-500', path: '/finance' },
    { icon: Utensils, label: 'AI Recipes', color: 'bg-orange-500', path: '/recipes' },
    { icon: Plane, label: 'Plan Trip', color: 'bg-blue-500', path: '/lifestyle' },
    { icon: Target, label: 'Financial Goals', color: 'bg-purple-500', path: '/finance' },
  ];

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const prompt = `Generate 5 personalized lifestyle feed items for a user interested in productivity, finance, travel, and healthy recipes. 
        Each item should have: title, description, category (Finance, Travel, Lifestyle, Recipe), and a short tip.
        Return as a JSON array of objects.`;
        
        const response = await geminiFlash.generateContent(prompt);
        const text = response.text || '[]';
        const cleanText = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanText);
        setFeed(data);
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-white/60 text-sm font-medium">Good Morning,</h2>
          <h1 className="text-2xl font-bold text-white">{auth.currentUser?.displayName || 'User'}</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4">
        {quickActions.map((action, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(action.path)}
            className="glass-card p-4 flex flex-col items-center gap-3 hover:bg-white/10 transition-colors"
          >
            <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center shadow-lg`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/90">{action.label}</span>
          </motion.button>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Smart Feed</h3>
          <button className="text-primary text-sm font-bold">View All</button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card h-48 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {feed.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                    <div className="flex gap-3 text-white/40">
                      <Heart className="w-5 h-5 hover:text-red-500 cursor-pointer transition-colors" />
                      <Bookmark className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
                      <Share2 className="w-5 h-5 hover:text-blue-500 cursor-pointer transition-colors" />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                  </div>

                  {item.tip && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <p className="text-xs italic text-white/40">Tip: {item.tip}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {/* Native Ad Placeholder */}
            <div className="glass-card p-4 border-dashed border-primary/30 bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-primary/60 border border-primary/30 px-2 py-0.5 rounded">AD</span>
              </div>
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-white/10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 w-3/4 rounded" />
                  <div className="h-3 bg-white/10 w-full rounded" />
                  <div className="h-8 bg-primary/20 w-1/2 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
