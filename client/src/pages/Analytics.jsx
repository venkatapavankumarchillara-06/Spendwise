import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart as PieChartIcon,
  Calendar,
  CreditCard,
  BarChart3,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const COLORS = [
  '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6',
  '#8b5cf6', '#14b8a6', '#f43f5e', '#84cc16', '#a855f7',
];

export const Analytics = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/analytics?year=${selectedYear}`);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm font-medium text-slate-500">
          Compiling financial analytics...
        </p>
      </div>
    );
  }

  const annualIncome = data?.annualIncome || 0;
  const annualExpense = data?.annualExpense || 0;
  const annualSavings = data?.annualSavings || 0;
  const annualSavingsRate = data?.annualSavingsRate || 0;
  const monthlyTrends = data?.monthlyTrends || [];
  const categoryDistribution = data?.categoryDistribution || [];
  const highestSpendingCategories = data?.highestSpendingCategories || [];
  const paymentMethods = data?.paymentMethods || [];

  return (
    <div className="space-y-6">
      {/* Header and Year Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Financial Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Deep insights and spending patterns across {selectedYear}
          </p>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
          >
            {[selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1].map((yr) => (
              <option key={yr} value={yr} className="dark:bg-slate-800">
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Annual KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Annual Inflow
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-3">
            +{formatCurrency(annualIncome, currency)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Total revenue in {selectedYear}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Annual Outflow
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-3">
            -{formatCurrency(annualExpense, currency)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Total spend in {selectedYear}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Net Savings
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-extrabold mt-3 ${
              annualSavings >= 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-amber-500'
            }`}
          >
            {formatCurrency(annualSavings, currency)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Saved after all expenses</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Savings Rate
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-3">
            {annualSavingsRate}%
          </div>
          <p className="text-xs text-slate-400 mt-1">Percentage of income saved</p>
        </div>
      </div>

      {/* 12-Month Income vs Expense Bar Chart */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Yearly Income vs Expense Comparison
            </h3>
            <p className="text-xs text-slate-400">Monthly breakdown for {selectedYear}</p>
          </div>
        </div>

        <div className="h-80 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
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
                formatter={(val) => [formatCurrency(val, currency)]}
              />
              <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Savings Trend Line Chart */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Net Savings Trajectory
            </h3>
            <p className="text-xs text-slate-400">Month-by-month accumulation</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
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
                formatter={(val) => [formatCurrency(val, currency)]}
              />
              <Line
                type="monotone"
                dataKey="savings"
                name="Net Savings"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Category Breakdown & Top 5 Spending Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Donut */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Category Distribution
              </h3>
              <p className="text-xs text-slate-400">All expenses in {selectedYear}</p>
            </div>
            <PieChartIcon className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {categoryDistribution.map((entry, index) => (
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
                    formatter={(val, name, item) => [
                      `${formatCurrency(val, currency)} (${item.payload.percentage}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No expense records for this year</div>
            )}
          </div>
        </div>

        {/* Highest Spending Categories */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Top Spending Categories
                </h3>
                <p className="text-xs text-slate-400">Where most of your money goes</p>
              </div>
            </div>

            {highestSpendingCategories.length > 0 ? (
              <div className="space-y-4">
                {highestSpendingCategories.map((cat, idx) => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 w-4">{idx + 1}.</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {cat.name}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(cat.amount, currency)}{' '}
                        <span className="text-slate-400 font-normal">({cat.percentage}%)</span>
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-10 text-center">
                No expense data recorded
              </div>
            )}
          </div>

          {/* Payment Method Breakdown */}
          {paymentMethods.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Payment Channel Usage
              </h4>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((pm) => (
                  <div
                    key={pm.method}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {pm.method}:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(pm.amount, currency)} ({pm.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
