import mongoose from 'mongoose';

export const EXPENSE_CATEGORIES = [
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

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelancing',
  'Business',
  'Investments',
  'Other Income',
];

export const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'UPI',
  'Net Banking',
  'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a transaction title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please enter a valid amount'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    type: {
      type: String,
      required: [true, 'Please specify transaction type (income or expense)'],
      enum: {
        values: ['income', 'expense'],
        message: '{VALUE} is not a valid transaction type',
      },
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide a transaction date'],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: '{VALUE} is not a supported payment method',
      },
      default: 'UPI',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal queries and sorting
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

