/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  Tag, 
  X, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft,
  PieChart as PieChartIcon,
  LayoutDashboard,
  History,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  Sliders,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Download,
  Upload,
  Target,
  Zap
} from 'lucide-react';
import Papa from 'papaparse';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, startOfYear, endOfYear, isAfter, isBefore, isSameDay } from 'date-fns';
import { Transaction, DEFAULT_CATEGORIES, Card } from './types';
import { cn } from './utils';

// Mock Data
const INITIAL_CARDS: Card[] = [
  {
    id: '1',
    name: 'Primary Card',
    gradient: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 100%)',
    scale: 1,
    rotate: 0,
    font: 'font-sans',
    balance: 2500,
    cardNumber: '4582 1234 5678 9012',
    expiryDate: '09/28'
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', amount: 2500, category: 'Salary', description: 'Monthly Salary', date: '2026-03-01', type: 'income' },
  { id: '2', amount: 120, category: 'Food', description: 'Grocery Shopping', date: '2026-03-05', type: 'expense' },
  { id: '3', amount: 50, category: 'Entertainment', description: 'Movie Night', date: '2026-03-10', type: 'expense' },
  { id: '4', amount: 300, category: 'Investment', description: 'Stock Purchase', date: '2026-03-12', type: 'expense' },
  { id: '5', amount: 80, category: 'Transport', description: 'Fuel', date: '2026-03-15', type: 'expense' },
];

