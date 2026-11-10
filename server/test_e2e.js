/**
 * SpendWise Full End-to-End System & Security Test Suite
 * Tests all 10 core functional requirements and security invariants.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('   SpendWise Comprehensive End-to-End Test Suite    ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  [PASS] #${total}: ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] #${total}: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Health Check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  assert(health.status === 'healthy' && health.database === 'connected', 'Backend server & MongoDB connected');

  // 2. Register Primary User
  const timestamp = Date.now();
  const user1Email = `sophia_${timestamp}@example.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sophia Patel',
      email: user1Email,
      password: 'StrongPassword123!',
      currency: 'INR',
    }),
  });
  const regData = await regRes.json();
  assert(regRes.status === 201 && regData.success && regData.token, 'Primary user registered successfully');
  const token1 = regData.token;

  // 3. Duplicate Email Prevention
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Imposter',
      email: user1Email,
      password: 'AnotherPassword456!',
    }),
  });
  assert(dupRes.status === 400, 'Duplicate email registration safely rejected');

  // 4. Login Primary User
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user1Email,
      password: 'StrongPassword123!',
    }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200 && loginData.user.name === 'Sophia Patel', 'Login verified with correct credentials');

  // 5. Protected Route Access Check
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const meData = await meRes.json();
  assert(meRes.status === 200 && meData.user.email === user1Email, 'Auth middleware successfully decodes user');

  // 6. Update Profile
  const updateProfileRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      name: 'Dr. Sophia Patel',
      themePreference: 'dark',
    }),
  });
  const updateProfileData = await updateProfileRes.json();
  assert(updateProfileData.user.name === 'Dr. Sophia Patel', 'User profile successfully updated');

  // 7. Create Income Transactions
  const inc1Res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      title: 'Consulting Retainer',
      amount: 120000,
      type: 'income',
      category: 'Freelancing',
      paymentMethod: 'Net Banking',
      description: 'Monthly architectural consulting retainer',
      date: new Date().toISOString(),
    }),
  });
  const inc1Data = await inc1Res.json();
  assert(inc1Res.status === 201 && inc1Data.data.amount === 120000, 'Recorded Consulting Retainer Income');

  // 8. Create Expense Transactions across categories
  const exp1Res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      title: 'Organic Market Groceries',
      amount: 6500,
      type: 'expense',
      category: 'Food',
      paymentMethod: 'Credit Card',
      description: 'Monthly supplies & organic pantry staples',
      date: new Date().toISOString(),
    }),
  });
  const exp1Data = await exp1Res.json();
  const exp1Id = exp1Data.data._id;
  assert(exp1Res.status === 201 && exp1Data.data.amount === 6500, 'Recorded Food Expense');

  const exp2Res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      title: 'Metro Pass & Fuel',
      amount: 2200,
      type: 'expense',
      category: 'Transportation',
      paymentMethod: 'UPI',
      description: 'Monthly commute reload',
      date: new Date().toISOString(),
    }),
  });
  assert(exp2Res.status === 201, 'Recorded Transportation Expense');

  // 9. Create Monthly Budget for Food (limit 10,000)
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const bgtRes = await fetch(`${BASE_URL}/budgets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      category: 'Food',
      limit: 10000,
      month: currentMonth,
      year: currentYear,
    }),
  });
  assert(bgtRes.status === 201, 'Created Food Budget limit of 10,000');

  // 10. Verify Real-time Budget Calculation
  const bgtListRes = await fetch(
    `${BASE_URL}/budgets?month=${currentMonth}&year=${currentYear}`,
    { headers: { Authorization: `Bearer ${token1}` } }
  );
  const bgtListData = await bgtListRes.json();
  const foodBudget = bgtListData.data.budgets.find((b) => b.category === 'Food');
  assert(
    foodBudget &&
      foodBudget.spent === 6500 &&
      foodBudget.remaining === 3500 &&
      foodBudget.percentage === 65 &&
      foodBudget.status === 'good',
    'Real-time budget utilization matches actual MongoDB records (Spent: 6,500, Remaining: 3,500, 65%)'
  );

  // 11. Test Dashboard Aggregation API
  const dashRes = await fetch(
    `${BASE_URL}/analytics/dashboard?month=${currentMonth}&year=${currentYear}`,
    { headers: { Authorization: `Bearer ${token1}` } }
  );
  const dashData = await dashRes.json();
  const expectedSavings = 120000 - (6500 + 2200); // 111,300
  assert(
    dashData.data.summary.monthlyIncome === 120000 &&
      dashData.data.summary.monthlyExpenses === 8700 &&
      dashData.data.summary.monthlySavings === expectedSavings,
    `Dashboard summary calculated accurately (Income: 120k, Expense: 8.7k, Savings: ${expectedSavings})`
  );

  // 12. Strict Security: Multi-tenant Data Isolation
  const user2Email = `imposter_${timestamp}@example.com`;
  const regUser2 = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'User Two',
      email: user2Email,
      password: 'Password999!',
    }),
  });
  const user2Data = await regUser2.json();
  const token2 = user2Data.token;

  // User 2 cannot list User 1's transactions
  const user2Txns = await fetch(`${BASE_URL}/transactions`, {
    headers: { Authorization: `Bearer ${token2}` },
  });
  const user2TxnsData = await user2Txns.json();
  assert(user2TxnsData.total === 0, 'User 2 sees 0 transactions (strict data isolation)');

  // User 2 cannot access User 1's transaction by ID
  const forbiddenGet = await fetch(`${BASE_URL}/transactions/${exp1Id}`, {
    headers: { Authorization: `Bearer ${token2}` },
  });
  assert(forbiddenGet.status === 403, 'Cross-user GET blocked with 403 Forbidden');

  // User 2 cannot delete User 1's transaction
  const forbiddenDel = await fetch(`${BASE_URL}/transactions/${exp1Id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token2}` },
  });
  assert(forbiddenDel.status === 403, 'Cross-user DELETE blocked with 403 Forbidden');

  // 13. Search and Filter
  const searchRes = await fetch(
    `${BASE_URL}/transactions?search=Groceries`,
    { headers: { Authorization: `Bearer ${token1}` } }
  );
  const searchData = await searchRes.json();
  assert(searchData.total === 1 && searchData.data[0].title.includes('Groceries'), 'Keyword search filter operates accurately');

  // 14. Transaction Update
  const updateTxRes = await fetch(`${BASE_URL}/transactions/${exp1Id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      title: 'Organic Market Groceries & Fruits',
      amount: 7000,
    }),
  });
  const updateTxData = await updateTxRes.json();
  assert(updateTxData.data.amount === 7000, 'Transaction updated successfully');

  // 15. Check Budget recalculation after transaction update
  const bgtRecalcRes = await fetch(
    `${BASE_URL}/budgets?month=${currentMonth}&year=${currentYear}`,
    { headers: { Authorization: `Bearer ${token1}` } }
  );
  const bgtRecalcData = await bgtRecalcRes.json();
  const recalculatedFood = bgtRecalcData.data.budgets.find((b) => b.category === 'Food');
  assert(recalculatedFood.spent === 7000 && recalculatedFood.percentage === 70, 'Budget utilization updated automatically to 70%');

  // 16. Transaction Delete
  const delTxRes = await fetch(`${BASE_URL}/transactions/${exp1Id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(delTxRes.status === 200, 'Transaction deleted successfully');

  // 17. User Logout
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(logoutRes.status === 200, 'User logged out successfully');

  console.log(`\n====================================================`);
  console.log(`   TEST RESULTS: ${passed}/${total} TESTS PASSED!`);
  console.log(`====================================================\n`);
  process.exit(0);
}

runTests().catch((err) => {
  console.error('\nTest Suite Failed:', err.message);
  process.exit(1);
});

