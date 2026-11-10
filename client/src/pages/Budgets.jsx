import React, { useState, useEffect, useCallback } from 'react';
import {
  PiggyBank,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import BudgetModal from '../components/budgets/BudgetModal';
import EmptyState from '../components/common/EmptyState';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const Budgets = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency || 'INR';

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/budgets?month=${selectedMonth}&year=${selectedYear}`
      );
      if (response.data.success) {
        setBudgets(response.data.data.budgets);
        setSummary(response.data.data.summary);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load budgets', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, showToast]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleSaveBudget = async (formData) => {
    try {
      const response = await api.post('/budgets', formData);
      if (response.data.success) {
        showToast(response.data.message || 'Budget saved', 'success');
        fetchBudgets();
      }
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteBudget = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const response = await api.delete(`/budgets/${deleteTarget._id}`);
      if (response.data.success) {
        showToast('Budget deleted successfully', 'success');
        setDeleteTarget(null);
        fetchBudgets();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete budget', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openAddModal = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBudget(b);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Title, Month Filter, Add Budget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Budget Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Set and track spending boundaries for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month / Year Filter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm shadow-sm">
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

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && summary.totalBudgetLimit > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Budget Limit
            </span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {formatCurrency(summary.totalBudgetLimit, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Sum of all category targets</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Actual Budgeted Spending
            </span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {formatCurrency(summary.totalBudgetedSpent, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {summary.overallPercentage}% total limit utilized
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Remaining
            </span>
            <div
              className={`text-2xl font-extrabold mt-1 ${
                summary.remaining > 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {formatCurrency(summary.remaining, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Available buffer this month</p>
          </div>
        </div>
      )}

      {/* Budgets Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-400 mt-2">Calculating budget utilization...</p>
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';

            return (
              <div
                key={b._id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  {/* Card Header: Category & Action icons */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900 dark:text-white">
                        {b.category}
                      </span>
                      {isExceeded && (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                          <AlertTriangle className="w-3 h-3" /> Exceeded
                        </span>
                      )}
                      {isWarning && (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                          <AlertTriangle className="w-3 h-3" /> Warning
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(b)}
                        title="Edit Limit"
                        className="p-1 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(b)}
                        title="Delete Budget"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Financial Stats */}
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-xs text-slate-400">Spent: </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatCurrency(b.spent, currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Limit: </span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {formatCurrency(b.limit, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Footer details */}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    Utilization: <strong className="text-slate-900 dark:text-white">{b.percentage}%</strong>
                  </span>
                  <span
                    className={`font-semibold ${
                      b.remaining > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-500'
                    }`}
                  >
                    {b.remaining > 0
                      ? `${formatCurrency(b.remaining, currency)} remaining`
                      : `${formatCurrency(b.spent - b.limit, currency)} over limit`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={PiggyBank}
          title="No budgets configured for this month"
          description="Establish monthly spending caps for categories like Food, Entertainment, and Bills to maintain financial discipline."
          actionText="Create First Budget"
          onAction={openAddModal}
        />
      )}

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveBudget}
        initialData={editingBudget}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        currency={currency}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteBudget}
        title="Delete Budget"
        message={`Are you sure you want to remove the monthly budget for "${deleteTarget?.category}"?`}
        confirmText="Delete"
        isLoading={deleting}
      />
    </div>
  );
};

export default Budgets;

