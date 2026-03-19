/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
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
  Zap,
  Sparkles,
  CheckCircle2,
  Circle,
  Sun,
  Moon
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
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, startOfYear, endOfYear, isAfter, isBefore, isSameDay, subMonths, differenceInDays } from 'date-fns';
import { Transaction, DEFAULT_CATEGORIES, Card, Goal } from './types';
import { cn } from './utils';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const DEMO_CARDS: Card[] = [
  { id: '1', name: 'Chase Sapphire', gradient: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)', scale: 1, rotate: -3, font: 'font-mono', balance: 4820.50, cardNumber: '4532 •••• •••• 8821', expiryDate: '08/27' },
  { id: '2', name: 'Amex Gold', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', scale: 0.95, rotate: 2, font: 'font-sans', balance: 1240.00, cardNumber: '3782 •••• •••• 1005', expiryDate: '11/26' },
];

const DEMO_GOALS = [
  { id: 'g1', name: 'Emergency Fund', target: 10000, current: 6400, color: '#2dd4bf' },
  { id: 'g2', name: 'New MacBook Pro', target: 2500, current: 1850, color: '#8b5cf6' },
  { id: 'g3', name: 'Summer Vacation', target: 5000, current: 2100, color: '#f59e0b' },
];

const DEMO_TRANSACTIONS: Transaction[] = [
  // January income
  { id: 't01', amount: 5200, category: 'Salary', description: 'Monthly Salary — Acme Corp', date: '2026-01-01', type: 'income' },
  { id: 't02', amount: 320, category: 'Investment', description: 'Dividend Payment', date: '2026-01-15', type: 'income' },
  // January expenses
  { id: 't03', amount: 1450, category: 'Bills', description: 'Rent', date: '2026-01-02', type: 'expense' },
  { id: 't04', amount: 94.80, category: 'Food', description: 'Trader Joe\'s', date: '2026-01-04', type: 'expense' },
  { id: 't05', amount: 14.99, category: 'Entertainment', description: 'Netflix', date: '2026-01-05', type: 'expense' },
  { id: 't06', amount: 52.40, category: 'Transport', description: 'Uber — weekly', date: '2026-01-07', type: 'expense' },
  { id: 't07', amount: 189.99, category: 'Shopping', description: 'Nike — Running Shoes', date: '2026-01-09', type: 'expense' },
  { id: 't08', amount: 73.20, category: 'Food', description: 'Whole Foods', date: '2026-01-11', type: 'expense' },
  { id: 't09', amount: 140, category: 'Health', description: 'Gym Membership', date: '2026-01-12', type: 'expense' },
  { id: 't10', amount: 9.99, category: 'Entertainment', description: 'Spotify', date: '2026-01-13', type: 'expense' },
  { id: 't11', amount: 38.50, category: 'Food', description: 'Chipotle × 4', date: '2026-01-16', type: 'expense' },
  { id: 't12', amount: 120, category: 'Bills', description: 'Electricity', date: '2026-01-18', type: 'expense' },
  { id: 't13', amount: 45, category: 'Transport', description: 'Gas Station', date: '2026-01-20', type: 'expense' },
  { id: 't14', amount: 299, category: 'Shopping', description: 'Apple — AirPods Pro', date: '2026-01-22', type: 'expense' },
  { id: 't15', amount: 62.10, category: 'Food', description: 'Instacart Delivery', date: '2026-01-25', type: 'expense' },
  { id: 't16', amount: 18, category: 'Entertainment', description: 'Movie Tickets', date: '2026-01-27', type: 'expense' },
  // February income
  { id: 't17', amount: 5200, category: 'Salary', description: 'Monthly Salary — Acme Corp', date: '2026-02-01', type: 'income' },
  { id: 't18', amount: 150, category: 'Other', description: 'Freelance Design Work', date: '2026-02-14', type: 'income' },
  // February expenses
  { id: 't19', amount: 1450, category: 'Bills', description: 'Rent', date: '2026-02-02', type: 'expense' },
  { id: 't20', amount: 88.40, category: 'Food', description: 'Trader Joe\'s', date: '2026-02-03', type: 'expense' },
  { id: 't21', amount: 14.99, category: 'Entertainment', description: 'Netflix', date: '2026-02-05', type: 'expense' },
  { id: 't22', amount: 67.80, category: 'Transport', description: 'Uber — weekly', date: '2026-02-06', type: 'expense' },
  { id: 't23', amount: 112, category: 'Bills', description: 'Electricity', date: '2026-02-08', type: 'expense' },
  { id: 't24', amount: 55.90, category: 'Food', description: 'Whole Foods', date: '2026-02-10', type: 'expense' },
  { id: 't25', amount: 9.99, category: 'Entertainment', description: 'Spotify', date: '2026-02-13', type: 'expense' },
  { id: 't26', amount: 420, category: 'Shopping', description: 'SSENSE — Jacket', date: '2026-02-14', type: 'expense' },
  { id: 't27', amount: 41.20, category: 'Food', description: 'Chipotle × 4', date: '2026-02-17', type: 'expense' },
  { id: 't28', amount: 85, category: 'Health', description: 'Doctor Visit Copay', date: '2026-02-19', type: 'expense' },
  { id: 't29', amount: 38, category: 'Transport', description: 'Gas Station', date: '2026-02-21', type: 'expense' },
  { id: 't30', amount: 140, category: 'Health', description: 'Gym Membership', date: '2026-02-22', type: 'expense' },
  { id: 't31', amount: 74.50, category: 'Food', description: 'Instacart Delivery', date: '2026-02-24', type: 'expense' },
  { id: 't32', amount: 29.99, category: 'Entertainment', description: 'YouTube Premium + games', date: '2026-02-27', type: 'expense' },
  // March income
  { id: 't33', amount: 5200, category: 'Salary', description: 'Monthly Salary — Acme Corp', date: '2026-03-01', type: 'income' },
  // March expenses
  { id: 't34', amount: 1450, category: 'Bills', description: 'Rent', date: '2026-03-02', type: 'expense' },
  { id: 't35', amount: 91.60, category: 'Food', description: 'Trader Joe\'s', date: '2026-03-04', type: 'expense' },
  { id: 't36', amount: 14.99, category: 'Entertainment', description: 'Netflix', date: '2026-03-05', type: 'expense' },
  { id: 't37', amount: 59.40, category: 'Transport', description: 'Uber — weekly', date: '2026-03-07', type: 'expense' },
  { id: 't38', amount: 108, category: 'Bills', description: 'Electricity', date: '2026-03-09', type: 'expense' },
  { id: 't39', amount: 140, category: 'Health', description: 'Gym Membership', date: '2026-03-12', type: 'expense' },
  { id: 't40', amount: 9.99, category: 'Entertainment', description: 'Spotify', date: '2026-03-13', type: 'expense' },
  { id: 't41', amount: 67.30, category: 'Food', description: 'Whole Foods', date: '2026-03-15', type: 'expense' },
  { id: 't42', amount: 349, category: 'Investment', description: 'ETF Purchase — VOO', date: '2026-03-16', type: 'expense' },
  { id: 't43', amount: 44.80, category: 'Transport', description: 'Gas Station', date: '2026-03-18', type: 'expense' },
];

const INITIAL_CARDS: Card[] = IS_DEMO ? DEMO_CARDS : [];
const INITIAL_TRANSACTIONS: Transaction[] = IS_DEMO ? DEMO_TRANSACTIONS : [];

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
    if (IS_DEMO) return DEMO_TRANSACTIONS;
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
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [isSmartImportOpen, setIsSmartImportOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>(() => {
    if (IS_DEMO) return DEMO_GOALS;
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : [];
  });
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#2dd4bf');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');

  const currentCard = cards[currentCardIndex];

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

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-mint', accentColor);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

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
    return Object.entries(data).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
  }, [transactions, reportPeriod]);

  const insights = useMemo(() => {
    if (transactions.length === 0) return [] as { text: React.ReactNode; color: string }[];

    // Use the most recent month that has data, not necessarily today
    const latestDate = transactions.reduce((max, t) =>
      parseISO(t.date) > max ? parseISO(t.date) : max, parseISO(transactions[0].date));
    const thisMonthStart = startOfMonth(latestDate);
    const thisMonthEnd = endOfMonth(latestDate);
    const lastMonthStart = startOfMonth(subMonths(latestDate, 1));
    const lastMonthEnd = endOfMonth(subMonths(latestDate, 1));

    const inRange = (t: Transaction, start: Date, end: Date) =>
      isWithinInterval(parseISO(t.date), { start, end });

    const thisMonthExpenses = transactions.filter(t => t.type === 'expense' && inRange(t, thisMonthStart, thisMonthEnd));
    const lastMonthExpenses = transactions.filter(t => t.type === 'expense' && inRange(t, lastMonthStart, lastMonthEnd));
    const thisMonthIncome = transactions.filter(t => t.type === 'income' && inRange(t, thisMonthStart, thisMonthEnd));

    const thisTotal = thisMonthExpenses.reduce((s, t) => s + t.amount, 0);
    const lastTotal = lastMonthExpenses.reduce((s, t) => s + t.amount, 0);
    const thisIncome = thisMonthIncome.reduce((s, t) => s + t.amount, 0);

    const result: { text: React.ReactNode; color: string }[] = [];

    // 1. Top spending category this month
    const catMap: Record<string, number> = {};
    thisMonthExpenses.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
      result.push({
        color: '#f59e0b',
        text: <>Your top spend this month is <span className="text-white font-medium">{topCat[0]}</span> at <span className="text-orange-400 font-bold">${topCat[1].toFixed(2)}</span>.</>
      });
    }

    // 2. Month-over-month change
    if (lastTotal > 0 && thisTotal > 0) {
      const pct = ((thisTotal - lastTotal) / lastTotal) * 100;
      const up = pct > 0;
      result.push({
        color: up ? '#f43f5e' : '#10b981',
        text: <>Spending is <span className={`font-bold ${up ? 'text-red-400' : 'text-emerald-400'}`}>{up ? '▲' : '▼'} {Math.abs(pct).toFixed(0)}%</span> {up ? 'higher' : 'lower'} than last month.</>
      });
    }

    // 3. Savings rate this month
    if (thisIncome > 0) {
      const rate = Math.max(0, ((thisIncome - thisTotal) / thisIncome) * 100);
      result.push({
        color: '#2dd4bf',
        text: <>Your <span className="text-mint font-bold">savings rate</span> this month is <span className="text-white font-medium">{rate.toFixed(0)}%</span> of income.</>
      });
    }

    // 4. Biggest single expense this month
    const biggest = thisMonthExpenses.sort((a, b) => b.amount - a.amount)[0];
    if (biggest) {
      result.push({
        color: '#8b5cf6',
        text: <>Largest expense: <span className="text-white font-medium">{biggest.description}</span> — <span className="text-purple-400 font-bold">${biggest.amount.toFixed(2)}</span>.</>
      });
    }

    // 5. Daily average spend
    const daysElapsed = Math.max(1, differenceInDays(latestDate, thisMonthStart) + 1);
    if (thisTotal > 0) {
      result.push({
        color: '#06b6d4',
        text: <>You're spending an average of <span className="text-cyan-400 font-bold">${(thisTotal / daysElapsed).toFixed(2)}/day</span> this month.</>
      });
    }

    return result.slice(0, 3);
  }, [transactions]);

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

        const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
        const matchesAmount =
          (!minAmount || t.amount >= parseFloat(minAmount)) &&
          (!maxAmount || t.amount <= parseFloat(maxAmount));

        return matchesSearch && matchesType && matchesDate && matchesCategory && matchesAmount;
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
  }, [transactions, searchTerm, filterType, sortField, sortDirection, startDate, endDate, filterCategory, minAmount, maxAmount]);

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

  const exportPDF = () => {
    const now = new Date();
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpenses;

    const catTotals: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });
    const catRows = Object.entries(catTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `<tr><td>${cat}</td><td>$${amt.toFixed(2)}</td><td>${((amt / totalExpenses) * 100).toFixed(1)}%</td></tr>`)
      .join('');

    const txRows = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(t => `<tr>
        <td>${t.date}</td>
        <td>${t.description}</td>
        <td>${t.category}</td>
        <td style="color:${t.type === 'income' ? '#10b981' : '#f43f5e'}">${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Financial Report — ${format(now, 'MMMM yyyy')}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; padding: 40px; font-size: 13px; }
      h1 { font-size: 28px; font-weight: 300; color: #0f172a; margin-bottom: 4px; }
      .subtitle { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 32px; }
      .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
      .card { padding: 20px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
      .card-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
      .card-value { font-size: 24px; font-weight: 300; }
      .income { color: #10b981; } .expense { color: #f43f5e; } .balance { color: ${accentColor}; }
      h2 { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 24px 0 12px; }
      table { width: 100%; border-collapse: collapse; }
      th { text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; border-bottom: 2px solid #e2e8f0; }
      td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
      tr:last-child td { border-bottom: none; }
      @media print { body { padding: 20px; } }
    </style></head><body>
    <h1>Financial Report</h1>
    <p class="subtitle">Generated ${format(now, 'MMMM d, yyyy')}</p>
    <div class="summary">
      <div class="card"><div class="card-label">Total Income</div><div class="card-value income">$${totalIncome.toFixed(2)}</div></div>
      <div class="card"><div class="card-label">Total Expenses</div><div class="card-value expense">$${totalExpenses.toFixed(2)}</div></div>
      <div class="card"><div class="card-label">Net Balance</div><div class="card-value balance">$${balance.toFixed(2)}</div></div>
    </div>
    <h2>Spending by Category</h2>
    <table><thead><tr><th>Category</th><th>Amount</th><th>% of Expenses</th></tr></thead><tbody>${catRows}</tbody></table>
    <h2>All Transactions (${transactions.length})</h2>
    <table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead><tbody>${txRows}</tbody></table>
    </body></html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.onload = () => { w.print(); };
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
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl glass-button text-white/50 hover:text-white transition-all"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

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
                    {currentCard ? (
                      <motion.div
                        key={currentCardIndex}
                        initial={{ opacity: 0, x: 60, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -60, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full flex justify-center"
                      >
                        <VirtualCard
                          gradient={currentCard.gradient}
                          scale={currentCard.scale}
                          rotate={currentCard.rotate}
                          font={currentCard.font}
                          name={currentCard.name}
                          cardNumber={currentCard.cardNumber}
                          expiryDate={currentCard.expiryDate}
                          isPrivacyMode={isPrivacyMode}
                          balance={currentCard.balance}
                        />
                      </motion.div>
                    ) : (
                      <motion.div key="no-card" className="flex flex-col items-center justify-center py-8 text-white/40 gap-2">
                        <CreditCard className="w-10 h-10 opacity-30" />
                        <p className="text-sm">No cards yet — add one above</p>
                      </motion.div>
                    )}
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
                  {!currentCard && (
                    <p className="text-white/40 text-sm text-center py-4">Add a card to customize it.</p>
                  )}
                  {currentCard && <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-3 block">Card Name</label>
                    <input
                      type="text"
                      value={currentCard.name || ''}
                      onChange={(e) => updateCurrentCard({ name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-mint transition-all"
                      placeholder="Enter card name..."
                    />
                  </div>}
                  {currentCard && <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-3 block">Background</label>
                    <div className="grid grid-cols-4 gap-2">
                      {CARD_GRADIENTS.map((grad, i) => (
                        <button
                          key={i}
                          onClick={() => updateCurrentCard({ gradient: grad })}
                          className={cn(
                            "w-full aspect-square rounded-lg border-2 transition-all",
                            currentCard.gradient === grad ? "border-mint scale-110" : "border-transparent opacity-50 hover:opacity-100"
                          )}
                          style={{ background: grad }}
                        />
                      ))}
                    </div>
                  </div>}
                  {currentCard && <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Scale</label>
                      <span className="text-[10px] text-mint font-mono">{(currentCard.scale ?? 1).toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.01"
                      value={currentCard.scale ?? 1}
                      onChange={(e) => updateCurrentCard({ scale: parseFloat(e.target.value) })}
                      className="w-full accent-mint"
                    />
                  </div>}
                  {currentCard && <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Rotation</label>
                      <span className="text-[10px] text-mint font-mono">{currentCard.rotate ?? 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      step="1"
                      value={currentCard.rotate ?? 0}
                      onChange={(e) => updateCurrentCard({ rotate: parseInt(e.target.value) })}
                      className="w-full accent-mint"
                    />
                  </div>}
                  {currentCard && <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-3 block">Card Details</label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={currentCard.cardNumber || ''}
                        onChange={(e) => updateCurrentCard({ cardNumber: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-mint transition-all"
                        placeholder="Card Number (e.g. 4582 •••• •••• 9012)"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={currentCard.expiryDate || ''}
                          onChange={(e) => updateCurrentCard({ expiryDate: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-mint transition-all"
                          placeholder="Expiry (MM/YY)"
                        />
                        <input
                          type="number"
                          value={currentCard.balance ?? 0}
                          onChange={(e) => updateCurrentCard({ balance: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-mint transition-all"
                          placeholder="Balance"
                        />
                      </div>
                    </div>
                  </div>}
                  {currentCard && <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-3 block">Typography</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['font-sans', 'font-serif', 'font-mono'].map((f) => (
                        <button
                          key={f}
                          onClick={() => updateCurrentCard({ font: f })}
                          className={cn(
                            "py-2 px-3 rounded-xl text-[10px] uppercase tracking-widest border transition-all",
                            currentCard.font === f ? "bg-mint/20 border-mint text-mint" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                          )}
                        >
                          {f.split('-')[1]}
                        </button>
                      ))}
                    </div>
                  </div>}

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
                  <button
                    onClick={() => setIsGoalsModalOpen(true)}
                    className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    Manage
                  </button>
                </div>
                {goals.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <p className="text-white/40 text-sm text-center">No savings goals yet.</p>
                    <button
                      onClick={() => setIsGoalsModalOpen(true)}
                      className="text-[10px] uppercase tracking-widest text-mint/70 hover:text-mint transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add goal
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {goals.map((goal) => {
                      const pct = Math.min((goal.current / goal.target) * 100, 100);
                      return (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">{goal.name}</span>
                            <span className="font-mono text-xs text-white/60">
                              ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: goal.color }}
                            />
                          </div>
                          <p className="text-[10px] text-white/30 text-right">{pct.toFixed(0)}% complete</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Insights */}
              <div className="glass-panel p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-orange-400">
                    <Zap className="w-5 h-5" />
                    <h3 className="text-xl font-light">Quick Insights</h3>
                  </div>
                </div>
                {insights.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-4">Import transactions to see insights.</p>
                ) : (
                  <div className="space-y-3">
                    {insights.map((insight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10"
                        style={{ borderLeftColor: insight.color, borderLeftWidth: 2 }}
                      >
                        <p className="text-xs text-white/60 leading-relaxed">{insight.text}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
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
                      <span className="text-white font-medium ml-auto">${cat.value.toFixed(2)}</span>
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
            <div className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-2xl font-light">Transaction History</h3>
                <button
                  onClick={() => { setSearchTerm(''); setFilterType('all'); setFilterCategory('all'); setStartDate(''); setEndDate(''); setMinAmount(''); setMaxAmount(''); }}
                  className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
                >
                  Clear all filters
                </button>
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[160px]">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-mint/50 transition-all"
                  />
                </div>

                {/* Category */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 outline-none focus:border-mint/50 transition-all [color-scheme:dark] cursor-pointer"
                >
                  <option value="all">All categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* Type toggle */}
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                  {(['all', 'income', 'expense'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs uppercase tracking-widest transition-all",
                        filterType === type ? "bg-white/20 text-white font-medium" : "text-white/40 hover:text-white"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Date range */}
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <Calendar className="w-3 h-3 text-white/40 shrink-0" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-xs text-white/70 outline-none [color-scheme:dark] w-[120px]"
                  />
                  <span className="text-white/20 text-xs">–</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-xs text-white/70 outline-none [color-scheme:dark] w-[120px]"
                  />
                  {(startDate || endDate) && (
                    <button onClick={() => { setStartDate(''); setEndDate(''); }} className="ml-1 text-white/30 hover:text-white/60 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Amount range */}
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <span className="text-white/40 text-xs">$</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="bg-transparent text-xs text-white/70 outline-none w-16 placeholder-white/20"
                  />
                  <span className="text-white/20 text-xs">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="bg-transparent text-xs text-white/70 outline-none w-16 placeholder-white/20"
                  />
                  {(minAmount || maxAmount) && (
                    <button onClick={() => { setMinAmount(''); setMaxAmount(''); }} className="ml-1 text-white/30 hover:text-white/60 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Active filter pills */}
              {(searchTerm || filterType !== 'all' || filterCategory !== 'all' || startDate || endDate || minAmount || maxAmount) && (
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-mint/10 border border-mint/20 text-mint text-xs">
                      "{searchTerm}" <button onClick={() => setSearchTerm('')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {filterType !== 'all' && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-mint/10 border border-mint/20 text-mint text-xs">
                      {filterType} <button onClick={() => setFilterType('all')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {filterCategory !== 'all' && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-mint/10 border border-mint/20 text-mint text-xs">
                      {filterCategory} <button onClick={() => setFilterCategory('all')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {(startDate || endDate) && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-mint/10 border border-mint/20 text-mint text-xs">
                      {startDate || '…'} – {endDate || '…'} <button onClick={() => { setStartDate(''); setEndDate(''); }}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {(minAmount || maxAmount) && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-mint/10 border border-mint/20 text-mint text-xs">
                      ${minAmount || '0'} – ${maxAmount || '∞'} <button onClick={() => { setMinAmount(''); setMaxAmount(''); }}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  <span className="text-white/30 text-xs self-center">{sortedTransactions.length} result{sortedTransactions.length !== 1 ? 's' : ''}</span>
                </div>
              )}
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

                <div>
                  <h4 className="text-sm uppercase tracking-widest text-white/70 mb-4 text-center">Spending by Volume</h4>
                  <ResponsiveContainer width="100%" height={Math.max(200, categoryData.length * 48)}>
                    <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
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
                {/* Accent Color */}
                <div>
                  <h4 className="text-sm font-medium mb-1">Accent Color</h4>
                  <p className="text-xs text-white/40 mb-4">Choose your interface accent color</p>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { name: 'Mint', color: '#2dd4bf' },
                      { name: 'Violet', color: '#8b5cf6' },
                      { name: 'Blue', color: '#3b82f6' },
                      { name: 'Pink', color: '#ec4899' },
                      { name: 'Amber', color: '#f59e0b' },
                      { name: 'Rose', color: '#f43f5e' },
                      { name: 'Emerald', color: '#10b981' },
                      { name: 'Indigo', color: '#6366f1' },
                    ].map(theme => (
                      <button
                        key={theme.color}
                        onClick={() => setAccentColor(theme.color)}
                        title={theme.name}
                        className={cn(
                          'w-8 h-8 rounded-full transition-all duration-200',
                          accentColor === theme.color ? 'scale-125 ring-2 ring-white/50 ring-offset-2 ring-offset-transparent' : 'opacity-60 hover:opacity-100 hover:scale-110'
                        )}
                        style={{ backgroundColor: theme.color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5" />

                {/* Dark / Light Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Appearance</h4>
                    <p className="text-xs text-white/40">{isDarkMode ? 'Dark mode' : 'Light mode'}</p>
                  </div>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={cn(
                      "w-12 h-6 rounded-full relative p-1 transition-all",
                      !isDarkMode ? "bg-mint/20" : "bg-white/10"
                    )}
                  >
                    <motion.div
                      animate={{ x: !isDarkMode ? 24 : 0 }}
                      className={cn("w-4 h-4 rounded-full", !isDarkMode ? "bg-mint" : "bg-white/40")}
                    />
                  </button>
                </div>

                <div className="border-t border-white/5" />

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
                            setTransactions([]);
                            setCards([]);
                            setGoals([]);
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
                    <button
                      onClick={exportPDF}
                      className="glass-button px-6 py-2 text-xs uppercase tracking-widest text-white/60 hover:text-white"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <h4 className="text-sm font-medium mb-2">Smart Import</h4>
                  <p className="text-xs text-white/40 mb-4">Paste any bank statement text and Gemini AI will extract your transactions automatically.</p>
                  <button
                    onClick={() => setIsSmartImportOpen(true)}
                    className="w-full glass-panel p-4 flex items-center justify-between hover:bg-white/5 transition-all group mb-8"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-mint/20 flex items-center justify-center text-mint">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-medium">AI Statement Parser</p>
                        <p className="text-[10px] text-white/30">Paste text from any bank</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </button>
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

      {/* Goals Modal */}
      <AnimatePresence>
        {isGoalsModalOpen && (
          <GoalsModal
            goals={goals}
            onClose={() => setIsGoalsModalOpen(false)}
            onSave={setGoals}
          />
        )}
      </AnimatePresence>

      {/* Smart Import Modal */}
      <AnimatePresence>
        {isSmartImportOpen && (
          <SmartImportModal
            onClose={() => setIsSmartImportOpen(false)}
            onImport={(imported) => {
              setTransactions([...imported, ...transactions]);
              const newCats = Array.from(new Set([...categories, ...imported.map(t => t.category)]));
              setCategories(newCats);
              setIsSmartImportOpen(false);
              setToast({ message: `Imported ${imported.length} transactions via AI!`, type: 'success' });
            }}
            categories={categories}
          />
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

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageTexts = await Promise.all(
    Array.from({ length: pdf.numPages }, async (_, i) => {
      const page = await pdf.getPage(i + 1);
      const content = await page.getTextContent();
      return content.items.map((item: any) => item.str).join(' ');
    })
  );

  return pageTexts.join('\n');
}

const GOAL_COLORS = ['#2dd4bf', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#06b6d4', '#f43f5e', '#6366f1'];

function GoalsModal({ goals, onClose, onSave }: {
  goals: Goal[];
  onClose: () => void;
  onSave: (goals: Goal[]) => void;
}) {
  const [list, setList] = useState<Goal[]>(goals);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', target: '', current: '', color: GOAL_COLORS[0] });
  const [isAdding, setIsAdding] = useState(false);

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm({ name: '', target: '', current: '', color: GOAL_COLORS[0] });
  };

  const startEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setIsAdding(false);
    setForm({ name: goal.name, target: String(goal.target), current: String(goal.current), color: goal.color });
  };

  const saveForm = () => {
    if (!form.name.trim() || !form.target) return;
    if (editingId) {
      setList(prev => prev.map(g => g.id === editingId
        ? { ...g, name: form.name, target: parseFloat(form.target), current: parseFloat(form.current) || 0, color: form.color }
        : g
      ));
      setEditingId(null);
    } else {
      setList(prev => [...prev, {
        id: Date.now().toString(),
        name: form.name,
        target: parseFloat(form.target),
        current: parseFloat(form.current) || 0,
        color: form.color,
      }]);
      setIsAdding(false);
    }
    setForm({ name: '', target: '', current: '', color: GOAL_COLORS[0] });
  };

  const deleteGoal = (id: string) => setList(prev => prev.filter(g => g.id !== id));

  const cancel = () => { setIsAdding(false); setEditingId(null); };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="glass-panel p-8 w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-light flex items-center gap-2 text-mint">
            <Target className="w-5 h-5" /> Savings Goals
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {list.length === 0 && !isAdding && (
            <p className="text-white/40 text-sm text-center py-6">No goals yet. Add one below.</p>
          )}
          {list.map(goal => (
            <div key={goal.id}>
              {editingId === goal.id ? (
                <GoalForm form={form} setForm={setForm} onSave={saveForm} onCancel={cancel} />
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 group">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: goal.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{goal.name}</p>
                    <p className="text-[10px] text-white/40 font-mono">
                      ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(goal)} className="text-white/40 hover:text-mint transition-colors text-[10px] uppercase tracking-widest">Edit</button>
                    <button onClick={() => deleteGoal(goal.id)} className="text-white/40 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isAdding && <GoalForm form={form} setForm={setForm} onSave={saveForm} onCancel={cancel} />}
        </div>

        {!isAdding && editingId === null && (
          <button
            onClick={startAdd}
            className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-white/40 hover:text-mint hover:border-mint/30 transition-all text-sm flex items-center justify-center gap-2 mb-4"
          >
            <Plus className="w-4 h-4" /> Add Goal
          </button>
        )}

        <button
          onClick={() => { onSave(list); onClose(); }}
          className="w-full py-3 rounded-xl bg-mint text-slate-900 font-medium text-sm hover:bg-mint/90 transition-colors"
        >
          Save Goals
        </button>
      </motion.div>
    </motion.div>
  );
}

function GoalForm({ form, setForm, onSave, onCancel }: {
  form: { name: string; target: string; current: string; color: string };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; target: string; current: string; color: string }>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
      <input
        autoFocus
        type="text"
        placeholder="Goal name (e.g. New MacBook)"
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-mint transition-all"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="Target ($)"
          value={form.target}
          onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-mint transition-all"
        />
        <input
          type="number"
          placeholder="Saved so far ($)"
          value={form.current}
          onChange={e => setForm(f => ({ ...f, current: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-mint transition-all"
        />
      </div>
      <div className="flex gap-2">
        {GOAL_COLORS.map(c => (
          <button
            key={c}
            onClick={() => setForm(f => ({ ...f, color: c }))}
            className={cn('w-5 h-5 rounded-full transition-all', form.color === c ? 'scale-125 ring-2 ring-white/40' : 'opacity-60 hover:opacity-100')}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition-colors">Cancel</button>
        <button onClick={onSave} className="flex-1 py-2 rounded-xl bg-mint/20 text-mint text-sm hover:bg-mint/30 transition-colors">Save</button>
      </div>
    </div>
  );
}

function SmartImportModal({ onClose, onImport, categories }: {
  onClose: () => void;
  onImport: (transactions: Omit<Transaction, 'id'>[]) => void;
  categories: string[];
}) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'review' | 'error'>('idle');
  const [loadingMsg, setLoadingMsg] = useState('Gemini is reading your statement…');
  const [parsed, setParsed] = useState<Omit<Transaction, 'id'>[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState('');

  const runGemini = async (statementText: string) => {
    setStatus('loading');
    setErrorMsg('');

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const prompt = `You are a financial data extractor. Parse the following bank statement text and extract all transactions.

Return ONLY a valid JSON array (no markdown, no explanation) where each item has:
- date: string in YYYY-MM-DD format
- description: string (merchant or description)
- amount: number (always positive)
- type: "income" or "expense"
- category: one of [${categories.join(', ')}] or a new appropriate category

Bank statement text:
${statementText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } },
    });

    const raw = response.text?.trim() ?? '';
    const jsonStr = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
    const transactions = JSON.parse(jsonStr) as Omit<Transaction, 'id'>[];

    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new Error('No transactions found. Try a different statement.');
    }

    setParsed(transactions);
    setSelected(new Set(transactions.map((_, i) => i)));
    setStatus('review');
  };

  const handleParse = async () => {
    if (!text.trim()) return;
    try {
      setLoadingMsg('Gemini is reading your statement…');
      await runGemini(text);
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Failed to parse. Check your API key.');
      setStatus('error');
    }
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoadingMsg('Extracting text from PDF…');
      setStatus('loading');
      const extracted = await extractTextFromPDF(file);
      setLoadingMsg('Gemini is reading your statement…');
      await runGemini(extracted);
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Failed to read PDF.');
      setStatus('error');
    }
  };

  const toggleAll = () => {
    if (selected.size === parsed.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(parsed.map((_, i) => i)));
    }
  };

  const handleImport = () => {
    const toImport = parsed.filter((_, i) => selected.has(i)).map(t => ({
      ...t,
      id: Math.random().toString(36).substr(2, 9),
    }));
    onImport(toImport as any);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-panel p-8 w-full max-w-2xl relative z-10 bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/10 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-mint/20 flex items-center justify-center text-mint">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-light">AI Statement Parser</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Powered by Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Idle / Error — paste input */}
        {(status === 'idle' || status === 'error') && (
          <div className="flex flex-col gap-4 flex-1">
            {/* PDF Upload */}
            <label className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-white/10 hover:border-mint/30 hover:bg-mint/5 transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-mint/10 flex items-center justify-center text-white/40 group-hover:text-mint transition-all shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Upload PDF Statement</p>
                <p className="text-[10px] text-white/30">Click to select a .pdf file from your bank</p>
              </div>
              <input type="file" accept=".pdf" onChange={handlePDFUpload} className="hidden" />
            </label>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] text-white/30 uppercase tracking-widest">or paste text</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Paste your bank statement here...\n\nExample:\nMar 01  WHOLEFDS #123       -52.40\nMar 03  PAYROLL DEPOSIT    +3200.00\nMar 05  NETFLIX.COM          -15.99`}
              className="flex-1 min-h-[180px] w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-mint/40 transition-all resize-none font-mono"
            />
            {status === 'error' && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2">{errorMsg}</p>
            )}
            <button
              onClick={handleParse}
              disabled={!text.trim()}
              className="w-full py-3 rounded-xl bg-mint/15 border border-mint/20 text-mint font-medium text-sm hover:bg-mint/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Parse with Gemini
            </button>
          </div>
        )}

        {/* Loading */}
        {status === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 rounded-full border-2 border-mint/20 border-t-mint"
            />
            <p className="text-sm text-white/50">{loadingMsg}</p>
          </div>
        )}

        {/* Review */}
        {status === 'review' && (
          <div className="flex flex-col gap-4 flex-1 min-h-0">
            <div className="flex justify-between items-center">
              <p className="text-xs text-white/50">{selected.size} of {parsed.length} transactions selected</p>
              <button onClick={toggleAll} className="text-xs text-mint hover:text-mint/70 transition-colors">
                {selected.size === parsed.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {parsed.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(prev => {
                    const next = new Set(prev);
                    next.has(i) ? next.delete(i) : next.add(i);
                    return next;
                  })}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                    selected.has(i)
                      ? "bg-mint/5 border-mint/20"
                      : "bg-white/[0.02] border-white/5 opacity-50"
                  )}
                >
                  {selected.has(i)
                    ? <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
                    : <Circle className="w-4 h-4 text-white/20 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{t.description}</p>
                    <p className="text-[10px] text-white/40">{t.date} · {t.category}</p>
                  </div>
                  <span className={cn(
                    "text-sm font-mono shrink-0",
                    t.type === 'income' ? 'text-emerald-400' : 'text-white'
                  )}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2 border-t border-white/10">
              <button
                onClick={() => { setStatus('idle'); setParsed([]); }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm hover:text-white hover:border-white/20 transition-all"
              >
                Re-paste
              </button>
              <button
                onClick={handleImport}
                disabled={selected.size === 0}
                className="flex-1 py-2.5 rounded-xl bg-mint/15 border border-mint/20 text-mint text-sm font-medium hover:bg-mint/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Import {selected.size} Transactions
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