const COLORS = ['#2dd4bf', '#06b6d4', '#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#71717a'];

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
  'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
  'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
  'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
  'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)',
];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'reports' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [reportPeriod, setReportPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem('cards');
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });
  const [currentCardIndex, setCurrentCardIndex] = useState(() => {
    const saved = localStorage.getItem('currentCardIndex');
    return saved ? parseInt(saved) : 0;
  });
  const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
    const saved = localStorage.getItem('isPrivacyMode');
    return saved === 'true';
  });
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSort = (field: 'date' | 'amount' | 'category') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  useEffect(() => {
    localStorage.setItem('cards', JSON.stringify(cards));
    localStorage.setItem('currentCardIndex', currentCardIndex.toString());
    localStorage.setItem('isPrivacyMode', isPrivacyMode.toString());
  }, [cards, currentCardIndex, isPrivacyMode]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const handleAddCard = () => {
    const newCard: Card = {
      id: Math.random().toString(36).substr(2, 9),
      name: `New Card ${cards.length + 1}`,
      gradient: CARD_GRADIENTS[cards.length % CARD_GRADIENTS.length],
      scale: 1,
      rotate: 0,
      font: 'font-sans',
      balance: 0,
      cardNumber: '•••• •••• •••• ••••',
      expiryDate: 'MM/YY'
    };
    setCards([...cards, newCard]);
    setCurrentCardIndex(cards.length);
  };

  const updateCurrentCard = (updates: Partial<Card>) => {
    const newCards = [...cards];
    newCards[currentCardIndex] = { ...newCards[currentCardIndex], ...updates };
    setCards(newCards);
  };

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return {
      balance: income - expenses,
      income,
      expenses
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const dailyData: Record<string, number> = {};
    transactions.forEach(t => {
      const date = format(parseISO(t.date), 'MMM dd');
      dailyData[date] = (dailyData[date] || 0) + (t.type === 'income' ? t.amount : -t.amount);
    });
    return Object.entries(dailyData).map(([date, amount]) => ({ date, amount }));
  }, [transactions]);

  const categoryData = useMemo(() => {
    const now = new Date();
    const start = reportPeriod === 'monthly' ? startOfMonth(now) : startOfYear(now);
    const end = reportPeriod === 'monthly' ? endOfMonth(now) : endOfYear(now);

    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .filter(t => isWithinInterval(parseISO(t.date), { start, end }))
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions, reportPeriod]);

  const sortedTransactions = useMemo(() => {
    return [...transactions]
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        
        const tDate = parseISO(t.date);
        let matchesDate = true;
        if (startDate && endDate) {
          const start = parseISO(startDate);
          const end = parseISO(endDate);
          // If start > end, we'll just treat it as an empty range or swap them?
          // Let's just use isWithinInterval if start <= end
          if (isAfter(start, end)) {
            matchesDate = false;
          } else {
            matchesDate = isWithinInterval(tDate, { start, end });
          }
        } else if (startDate) {
          const start = parseISO(startDate);
          matchesDate = isAfter(tDate, start) || isSameDay(tDate, start);
        } else if (endDate) {
          const end = parseISO(endDate);
          matchesDate = isBefore(tDate, end) || isSameDay(tDate, end);
        }

        return matchesSearch && matchesType && matchesDate;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'date') {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortField === 'amount') {
          comparison = a.amount - b.amount;
        } else if (sortField === 'category') {
          comparison = a.category.localeCompare(b.category);
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [transactions, searchTerm, filterType, sortField, sortDirection, startDate, endDate]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTransactions([newTransaction, ...transactions]);
    
    // Add to categories if it's a new one
    if (!categories.includes(t.category)) {
      setCategories([...categories, t.category]);
    }
    
    setIsModalOpen(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const exportCSV = () => {
    const csv = Papa.unparse(transactions.map(({ id, ...t }) => t));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTemplate = () => {
    const template = [
      { date: '2026-03-18', description: 'Grocery Shopping', category: 'Food', type: 'expense', amount: 120 },
      { date: '2026-03-18', description: 'Monthly Salary', category: 'Salary', type: 'income', amount: 2500 }
    ];
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transaction_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedTransactions = results.data.map((row: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          date: row.date || new Date().toISOString().split('T')[0],
          description: row.description || 'Imported Transaction',
          category: row.category || 'Uncategorized',
          type: (row.type === 'income' || row.type === 'expense') ? row.type : 'expense',
          amount: parseFloat(row.amount) || 0
        }));

        setTransactions([...importedTransactions, ...transactions]);
        
        // Update categories
        const newCategories = Array.from(new Set([...categories, ...importedTransactions.map(t => t.category)]));
        setCategories(newCategories);
        
        setToast({ message: `Successfully imported ${importedTransactions.length} transactions!`, type: 'success' });
      },
      error: () => {
        setToast({ message: 'Error parsing CSV file. Please check the format.', type: 'error' });
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 min-h-screen">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-light tracking-tight mb-2"
          >
            Financial <span className="italic font-serif">Atmosphere</span>
          </motion.h1>
          <p className="text-white/70 text-sm tracking-widest uppercase">Clarity through every transaction</p>
        </div>
        
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1 backdrop-blur-xl">
            {([
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'history',   label: 'History',   icon: History },
              { id: 'reports',   label: 'Reports',   icon: PieChartIcon },
              { id: 'settings',  label: 'Settings',  icon: Settings },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                  activeTab === id
                    ? "text-white"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                {activeTab === id && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-white/10 border border-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-mint/15 border border-mint/20 text-mint hover:bg-mint/25 hover:border-mint/30 transition-all duration-300 backdrop-blur-xl"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Stats Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* Card Carousel */}
              <div className="relative group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-light">Your Cards</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAddCard}
                      className="p-2 glass-button rounded-full text-mint hover:bg-mint/10"
                      title="Add New Card"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setCurrentCardIndex(prev => (prev - 1 + cards.length) % cards.length)}
                      className="p-2 glass-button rounded-full"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setCurrentCardIndex(prev => (prev + 1) % cards.length)}
                      className="p-2 glass-button rounded-full"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col items-center py-8 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentCardIndex}
                      initial={{ opacity: 0, x: 60, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -60, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="w-full flex justify-center"
                    >
                      <VirtualCard
                        gradient={cards[currentCardIndex].gradient}
                        scale={cards[currentCardIndex].scale}
                        rotate={cards[currentCardIndex].rotate}
                        font={cards[currentCardIndex].font}
                        name={cards[currentCardIndex].name}
                        cardNumber={cards[currentCardIndex].cardNumber}
                        expiryDate={cards[currentCardIndex].expiryDate}
                        isPrivacyMode={isPrivacyMode}
                        balance={cards[currentCardIndex].balance}
                      />
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Pagination Dots */}
                  <div className="flex gap-2 mt-8">
                    {cards.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentCardIndex(i)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          currentCardIndex === i ? "w-8 bg-mint" : "bg-white/20 hover:bg-white/40"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title="Total Balance" 
                  value={stats.balance} 
                  icon={<Wallet className="w-6 h-6" />}
                  trend="+12% from last month"
                  isPrivacyMode={isPrivacyMode}
                />
                <StatCard 
                  title="Total Income" 
                  value={stats.income} 
                  icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
                  color="emerald"
                  isPrivacyMode={isPrivacyMode}
                />
                <StatCard 
                  title="Total Expenses" 
                  value={stats.expenses} 
                  icon={<TrendingDown className="w-6 h-6 text-orange-400" />}
                  color="orange"
                  isPrivacyMode={isPrivacyMode}
                />
              </div>

              {/* Main Chart */}
              <div className="glass-panel p-8 h-[400px]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-light">Cash Flow Overview</h3>
                  <div className="flex gap-2 text-xs uppercase tracking-widest text-white/70 font-medium">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500" /> Balance</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff4e00" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ff4e00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.4)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                      height={60}
                      interval="preserveStartEnd"
                      minTickGap={30}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.4)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(10, 5, 2, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                      }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#ff4e00" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sidebar Section */}
            <div className="space-y-8">
              {/* Card Customizer */}
              <div className="glass-panel p-8">
                <div className="flex items-center gap-2 mb-6 text-mint">
                  <Sliders className="w-5 h-5" />
                  <h3 className="text-xl font-light">Customizer</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-3 block">Card Name</label>
                    <input 
                      type="text"
                      value={cards[currentCardIndex].name || ''}
                      onChange={(e) => updateCurrentCard({ name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-mint transition-all"
                      placeholder="Enter card name..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-3 block">Background</label>
                    <div className="grid grid-cols-4 gap-2">
                      {CARD_GRADIENTS.map((grad, i) => (
                        <button 
                          key={i}
                          onClick={() => updateCurrentCard({ gradient: grad })}
                          className={cn(
                            "w-full aspect-square rounded-lg border-2 transition-all",
                            cards[currentCardIndex].gradient === grad ? "border-mint scale-110" : "border-transparent opacity-50 hover:opacity-100"
                          )}
                          style={{ background: grad }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Scale</label>
                      <span className="text-[10px] text-mint font-mono">{(cards[currentCardIndex].scale ?? 1).toFixed(2)}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="1.5" 
                      step="0.01"
                      value={cards[currentCardIndex].scale ?? 1}
                      onChange={(e) => updateCurrentCard({ scale: parseFloat(e.target.value) })}
                      className="w-full accent-mint"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Rotation</label>
                      <span className="text-[10px] text-mint font-mono">{cards[currentCardIndex].rotate ?? 0}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="-45" 
                      max="45" 
                      step="1"
                      value={cards[currentCardIndex].rotate ?? 0}
                      onChange={(e) => updateCurrentCard({ rotate: parseInt(e.target.value) })}
                      className="w-full accent-mint"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-3 block">Card Details</label>
                    <div className="space-y-3">
                      <input 
                        type="text"
                        value={cards[currentCardIndex].cardNumber || ''}
                        onChange={(e) => updateCurrentCard({ cardNumber: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-mint transition-all"
                        placeholder="Card Number (e.g. 4582 •••• •••• 9012)"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text"
                          value={cards[currentCardIndex].expiryDate || ''}
                          onChange={(e) => updateCurrentCard({ expiryDate: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-mint transition-all"
                          placeholder="Expiry (MM/YY)"
                        />
                        <input 
                          type="number"
                          value={cards[currentCardIndex].balance ?? 0}
                          onChange={(e) => updateCurrentCard({ balance: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-mint transition-all"
                          placeholder="Balance"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-3 block">Typography</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['font-sans', 'font-serif', 'font-mono'].map((f) => (
                        <button 
                          key={f}
                          onClick={() => updateCurrentCard({ font: f })}
                          className={cn(
                            "py-2 px-3 rounded-xl text-[10px] uppercase tracking-widest border transition-all",
                            cards[currentCardIndex].font === f ? "bg-mint/20 border-mint text-mint" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                          )}
                        >
                          {f.split('-')[1]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Savings, Insights, Pie Chart */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Savings Goals */}
              <div className="glass-panel p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-mint">
                    <Target className="w-5 h-5" />
                    <h3 className="text-xl font-light">Savings Goals</h3>
                  </div>
                  <button className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">Manage</button>
                </div>
                <div className="space-y-6">
                  {[
                    { name: 'New MacBook Pro', current: 1800, target: 2500, color: '#2dd4bf' },
                    { name: 'Summer Vacation', current: 3200, target: 5000, color: '#8b5cf6' }
                  ].map((goal) => (
                    <div key={goal.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">{goal.name}</span>
                        <span className="font-mono text-xs">${goal.current} / ${goal.target}</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: goal.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Insights */}
              <div className="glass-panel p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-orange-400">
                    <Zap className="w-5 h-5" />
                    <h3 className="text-xl font-light">Quick Insights</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-xs text-white/60 leading-relaxed">
                      You've spent <span className="text-orange-400 font-bold">15% less</span> on <span className="text-white font-medium">Food</span> this week compared to your average.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-xs text-white/60 leading-relaxed">
                      Your <span className="text-mint font-bold">Savings Rate</span> is currently at <span className="text-white font-medium">24%</span>. You're on track for your vacation goal!
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="glass-panel p-8">
                <h3 className="text-xl font-light mb-6 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 opacity-50" />
                  Expenses
                </h3>
                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(10, 5, 2, 0.95)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '16px',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {categoryData.slice(0, 4).map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-2 text-[10px]">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-white/60 truncate">{cat.name}</span>
                      <span className="text-white font-medium ml-auto">${cat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row: Recent Activity - Full Width */}
            <div className="lg:col-span-3 glass-panel p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-light">Recent Activity</h3>
                    <p className="text-xs text-white/40">Your latest transactions across all accounts</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('history')} 
                  className="glass-button px-6 py-2 text-xs uppercase tracking-widest text-orange-400 border-orange-400/20 hover:bg-orange-400/10"
                >
                  View Full History
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-white/40 text-[10px] uppercase tracking-widest border-b border-white/5">
                      <th className="pb-4 font-medium">Date</th>
                      <th className="pb-4 font-medium">Description</th>
                      <th className="pb-4 font-medium">Category</th>
                      <th className="pb-4 font-medium">Type</th>
                      <th className="pb-4 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.slice(0, 6).map(t => (
                      <tr key={t.id} className="group hover:bg-white/5 transition-colors">
                        <td className="py-4 text-xs text-white/40">{format(parseISO(t.date), 'MMM dd, yyyy')}</td>
                        <td className="py-4">
                          <span className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">{t.description}</span>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-1 rounded-lg bg-white/5 text-[10px] text-white/60 border border-white/10">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5">
                            {t.type === 'income' ? (
                              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <ArrowDownLeft className="w-3 h-3 text-orange-400" />
                            )}
                            <span className={cn(
                              "text-[10px] uppercase tracking-wider",
                              t.type === 'income' ? "text-emerald-400" : "text-orange-400"
                            )}>
                              {t.type}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-right font-mono text-sm">
                          <span className={t.type === 'income' ? "text-emerald-400" : "text-white"}>
                            {t.type === 'income' ? '+' : '-'}${isPrivacyMode ? '••••' : t.amount.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'history' ? (
          <motion.div 
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-panel p-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h3 className="text-2xl font-light">Transaction History</h3>
              <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
                <div className="relative flex-1 md:w-48">
                  <input 
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full glass-panel bg-white/5 px-4 py-2 text-sm outline-none focus:border-mint/50 transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-2 glass-panel p-1 bg-white/5">
                  <div className="flex items-center gap-1 px-2">
                    <Calendar className="w-3 h-3 text-white/40" />
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent text-xs text-white/70 outline-none [color-scheme:dark]"
                    />
                  </div>
                  <span className="text-white/20">-</span>
                  <div className="flex items-center gap-1 px-2">
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent text-xs text-white/70 outline-none [color-scheme:dark]"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button 
                      onClick={() => { setStartDate(''); setEndDate(''); }}
                      className="p-1 hover:bg-white/10 rounded-full transition-colors"
                      title="Clear dates"
                    >
                      <X className="w-3 h-3 text-white/40" />
                    </button>
                  )}
                </div>

                <div className="flex glass-panel p-1 bg-white/5">
                  {(['all', 'income', 'expense'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={cn(
                        "px-4 py-1 rounded-xl text-xs uppercase tracking-widest transition-all",
                        filterType === type ? "bg-white/20 text-white font-medium" : "text-white/40 hover:text-white"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white/70 text-xs uppercase tracking-widest border-b border-white/20">
                    <th className="pb-4 font-medium">
                      <button 
                        onClick={() => handleSort('date')}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        Date
                        {sortField === 'date' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </button>
                    </th>
                    <th className="pb-4 font-medium">Description</th>
                    <th className="pb-4 font-medium">
                      <button 
                        onClick={() => handleSort('category')}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        Category
                        {sortField === 'category' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </button>
                    </th>
                    <th className="pb-4 font-medium">Type</th>
                    <th className="pb-4 font-medium text-right">
                      <button 
                        onClick={() => handleSort('amount')}
                        className="flex items-center gap-1 hover:text-white transition-colors ml-auto"
                      >
                        Amount
                        {sortField === 'amount' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </button>
                    </th>
                    <th className="pb-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedTransactions.map(t => (
                    <tr key={t.id} className="group hover:bg-white/10 transition-colors">
                      <td className="py-4 text-sm text-white/80">{format(parseISO(t.date), 'MMM dd, yyyy')}</td>
                      <td className="py-4 font-semibold">{t.description}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white font-medium border border-white/20">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-4">
                        {t.type === 'income' ? (
                          <span className="text-emerald-400 flex items-center gap-1 text-xs">
                            <ArrowUpRight className="w-3 h-3" /> Income
                          </span>
                        ) : (
                          <span className="text-orange-400 flex items-center gap-1 text-xs">
                            <ArrowDownLeft className="w-3 h-3" /> Expense
                          </span>
                        )}
                      </td>
                      <td className={cn(
                        "py-4 text-right font-mono",
                        t.type === 'income' ? "text-emerald-400" : "text-white"
                      )}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => deleteTransaction(t.id)}
                          className="p-2 text-white/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : activeTab === 'reports' ? (
          <motion.div 
            key="reports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="glass-panel p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                  <h3 className="text-2xl font-light mb-2">Spending Analysis</h3>
                  <p className="text-white/70 text-sm tracking-widest uppercase">Visual breakdown by category</p>
                </div>
                <div className="glass-panel p-1 flex gap-1">
                  <button 
                    onClick={() => setReportPeriod('monthly')}
                    className={cn(
                      "px-4 py-2 rounded-2xl text-xs transition-all",
                      reportPeriod === 'monthly' ? "bg-white/10 text-white font-medium shadow-inner" : "text-white/70 hover:text-white"
                    )}
                  >
                    Monthly
                  </button>
                  <button 
                    onClick={() => setReportPeriod('yearly')}
                    className={cn(
                      "px-4 py-2 rounded-2xl text-xs transition-all",
                      reportPeriod === 'yearly' ? "bg-white/10 text-white font-medium shadow-inner" : "text-white/70 hover:text-white"
                    )}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="h-[400px]">
                  <h4 className="text-sm uppercase tracking-widest text-white/40 mb-8 text-center">Category Distribution</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={8}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(10, 5, 2, 0.95)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '16px',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-[400px]">
                  <h4 className="text-sm uppercase tracking-widest text-white/70 mb-8 text-center">Spending by Volume</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="rgba(255,255,255,0.7)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        width={100}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                        contentStyle={{ 
                          backgroundColor: 'rgba(10, 5, 2, 0.95)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '16px',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="glass-panel p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <h5 className="text-sm font-medium">{cat.name}</h5>
                  </div>
                  <p className="text-2xl font-light font-mono">${cat.value.toLocaleString()}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">
                    {((cat.value / categoryData.reduce((acc, c) => acc + c.value, 0)) * 100).toFixed(1)}% of total
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <div className="glass-panel p-8 bg-slate-900/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/10">
              <h3 className="text-2xl font-light mb-8">Account Settings</h3>
              
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Privacy Mode</h4>
                    <p className="text-xs text-white/40">Hide balances from dashboard</p>
                  </div>
                  <button 
                    onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                    className={cn(
                      "w-12 h-6 rounded-full relative p-1 transition-all",
                      isPrivacyMode ? "bg-mint/20" : "bg-white/10"
                    )}
                  >
                    <motion.div 
                      animate={{ x: isPrivacyMode ? 24 : 0 }}
                      className={cn(
                        "w-4 h-4 rounded-full",
                        isPrivacyMode ? "bg-mint" : "bg-white/40"
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Biometric Login</h4>
                    <p className="text-xs text-white/40">Use FaceID or TouchID</p>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-mint/20 relative p-1 transition-all">
                    <div className="w-4 h-4 rounded-full bg-mint ml-auto" />
                  </button>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <h4 className="text-sm font-medium mb-4">Data Management</h4>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        setConfirmModal({
                          title: 'Reset All Data',
                          message: 'Are you sure you want to clear all data? This action cannot be undone.',
                          onConfirm: () => {
                            setTransactions(INITIAL_TRANSACTIONS);
                            localStorage.clear();
                            setToast({ message: 'All data has been reset.', type: 'success' });
                          }
                        });
                      }}
                      className="glass-button px-6 py-2 text-xs uppercase tracking-widest text-red-400 border-red-400/20 hover:bg-red-400/10"
                    >
                      Reset Data
                    </button>
                    <button 
                      onClick={exportCSV}
                      className="glass-button px-6 py-2 text-xs uppercase tracking-widest text-white/60 hover:text-white"
                    >
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <h4 className="text-sm font-medium mb-4">CSV Importer</h4>
                  <p className="text-xs text-white/40 mb-6">Import transactions from a CSV file. Use our template for the correct format.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={downloadTemplate}
                      className="glass-panel p-4 flex items-center justify-between hover:bg-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 group-hover:text-white transition-colors">
                          <Download className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium">Download Template</p>
                          <p className="text-[10px] text-white/30">CSV Format Guide</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    </button>

                    <label className="glass-panel p-4 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-mint/20 flex items-center justify-center text-mint">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium">Upload CSV</p>
                          <p className="text-[10px] text-white/30">Select file to import</p>
                        </div>
                      </div>
                      <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleImportCSV} 
                        className="hidden" 
                      />
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 bg-slate-900/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-mint/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-mint/20 flex items-center justify-center text-mint">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Security Upgrade</h4>
                  <p className="text-xs text-white/60">Your account is currently protected by standard encryption.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )
}
      </AnimatePresence>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel p-8 w-full max-w-md relative z-10 bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-light">New Entry</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <AddTransactionForm onSubmit={addTransaction} categories={categories} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel p-8 w-full max-w-sm relative z-10 bg-slate-950 border-white/10"
            >
              <h3 className="text-xl font-light mb-4">{confirmModal.title}</h3>
              <p className="text-sm text-white/60 mb-8 leading-relaxed">{confirmModal.message}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 glass-button py-3 text-xs uppercase tracking-widest text-white/40 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className="flex-1 glass-button py-3 text-xs uppercase tracking-widest bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={cn(
              "fixed bottom-8 left-1/2 z-[70] px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 min-w-[300px]",
              toast.type === 'success' ? "bg-mint/10 border-mint/20 text-mint" : "bg-red-500/10 border-red-500/20 text-red-400"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              toast.type === 'success' ? "bg-mint" : "bg-red-400"
            )} />
            <span className="text-xs font-medium tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VirtualCard({ gradient, scale, rotate, font, isPrivacyMode, balance, name, cardNumber, expiryDate }: { 
  gradient: string; 
  scale: number; 
  rotate: number; 
  font: string;
  name: string;
  cardNumber: string;
  expiryDate: string;
  isPrivacyMode?: boolean;
  balance?: number;
}) {
  return (
    <motion.div
      style={{
        background: gradient,
        scale: scale,
        rotate: rotate
      }}
      whileHover={{
        scale: scale * 1.05,
        rotate: 0,
        y: -10,
        boxShadow: "0 30px 60px -12px rgba(0,0,0,0.5), 0 18px 36px -18px rgba(0,0,0,0.5)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "w-full max-w-[400px] aspect-[1.58/1] rounded-[2rem] p-7 relative overflow-hidden shadow-2xl cursor-pointer",
        font
      )}
    >
      {/* Subtle shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative h-full flex flex-col justify-between">
        {/* Row 1: Icon + Name | Balance */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-semibold text-white/90 uppercase tracking-widest">{name}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-white/60 mb-0.5">Balance</p>
            <p className="text-base font-bold text-white font-mono leading-none">
              {isPrivacyMode ? '••••' : `$${balance?.toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* Row 2: Chip */}
        <div className="w-10 h-8 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 rounded-md relative overflow-hidden shadow-inner border border-amber-300/50">
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-px opacity-40">
            <div className="border-r border-b border-black/20" />
            <div className="border-r border-b border-black/20" />
            <div className="border-b border-black/20" />
            <div className="border-r border-black/20" />
            <div className="border-r border-black/20" />
            <div className="border-black/20" />
          </div>
        </div>

        {/* Row 3: Card Number */}
        <p className="text-xl tracking-[0.18em] font-medium text-white drop-shadow-lg">
          {cardNumber}
        </p>

        {/* Row 4: Card Holder | Expiry + Payment Mark */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[8px] uppercase tracking-widest text-white/60 mb-1">Card Holder</p>
            <p className="text-sm font-semibold text-white uppercase tracking-wider leading-none">{name}</p>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-[8px] uppercase tracking-widest text-white/60 mb-1">Expires</p>
              <p className="text-sm font-semibold text-white leading-none">{expiryDate}</p>
            </div>
            <div className="flex -space-x-2 opacity-80">
              <div className="w-7 h-7 rounded-full bg-white/40 backdrop-blur-sm" />
              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, trend, color = 'default', isPrivacyMode }: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  trend?: string;
  color?: 'default' | 'emerald' | 'orange';
  isPrivacyMode?: boolean;
}) {
  return (
    <div className="glass-panel p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
        {icon}
      </div>
      <p className="text-white/70 text-xs uppercase tracking-widest mb-4">{title}</p>
      <h4 className={cn(
        "text-3xl font-semibold font-mono",
        color === 'emerald' ? "text-emerald-400" : color === 'orange' ? "text-orange-400" : "text-white"
      )}>
        {isPrivacyMode ? '••••' : `$${value.toLocaleString()}`}
      </h4>
      {trend && <p className="mt-4 text-[10px] text-white/50 uppercase tracking-widest font-medium">{trend}</p>}
    </div>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  key?: string;
}

const TransactionItem = ({ transaction, onDelete, isPrivacyMode }: TransactionItemProps & { isPrivacyMode?: boolean }) => {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center glass-panel",
          transaction.type === 'income' ? "bg-emerald-500/10" : "bg-orange-500/10"
        )}>
          {transaction.type === 'income' ? <ArrowUpRight className="w-5 h-5 text-emerald-400" /> : <ArrowDownLeft className="w-5 h-5 text-orange-400" />}
        </div>
        <div>
          <p className="text-sm font-semibold">{transaction.description}</p>
          <p className="text-[10px] text-white/60 uppercase tracking-widest font-medium">{transaction.category} • {format(parseISO(transaction.date), 'MMM dd')}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn(
          "text-sm font-mono",
          transaction.type === 'income' ? "text-emerald-400" : "text-white"
        )}>
          {isPrivacyMode ? '••••' : `${transaction.type === 'income' ? '+' : '-'}$${transaction.amount}`}
        </p>
        <button 
          onClick={() => onDelete(transaction.id)}
          className="opacity-0 group-hover:opacity-100 text-[10px] text-red-400 uppercase tracking-widest transition-opacity"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

function AddTransactionForm({ onSubmit, categories }: { onSubmit: (t: Omit<Transaction, 'id'>) => void, categories: string[] }) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: categories[0] || 'Other',
    type: 'expense' as 'income' | 'expense',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    
    const finalCategory = isAddingCustom ? customCategory : formData.category;
    if (!finalCategory) return;

    onSubmit({
      ...formData,
      category: finalCategory,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex p-1 glass-panel bg-white/5">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: 'expense' })}
          className={cn(
            "flex-1 py-2 rounded-xl text-sm transition-all",
            formData.type === 'expense' ? "bg-orange-500/20 text-orange-200" : "text-white/40"
          )}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: 'income' })}
          className={cn(
            "flex-1 py-2 rounded-xl text-sm transition-all",
            formData.type === 'income' ? "bg-emerald-500/20 text-emerald-200" : "text-white/40"
          )}
        >
          Income
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/60 mb-2 block font-medium">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">$</span>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="w-full glass-panel bg-white/10 px-8 py-3 outline-none focus:border-orange-500/50 transition-colors font-mono text-white"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/60 mb-2 block font-medium">Description</label>
          <input
            type="text"
            required
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full glass-panel bg-white/10 px-4 py-3 outline-none focus:border-orange-500/50 transition-colors text-white"
            placeholder="What was this for?"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] uppercase tracking-widest text-white/60 block font-medium">Category</label>
              <button 
                type="button"
                onClick={() => setIsAddingCustom(!isAddingCustom)}
                className="text-[10px] uppercase tracking-widest text-orange-400 hover:text-orange-300 font-semibold"
              >
                {isAddingCustom ? "Select Existing" : "Create New"}
              </button>
            </div>
            
            {isAddingCustom ? (
              <input
                type="text"
                required
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                className="w-full glass-panel bg-white/10 px-4 py-3 outline-none focus:border-orange-500/50 transition-colors text-white"
                placeholder="New category name..."
                autoFocus
              />
            ) : (
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full glass-panel bg-white/10 px-4 py-3 outline-none focus:border-orange-500/50 transition-colors appearance-none text-white"
              >
                {categories.map(c => <option key={c} value={c} className="bg-[#1a100a]">{c}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/60 mb-2 block font-medium">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full glass-panel bg-white/10 px-4 py-3 outline-none focus:border-orange-500/50 transition-colors text-white"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full glass-button py-4 bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/40 text-orange-200 font-medium tracking-widest uppercase text-sm mt-4"
      >
        Save Entry
      </button>
    </form>
  );
}
