import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, X, Target, ChevronRight, Sparkles } from 'lucide-react';
import { geminiPro } from '../lib/gemini';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function Finance() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'Food',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health'];
  const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(data);
      setLoading(false);
    });

    const goalsQ = query(
      collection(db, 'goals'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribeGoals = onSnapshot(goalsQ, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGoals(data);
    });

    return () => {
      unsubscribe();
      unsubscribeGoals();
    };
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, 'expenses'), {
        userId: auth.currentUser.uid,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        notes: newExpense.notes,
        date: newExpense.date,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setNewExpense({ amount: '', category: 'Food', notes: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const categoryData = categories.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((acc, curr) => acc + curr.amount, 0)
  })).filter(d => d.value > 0);

  const [deepAnalysis, setDeepAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleDeepAnalysis = async () => {
    setAnalyzing(true);
    try {
      const prompt = `Analyze my current expenses: ${JSON.stringify(expenses)}. 
      Provide deep financial insights, potential saving areas, and a long-term strategy. 
      Be thorough and use advanced financial reasoning.`;
      const response = await geminiPro.generateContent(prompt, true);
      setDeepAnalysis(response.text || '');
    } catch (error) {
      console.error("Deep analysis error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Finance Tracker</h1>
        <div className="flex gap-2">
          <button
            onClick={handleDeepAnalysis}
            disabled={analyzing || expenses.length === 0}
            className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 disabled:opacity-50"
            title="Deep Financial Analysis"
          >
            <Sparkles className="w-6 h-6 text-purple-500" />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>
      </header>

      {deepAnalysis && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-6 bg-purple-500/5 border-purple-500/20"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-purple-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Financial Insights
            </h3>
            <button onClick={() => setDeepAnalysis('')} className="text-white/20 hover:text-white">Close</button>
          </div>
          <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
            {deepAnalysis}
          </div>
        </motion.div>
      )}

      <section className="glass-card p-6 bg-primary/10 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-white/60 font-medium">Total Monthly Expense</p>
            <h2 className="text-3xl font-bold">${totalExpense.toLocaleString()}</h2>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Budget Left</p>
            <p className="text-lg font-bold text-emerald-500">$1,240</p>
          </div>
          <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Savings</p>
            <p className="text-lg font-bold text-primary">$450</p>
          </div>
        </div>
      </section>

      {categoryData.length > 0 && (
        <section className="glass-card p-6">
          <h3 className="text-lg font-bold mb-6">Expense Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-white/60">{cat.name}: ${cat.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Financial Goals</h3>
          <button className="text-primary text-sm font-bold flex items-center gap-1">
            Manage <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {goals.length > 0 ? goals.map((goal, i) => (
            <div key={i} className="glass-card p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-500" />
                  </div>
                  <h4 className="font-bold">{goal.name}</h4>
                </div>
                <span className="text-sm font-bold text-primary">
                  {Math.round((goal.savedAmount / goal.targetAmount) * 100)}%
                </span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(goal.savedAmount / goal.targetAmount) * 100}%` }}
                  className="h-full bg-primary"
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-white/40 font-bold uppercase tracking-wider">
                <span>Saved: ${goal.savedAmount}</span>
                <span>Target: ${goal.targetAmount}</span>
              </div>
            </div>
          )) : (
            <div className="glass-card p-8 text-center border-dashed border-white/10">
              <Target className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-sm">No goals set yet. Start planning your future!</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">Recent Transactions</h3>
        <div className="space-y-3">
          {expenses.map((expense, i) => (
            <div key={i} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                  <TrendingUp className="w-6 h-6 text-white/40" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{expense.category}</h4>
                  <p className="text-xs text-white/40">{expense.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-500">-${expense.amount}</p>
                <p className="text-[10px] text-white/40">{expense.notes || 'No notes'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-dark/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="glass-card w-full max-w-md p-8 rounded-b-none rounded-t-3xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Add Expense</h2>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs text-white/60 font-bold uppercase tracking-wider">Amount</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-2xl font-bold focus:outline-none focus:border-primary"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/60 font-bold uppercase tracking-wider">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewExpense({ ...newExpense, category: cat })}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold transition-all",
                          newExpense.category === cat ? "bg-primary text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/60 font-bold uppercase tracking-wider">Notes</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary"
                    placeholder="What was this for?"
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20"
                >
                  Save Expense
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
