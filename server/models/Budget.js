import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Budget must belong to a user'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify a category for this budget'],
      trim: true,
    },
    limit: {
      type: Number,
      required: [true, 'Please provide a monthly spending limit'],
      min: [1, 'Limit must be greater than zero'],
    },
    month: {
      type: Number,
      required: [true, 'Please specify the month (1-12)'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Please specify the year'],
      min: 2000,
      max: 2100,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate budgets for the same user, category, month, and year
budgetSchema.index(
  { userId: 1, category: 1, month: 1, year: 1 },
  { unique: true }
);

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;

