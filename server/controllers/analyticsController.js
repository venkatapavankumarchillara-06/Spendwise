import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import mongoose from 'mongoose';

/**
 * @desc    Get dashboard metrics, charts, and recent activity
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    // 1. All-time balance aggregation
    const allTimeTotals = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let allTimeIncome = 0;
    let allTimeExpense = 0;
    allTimeTotals.forEach((t) => {
      if (t._id === 'income') allTimeIncome = t.total;
      if (t._id === 'expense') allTimeExpense = t.total;
    });
    const totalBalance = allTimeIncome - allTimeExpense;

    // 2. Selected Month Metrics
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const monthTotals = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    monthTotals.forEach((t) => {
      if (t._id === 'income') monthlyIncome = t.total;
      if (t._id === 'expense') monthlyExpenses = t.total;
    });

    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate =
      monthlyIncome > 0
        ? Number(((monthlySavings / monthlyIncome) * 100).toFixed(1))
        : 0;

    // 3. Category Breakdown for Pie Chart (Selected Month)
    const categoryTotals = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { value: -1 } },
    ]);

    const categoryBreakdown = categoryTotals.map((item) => ({
      name: item._id,
      value: item.value,
      count: item.count,
      percentage:
        monthlyExpenses > 0
          ? Number(((item.value / monthlyExpenses) * 100).toFixed(1))
          : 0,
    }));

    // 4. Six-month Income vs Expense Trend
    // Generate the last 6 months list
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const sixMonthsData = [];
    for (let i = 5; i >= 0; i--) {
      let d = new Date(year, month - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const sDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
      const eDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

      const resAggregation = await Transaction.aggregate([
        {
          $match: {
            userId,
            date: { $gte: sDate, $lte: eDate },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]);

      let inc = 0;
      let exp = 0;
      resAggregation.forEach((r) => {
        if (r._id === 'income') inc = r.total;
        if (r._id === 'expense') exp = r.total;
      });

      sixMonthsData.push({
        month: `${monthNames[m - 1]} ${y}`,
        shortMonth: monthNames[m - 1],
        income: inc,
        expense: exp,
        savings: inc - exp,
      });
    }

    // 5. Recent Transactions (latest 5)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .lean();

    // 6. Active Budgets utilization for the month
    const budgets = await Budget.find({ userId, month, year }).lean();
    let totalBudgetLimit = 0;
    let totalBudgetSpent = 0;
    budgets.forEach((b) => {
      totalBudgetLimit += b.limit;
      const spentForCat = categoryTotals.find((c) => c._id === b.category);
      if (spentForCat) {
        totalBudgetSpent += spentForCat.value;
      }
    });

    const budgetUtilization =
      totalBudgetLimit > 0
        ? Number(((totalBudgetSpent / totalBudgetLimit) * 100).toFixed(1))
        : 0;

    res.status(200).json({
      success: true,
      data: {
        filter: { month, year },
        summary: {
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          monthlySavings,
          savingsRate,
          allTimeIncome,
          allTimeExpense,
        },
        incomeVsExpense: sixMonthsData,
        categoryBreakdown,
        recentTransactions,
        budgetOverview: {
          totalBudgetLimit,
          totalBudgetSpent,
          budgetUtilization,
          budgetCount: budgets.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed financial analytics
 * @route   GET /api/analytics
 * @access  Private
 */
export const getAnalyticsData = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    // 12 Months Breakdown for the requested year
    const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

    const yearlyTransactions = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyTrends = [];
    let annualIncome = 0;
    let annualExpense = 0;

    for (let m = 1; m <= 12; m++) {
      const incItem = yearlyTransactions.find(
        (t) => t._id.month === m && t._id.type === 'income'
      );
      const expItem = yearlyTransactions.find(
        (t) => t._id.month === m && t._id.type === 'expense'
      );

      const income = incItem ? incItem.total : 0;
      const expense = expItem ? expItem.total : 0;
      const savings = income - expense;

      annualIncome += income;
      annualExpense += expense;

      monthlyTrends.push({
        month: monthNames[m - 1],
        monthNumber: m,
        income,
        expense,
        savings,
      });
    }

    // Category breakdown for the entire year
    const yearlyCategoryExpenses = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const categoryDistribution = yearlyCategoryExpenses.map((c) => ({
      name: c._id,
      amount: c.total,
      count: c.count,
      percentage:
        annualExpense > 0
          ? Number(((c.total / annualExpense) * 100).toFixed(1))
          : 0,
    }));

    // Top 5 spending categories
    const highestSpendingCategories = categoryDistribution.slice(0, 5);

    // Payment method breakdown
    const paymentMethodsAggregation = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const paymentMethods = paymentMethodsAggregation.map((p) => ({
      method: p._id || 'Other',
      amount: p.total,
      count: p.count,
      percentage:
        annualExpense > 0
          ? Number(((p.total / annualExpense) * 100).toFixed(1))
          : 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        year,
        annualIncome,
        annualExpense,
        annualSavings: annualIncome - annualExpense,
        annualSavingsRate:
          annualIncome > 0
            ? Number((((annualIncome - annualExpense) / annualIncome) * 100).toFixed(1))
            : 0,
        monthlyTrends,
        categoryDistribution,
        highestSpendingCategories,
        paymentMethods,
      },
    });
  } catch (error) {
    next(error);
  }
};

