import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Compass, Star, Bookmark, Share2, Filter, Plane, Hotel, Calendar, Sparkles, X } from 'lucide-react';
import { geminiFlash, geminiImage } from '../lib/gemini';

export default function Lifestyle() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [itinerary, setItinerary] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    
    try {
      const prompt = `Suggest 4 travel destinations or lifestyle experiences related to "${query}". 
      For each, provide: name, location, description, estimatedCost, and rating.
      Use Google Search to find current trending spots.
      Return as a JSON array of objects.`;
      
      const response = await geminiFlash.generateContent(prompt, [{ googleSearch: {} }]);
      const text = response.text || '[]';
      const cleanText = text.replace(/```json|```/g, '').trim();
      setResults(JSON.parse(cleanText));
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateItinerary = async (destination: string) => {
    setLoading(true);
    try {
      const prompt = `Create a 3-day travel itinerary for "${destination}". 
      Include hotel suggestions, daily activities, and estimated budget.
      Return as a JSON object with fields: destination, budget, hotelSuggestions (array), days (array of objects with day and activities).`;
      
      const response = await geminiFlash.generateContent(prompt, [{ googleSearch: {} }]);
      const text = response.text || '{}';
      const cleanText = text.replace(/```json|```/g, '').trim();
      setItinerary(JSON.parse(cleanText));
    } catch (error) {
      console.error("Itinerary error:", error);
    } finally {
      setLoading(false);
    }
  };

  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const generateDestinationImage = async (name: string) => {
    setGeneratingImage(true);
    try {
      const url = await geminiImage.generateImage(`A high-quality, cinematic travel photo of ${name}, beautiful lighting, 4k resolution`, "1K");
      setGeneratedImageUrl(url);
    } catch (error) {
      console.error("Image generation error:", error);
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-2xl font-bold mb-2">Lifestyle Discovery</h1>
        <p className="text-white/60 text-sm">Find your next adventure or luxury experience.</p>
      </header>

      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-4 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Where do you want to go?"
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 bg-primary px-4 rounded-xl font-bold text-sm"
        >
          Explore
        </button>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['Trending', 'Luxury', 'Adventure', 'Budget', 'Nature', 'City'].map(tag => (
          <button
            key={tag}
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold whitespace-nowrap hover:bg-primary/20 hover:border-primary/30 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card h-64 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : itinerary ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 space-y-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{itinerary.destination}</h2>
              <p className="text-primary font-bold">Estimated Budget: {itinerary.budget}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => generateDestinationImage(itinerary.destination)}
                disabled={generatingImage}
                className="p-2 bg-primary/20 rounded-xl text-primary hover:bg-primary/30 transition-all disabled:opacity-50"
                title="Generate AI Image"
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <button onClick={() => setItinerary(null)} className="text-white/40 hover:text-white">Close</button>
            </div>
          </div>

          {generatedImageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden aspect-video border border-white/10"
            >
              <img src={generatedImageUrl} alt="Generated" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button 
                onClick={() => setGeneratedImageUrl(null)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          {generatingImage && (
            <div className="aspect-video rounded-2xl bg-white/5 flex flex-col items-center justify-center gap-2 border border-dashed border-white/10">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Generating AI Image...</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Hotel className="w-5 h-5 text-primary" /> Hotel Suggestions
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {itinerary.hotelSuggestions.map((hotel: string, i: number) => (
                <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 text-sm">
                  {hotel}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Itinerary
            </h3>
            {itinerary.days.map((day: any, i: number) => (
              <div key={i} className="relative pl-6 border-l border-primary/30">
                <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary" />
                <h4 className="font-bold text-primary mb-2">Day {day.day}</h4>
                <ul className="space-y-2">
                  {day.activities.map((act: string, j: number) => (
                    <li key={j} className="text-sm text-white/70">• {act}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {results.length > 0 ? results.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card overflow-hidden group"
            >
              <div className="h-48 bg-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-1 text-yellow-500 mb-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-bold">{item.rating}</span>
                  </div>
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="text-xs text-white/60 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {item.location}
                  </p>
                </div>
                <button className="absolute top-4 right-4 p-2 bg-dark/50 backdrop-blur-md rounded-full border border-white/10">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-primary">{item.estimatedCost}</span>
                  <button
                    onClick={() => generateItinerary(item.name)}
                    className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all"
                  >
                    Plan Trip
                  </button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-12">
              <Compass className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-white/40">Search for destinations to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
