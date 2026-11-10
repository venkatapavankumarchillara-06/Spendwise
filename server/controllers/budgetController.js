import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

/**
 * @desc    Get user budgets with real-time spending calculations
 * @route   GET /api/budgets
 * @access  Private
 */
export const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    // Fetch user budgets for the specified month and year
    const budgets = await Budget.find({
      userId: req.user._id,
      month,
      year,
    }).sort({ category: 1 });

    // Date range for the given month
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Aggregate actual expense spending per category for this month
    const spendingAggregation = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const spendingMap = {};
    let totalSpentAllCategories = 0;
    spendingAggregation.forEach((item) => {
      spendingMap[item._id] = item.totalSpent;
      totalSpentAllCategories += item.totalSpent;
    });

    let totalBudgetLimit = 0;
    let totalBudgetedSpent = 0;

    // Attach real spending to each budget
    const enrichedBudgets = budgets.map((b) => {
      const limit = b.limit;
      const spent = spendingMap[b.category] || 0;
      const remaining = Math.max(0, limit - spent);
      const percentage = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;

      let status = 'good'; // under 80%
      if (percentage >= 100) {
        status = 'exceeded'; // 100% or above
      } else if (percentage >= 80) {
        status = 'warning'; // 80% - 99.9%
      }

      totalBudgetLimit += limit;
      totalBudgetedSpent += spent;

      return {
        _id: b._id,
        category: b.category,
        limit,
        month: b.month,
        year: b.year,
        spent,
        remaining,
        percentage,
        status,
        createdAt: b.createdAt,
      };
    });

    const overallPercentage =
      totalBudgetLimit > 0
        ? Number(((totalBudgetedSpent / totalBudgetLimit) * 100).toFixed(1))
        : 0;

    res.status(200).json({
      success: true,
      data: {
        budgets: enrichedBudgets,
        month,
        year,
        summary: {
          totalBudgetLimit,
          totalBudgetedSpent,
          totalSpentAllCategories,
          remaining: Math.max(0, totalBudgetLimit - totalBudgetedSpent),
          overallPercentage,
          status:
            overallPercentage >= 100
              ? 'exceeded'
              : overallPercentage >= 80
              ? 'warning'
              : 'good',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update category budget
 * @route   POST /api/budgets
 * @access  Private
 */
export const createBudget = async (req, res, next) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || !limit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category and spending limit',
      });
    }

    const numericLimit = parseFloat(limit);
    if (isNaN(numericLimit) || numericLimit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Spending limit must be greater than zero',
      });
    }

    const now = new Date();
    const budgetMonth = parseInt(month, 10) || now.getMonth() + 1;
    const budgetYear = parseInt(year, 10) || now.getFullYear();

    // Check if a budget already exists for this category, month, and year
    let budget = await Budget.findOne({
      userId: req.user._id,
      category: category.trim(),
      month: budgetMonth,
      year: budgetYear,
    });

    if (budget) {
      // Update existing budget
      budget.limit = numericLimit;
      await budget.save();

      return res.status(200).json({
        success: true,
        message: `Budget updated for ${category}`,
        data: budget,
      });
    }

    // Create new budget
    budget = await Budget.create({
      userId: req.user._id,
      category: category.trim(),
      limit: numericLimit,
      month: budgetMonth,
      year: budgetYear,
    });

    res.status(201).json({
      success: true,
      message: `Budget set for ${category}`,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update budget limit
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
export const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    // Strict ownership verification
    if (budget.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this budget',
      });
    }

    const { limit, category } = req.body;

    if (limit !== undefined) {
      const numericLimit = parseFloat(limit);
      if (isNaN(numericLimit) || numericLimit <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Limit must be greater than zero',
        });
      }
      budget.limit = numericLimit;
    }

    if (category) {
      budget.category = category.trim();
    }

    await budget.save();

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    // Strict ownership verification
    if (budget.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this budget',
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

