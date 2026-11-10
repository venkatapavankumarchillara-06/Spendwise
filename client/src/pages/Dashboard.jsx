import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calendar,
  ArrowRight,
  AlertTriangle,
  Receipt,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const COLORS = [
  '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6',
  '#8b5cf6', '#14b8a6', '#f43f5e', '#84cc16', '#a855f7',
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const Dashboard = ({ onOpenAddTransaction }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(
        `/analytics/dashboard?month=${selectedMonth}&year=${selectedYear}`
      );
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading financial dashboard...
        </p>
      </div>
    );
  }

  const summary = data?.summary || {
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlySavings: 0,
    savingsRate: 0,
  };

  const incomeVsExpense = data?.incomeVsExpense || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const recentTransactions = data?.recentTransactions || [];
  const budgetOverview = data?.budgetOverview || {
    totalBudgetLimit: 0,
    totalBudgetSpent: 0,
    budgetUtilization: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Welcome & Month Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Investor'}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Here is your financial health overview for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
          </p>
        </div>

        {/* Date / Month Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1} className="dark:bg-slate-800">
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer"
            >
              {[selectedYear - 1, selectedYear, selectedYear + 1].map((yr) => (
                <option key={yr} value={yr} className="dark:bg-slate-800">
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-900/50 dark:text-rose-300 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchDashboard}
            className="text-xs underline font-semibold hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Net Balance (All Time) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Net Balance
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(summary.totalBalance, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Cumulative across all records</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
        </div>

        {/* Total Monthly Income */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Income
            </span>
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight">
              +{formatCurrency(summary.monthlyIncome, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              For {MONTH_NAMES[selectedMonth - 1]}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500" />
        </div>

        {/* Total Monthly Expenses */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Expenses
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              -{formatCurrency(summary.monthlyExpenses, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              For {MONTH_NAMES[selectedMonth - 1]}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
        </div>

        {/* Monthly Net Savings */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Savings
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                summary.monthlySavings >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-amber-500'
              }`}
            >
              {formatCurrency(summary.monthlySavings, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Savings rate: {summary.savingsRate}%
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
        </div>
      </div>

      {/* Budget Utilization Banner (if budgets are set) */}
      {budgetOverview.totalBudgetLimit > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                Monthly Budget Utilization:
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {budgetOverview.budgetUtilization}% used
              </span>
              {budgetOverview.budgetUtilization >= 100 && (
                <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" /> Budget Exceeded!
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Spent {formatCurrency(budgetOverview.totalBudgetSpent, currency)} of{' '}
              {formatCurrency(budgetOverview.totalBudgetLimit, currency)}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetOverview.budgetUtilization >= 100
                  ? 'bg-rose-500'
                  : budgetOverview.budgetUtilization >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetOverview.budgetUtilization)}%` }}
            />
          </div>
        </div>
      )}

      {/* Charts Section: 6 Months Bar Chart & Category Breakdown Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense 6-Month Trend */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Income vs Expense Trend
              </h3>
              <p className="text-xs text-slate-400">Past 6 months comparison</p>
            </div>
          </div>

          <div className="h-72 w-full mt-2">
            {incomeVsExpense.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpense} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis
                    dataKey="shortMonth"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      fontSize: '0.75rem',
                    }}
                    formatter={(value) => [formatCurrency(value, currency)]}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="expense"
                    name="Expense"
                    fill="#f43f5e"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No transaction data available for trend
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Expense Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                {MONTH_NAMES[selectedMonth - 1]} distribution
              </p>
            </div>
            <PieChartIcon className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      fontSize: '0.75rem',
                    }}
                    formatter={(value, name, item) => [
                      `${formatCurrency(value, currency)} (${item.payload.percentage}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs text-slate-400">No expenses recorded for this month</p>
              </div>
            )}
          </div>

          {/* Category Legends */}
          {categoryBreakdown.length > 0 && (
            <div className="mt-3 space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {categoryBreakdown.slice(0, 5).map((cat, idx) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between text-xs py-0.5"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-slate-700 dark:text-slate-300 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                    {cat.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-400">Your latest recorded financial activities</p>
          </div>
          <Link
            to="/transactions"
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => (
              <div
                key={tx._id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {tx.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-bold ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </div>
                  <span className="text-[11px] text-slate-400">{tx.paymentMethod}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No transactions yet"
            description="Start recording your daily income and expenses to visualize your spending habits."
            actionText="Add First Transaction"
            onAction={onOpenAddTransaction}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

