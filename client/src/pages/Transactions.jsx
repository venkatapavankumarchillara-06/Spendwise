import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TransactionModal from '../components/transactions/TransactionModal';
import EmptyState from '../components/common/EmptyState';

const ALL_CATEGORIES = [
  'All',
  'Food',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Education',
  'Bills',
  'Travel',
  'Salary',
  'Freelancing',
  'Business',
  'Investments',
  'Other Income',
  'Others',
];

export const Transactions = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency || 'INR';

  // Filters & Pagination State
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter);
      if (categoryFilter && categoryFilter !== 'All') params.append('category', categoryFilter);
      if (search.trim()) params.append('search', search.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', currentPage);
      params.append('limit', '10');

      const response = await api.get(`/transactions?${params.toString()}`);
      if (response.data.success) {
        setTransactions(response.data.data);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch transactions', 'error');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, categoryFilter, search, startDate, endDate, sortBy, sortOrder, currentPage, showToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('All');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleSaveTransaction = async (formData) => {
    if (editingTransaction) {
      // Update
      const response = await api.put(`/transactions/${editingTransaction._id}`, formData);
      if (response.data.success) {
        showToast('Transaction updated successfully', 'success');
        fetchTransactions();
      }
    } else {
      // Create
      const response = await api.post('/transactions', formData);
      if (response.data.success) {
        showToast('Transaction added successfully', 'success');
        fetchTransactions();
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const response = await api.delete(`/transactions/${deleteTarget._id}`);
      if (response.data.success) {
        showToast('Transaction removed successfully', 'success');
        setDeleteTarget(null);
        fetchTransactions();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete transaction', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Transactions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Total records: <span className="font-semibold text-emerald-500">{total}</span>
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Search Bar & Type Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <form onSubmit={handleSearchSubmit} className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, or category..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xs sm:text-sm"
            />
          </form>

          {/* Type Toggle */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => { setTypeFilter('all'); setCurrentPage(1); }}
              className={`py-1.5 rounded-lg transition-colors ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setTypeFilter('income'); setCurrentPage(1); }}
              className={`py-1.5 rounded-lg transition-colors ${
                typeFilter === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => { setTypeFilter('expense'); setCurrentPage(1); }}
              className={`py-1.5 rounded-lg transition-colors ${
                typeFilter === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Secondary Filters: Category, Date Range, Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: Start */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 shrink-0">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Date Range: End */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 shrink-0">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Sort By & Order */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by);
                setSortOrder(order);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>

            <button
              onClick={handleClearFilters}
              title="Reset Filters"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <LoadingSpinner size="md" />
            <span className="text-xs text-slate-400 mt-2">Loading records...</span>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="py-3 px-4 sm:px-6">Transaction</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {transactions.map((tx) => (
                  <tr
                    key={tx._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Title & Description */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
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
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                            {tx.title}
                          </p>
                          {tx.description && (
                            <p className="text-xs text-slate-400 truncate max-w-xs">
                              {tx.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {tx.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {tx.paymentMethod}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                      <span
                        className={
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(tx)}
                          title="Edit Transaction"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(tx)}
                          title="Delete Transaction"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No transactions match your criteria"
            description="Try adjusting your filters, searching for another keyword, or record a new transaction."
            actionText="Add Transaction"
            onAction={openAddModal}
          />
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Page <span className="font-semibold text-slate-900 dark:text-white">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTransaction}
        initialData={editingTransaction}
        currency={currency}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}" for ${formatCurrency(
          deleteTarget?.amount,
          currency
        )}?`}
        confirmText="Delete"
        isLoading={deleting}
      />
    </div>
  );
};

export default Transactions;

