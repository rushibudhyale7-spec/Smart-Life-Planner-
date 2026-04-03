import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Utensils, Search, Camera, Clock, ChefHat, Flame, Bookmark, Share2, Plus, Trash2 } from 'lucide-react';
import { geminiFlash, geminiPro } from '../lib/gemini';

export default function Recipes() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  const addIngredient = () => {
    if (input.trim()) {
      setIngredients([...ingredients, input.trim()]);
      setInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const generateRecipes = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    try {
      const prompt = `Suggest 3 recipes using these ingredients: ${ingredients.join(', ')}. 
      For each recipe, provide: name, time, difficulty, calories, ingredients (array), and steps (array).
      Return as a JSON array of objects.`;
      
      const response = await geminiFlash.generateContent(prompt);
      const text = response.text || '[]';
      const cleanText = text.replace(/```json|```/g, '').trim();
      setRecipes(JSON.parse(cleanText));
    } catch (error) {
      console.error("Recipe generation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const response = await geminiPro.analyzeImage(
          "Identify the food ingredients in this image and list them as a comma-separated string.",
          base64,
          file.type
        );
        const identified = response.text?.split(',').map(s => s.trim()) || [];
        setIngredients([...new Set([...ingredients, ...identified])]);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image analysis error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-2xl font-bold mb-2">AI Recipe Generator</h1>
        <p className="text-white/60 text-sm">Enter ingredients or upload a photo to get started.</p>
      </header>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Utensils className="absolute left-4 top-4 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Add ingredient..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
            />
          </div>
          <label className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
            <Camera className="w-6 h-6 text-white/60" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          <button
            onClick={addIngredient}
            className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {ingredients.map((ing, i) => (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={i}
              className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              {ing}
              <button onClick={() => removeIngredient(i)}>
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </div>

        <button
          onClick={generateRecipes}
          disabled={ingredients.length === 0 || loading}
          className="w-full bg-primary py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {loading ? 'Generating Recipes...' : 'Generate AI Recipes'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="glass-card h-48 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : selectedRecipe ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{selectedRecipe.name}</h2>
              <div className="flex gap-4 mt-2">
                <span className="flex items-center gap-1 text-xs text-white/60">
                  <Clock className="w-3 h-3" /> {selectedRecipe.time}
                </span>
                <span className="flex items-center gap-1 text-xs text-white/60">
                  <Flame className="w-3 h-3" /> {selectedRecipe.calories}
                </span>
                <span className="flex items-center gap-1 text-xs text-white/60">
                  <ChefHat className="w-3 h-3" /> {selectedRecipe.difficulty}
                </span>
              </div>
            </div>
            <button onClick={() => setSelectedRecipe(null)} className="text-white/40 hover:text-white">Close</button>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-primary">Ingredients</h3>
            <ul className="grid grid-cols-2 gap-2">
              {selectedRecipe.ingredients.map((ing: string, i: number) => (
                <li key={i} className="text-sm text-white/70 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {ing}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-primary">Steps</h3>
            <div className="space-y-4">
              {selectedRecipe.steps.map((step: string, i: number) => (
                <div key={i} className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm text-white/70 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {recipes.map((recipe, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 space-y-4 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">{recipe.name}</h3>
                <div className="flex gap-2">
                  <Bookmark className="w-5 h-5 text-white/40 hover:text-primary transition-colors" />
                </div>
              </div>
              <div className="flex gap-4">
                <span className="bg-white/5 px-3 py-1 rounded-lg text-[10px] font-bold text-white/60 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {recipe.time}
                </span>
                <span className="bg-white/5 px-3 py-1 rounded-lg text-[10px] font-bold text-white/60 flex items-center gap-1">
                  <Flame className="w-3 h-3" /> {recipe.calories}
                </span>
              </div>
              <p className="text-sm text-white/40 line-clamp-2">
                Ingredients: {recipe.ingredients.join(', ')}
              </p>
            </motion.div>
          ))}
        </div>
      )}
      <section className="space-y-4">
        <h3 className="text-lg font-bold">Weekly Meal Planner</h3>
        <div className="grid grid-cols-1 gap-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <div key={day} className="glass-card p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">{day}</h4>
                <p className="text-xs text-white/40">Plan your meals for the day</p>
              </div>
              <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
