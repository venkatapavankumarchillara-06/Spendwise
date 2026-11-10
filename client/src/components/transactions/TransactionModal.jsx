import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { formatDateForInput } from '../../utils/formatters';

const DEFAULT_EXPENSE_CATEGORIES = [
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

const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Freelancing',
  'Business',
  'Investments',
  'Other Income',
];

const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Cash',
  'Net Banking',
  'Other',
];

export const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  currency = 'INR',
}) => {
  const isEditing = Boolean(initialData && initialData._id);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: formatDateForInput(),
    paymentMethod: 'UPI',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        type: initialData.type || 'expense',
        category: initialData.category || (initialData.type === 'income' ? 'Salary' : 'Food'),
        date: formatDateForInput(initialData.date),
        paymentMethod: initialData.paymentMethod || 'UPI',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        date: formatDateForInput(),
        paymentMethod: 'UPI',
        description: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  // When type changes, adjust default category if current category does not match new type
  const handleTypeChange = (newType) => {
    const categories = newType === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: categories.includes(prev.category) ? prev.category : categories[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a transaction title');
      return;
    }

    const numericAmount = parseFloat(formData.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a positive number greater than 0');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        ...formData,
        amount: numericAmount,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const categories =
    formData.type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Record New Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-900/50 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Type Selector (Segmented Button) */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                formData.type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                formData.type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Title / Note
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Grocery store, Salary payout, Electricity bill"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
          />
        </div>

        {/* Amount & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Amount ({currency})
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Description / Memo (Optional)
          </label>
          <textarea
            rows="2"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add any extra notes or reference IDs"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
          />
        </div>

        {/* Buttons */}
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
            {submitting ? 'Saving...' : isEditing ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;

