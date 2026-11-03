import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const EXPENSE_CATEGORIES = [
  'Food',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Education',
  'Bills',
  'Travel',
  'Others',
];

export const BudgetModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  currentMonth,
  currentYear,
  currency = 'INR',
}) => {
  const isEditing = Boolean(initialData && initialData._id);

  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || 'Food');
      setLimit(initialData.limit || '');
    } else {
      setCategory('Food');
      setLimit('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericLimit = parseFloat(limit);
    if (isNaN(numericLimit) || numericLimit <= 0) {
      setError('Please provide a valid spending limit greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        _id: initialData?._id,
        category,
        limit: numericLimit,
        month: currentMonth,
        year: currentYear,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit ${initialData.category} Budget` : 'Set Monthly Budget'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-900/50 dark:text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isEditing}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm disabled:opacity-60"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Monthly Spending Limit ({currency})
          </label>
          <input
            type="number"
            step="any"
            min="1"
            required
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="e.g. 5000"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm shadow-emerald-500/20 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Budget' : 'Set Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetModal;
