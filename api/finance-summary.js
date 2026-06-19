const { allowCors } = require('./_cors');
const { supabase } = require('./_supabase');

// Helper to get current date in India Standard Time (IST) YYYY-MM-DD format
function getISTDate() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now);
}

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const todayIST = getISTDate(); // "YYYY-MM-DD"
    const currentMonthIST = todayIST.substring(0, 7) + "-01"; // "YYYY-MM-01"
    const currentYearIST = todayIST.substring(0, 4); // "YYYY"

    let todayIncome = 0;
    let todayExpenses = 0;
    let monthIncome = 0;
    let monthExpenses = 0;
    let yearIncome = 0;
    let yearExpenses = 0;
    let stockValue = 0;
    let isStockValueEstimated = false;
    let monthlyTrends = [];

    // 1. Try querying via SQL Views first (optimizes performance)
    try {
      // Query today's totals
      const { data: todayData, error: todayErr } = await supabase
        .from('daily_finance_totals')
        .select('income, expenses')
        .eq('date', todayIST)
        .maybeSingle();
      
      if (todayErr) throw todayErr;
      if (todayData) {
        todayIncome = parseFloat(todayData.income) || 0;
        todayExpenses = parseFloat(todayData.expenses) || 0;
      }

      // Query monthly totals (for this month and year-to-date)
      const { data: allMonthsData, error: monthsErr } = await supabase
        .from('monthly_finance_totals')
        .select('month, income, expenses')
        .order('month', { ascending: true });
        
      if (monthsErr) throw monthsErr;
      
      if (allMonthsData && allMonthsData.length > 0) {
        allMonthsData.forEach(m => {
          const mIncome = parseFloat(m.income) || 0;
          const mExpenses = parseFloat(m.expenses) || 0;
          
          if (m.month === currentMonthIST) {
            monthIncome = mIncome;
            monthExpenses = mExpenses;
          }
          
          if (m.month.startsWith(currentYearIST)) {
            yearIncome += mIncome;
            yearExpenses += mExpenses;
          }

          // Build trends array (month name, income, expense, profit)
          const dateObj = new Date(m.month);
          const monthLabel = dateObj.toLocaleString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
          monthlyTrends.push({
            monthKey: m.month,
            label: monthLabel,
            income: mIncome,
            expenses: mExpenses,
            profit: mIncome - mExpenses
          });
        });
      }

      // Query stock value from view
      const { data: stockData, error: stockErr } = await supabase
        .from('current_stock_value')
        .select('total_stock_value')
        .maybeSingle();

      if (stockErr) throw stockErr;
      if (stockData) {
        stockValue = parseFloat(stockData.total_stock_value) || 0;
      }
    } catch (viewError) {
      console.warn("SQL views not fully initialized, falling back to direct table aggregations:", viewError.message);
      // FALLBACK: Direct table queries if views do not exist yet
      
      // Calculate Today's Income & Expenses
      // Fetch orders from today
      const startOfDay = `${todayIST}T00:00:00.000Z`;
      const endOfDay = `${todayIST}T23:59:59.999Z`;
      
      const { data: ordersToday } = await supabase
        .from('orders')
        .select('total_amount')
        .in('status', ['Confirmed', 'Preparing', 'Shipped', 'Delivered'])
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      if (ordersToday) {
        todayIncome = ordersToday.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
      }

      const { data: expensesToday } = await supabase
        .from('expenses')
        .select('amount')
        .eq('expense_date', todayIST);
      
      if (expensesToday) {
        todayExpenses = expensesToday.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      }

      // Calculate Month's Income & Expenses
      const startOfMonth = `${todayIST.substring(0, 8)}01T00:00:00.000Z`;
      const endOfMonth = new Date(new Date(currentMonthIST).getFullYear(), new Date(currentMonthIST).getMonth() + 1, 0).toISOString().split('T')[0] + 'T23:59:59.999Z';
      
      const { data: ordersMonth } = await supabase
        .from('orders')
        .select('total_amount')
        .in('status', ['Confirmed', 'Preparing', 'Shipped', 'Delivered'])
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);

      if (ordersMonth) {
        monthIncome = ordersMonth.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
      }

      const { data: expensesMonth } = await supabase
        .from('expenses')
        .select('amount')
        .gte('expense_date', currentMonthIST)
        .lte('expense_date', endOfMonth.split('T')[0]);

      if (expensesMonth) {
        monthExpenses = expensesMonth.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      }

      // Calculate Year's Income & Expenses
      const startOfYear = `${currentYearIST}-01-01T00:00:00.000Z`;
      const endOfYear = `${currentYearIST}-12-31T23:59:59.999Z`;

      const { data: ordersYear } = await supabase
        .from('orders')
        .select('total_amount')
        .in('status', ['Confirmed', 'Preparing', 'Shipped', 'Delivered'])
        .gte('created_at', startOfYear)
        .lte('created_at', endOfYear);

      if (ordersYear) {
        yearIncome = ordersYear.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
      }

      const { data: expensesYear } = await supabase
        .from('expenses')
        .select('amount')
        .gte('expense_date', `${currentYearIST}-01-01`)
        .lte('expense_date', `${currentYearIST}-12-31`);

      if (expensesYear) {
        yearExpenses = expensesYear.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      }

      // Mock trend for current month since views are missing
      monthlyTrends = [{
        monthKey: currentMonthIST,
        label: new Date(currentMonthIST).toLocaleString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
        income: monthIncome,
        expenses: monthExpenses,
        profit: monthIncome - monthExpenses
      }];
    }

    // 2. Fetch products for stock valuation (common for both view & fallback paths)
    try {
      const { data: products, error: prodErr } = await supabase
        .from('products')
        .select('price_500g, price_1kg, cost_price_500g, cost_price_1kg, stock_qty_500g, stock_qty_1kg');

      if (!prodErr && products) {
        let computedStockValue = 0;
        let anyCostPriceAvailable = false;

        products.forEach(p => {
          const qty500 = parseInt(p.stock_qty_500g) || 0;
          const qty1k = parseInt(p.stock_qty_1kg) || 0;
          
          let cost500 = parseFloat(p.cost_price_500g) || 0;
          let cost1k = parseFloat(p.cost_price_1kg) || 0;

          // Check if cost prices are configured
          if (cost500 > 0 || cost1k > 0) {
            anyCostPriceAvailable = true;
          } else {
            // Fallback estimate using selling price if cost is not set
            cost500 = parseFloat(p.price_500g) || 0;
            cost1k = parseFloat(p.price_1kg) || 0;
          }

          computedStockValue += (qty500 * cost500) + (qty1k * cost1k);
        });

        // If view didn't yield stock value or is 0, use computed one
        if (stockValue === 0) {
          stockValue = computedStockValue;
        }
        isStockValueEstimated = !anyCostPriceAvailable;
      }
    } catch (e) {
      console.error("Error calculating stock valuation:", e);
    }

    // 3. Assemble and return response
    return res.status(200).json({
      today: {
        income: todayIncome,
        expenses: todayExpenses,
        profit: todayIncome - todayExpenses
      },
      thisMonth: {
        income: monthIncome,
        expenses: monthExpenses,
        profit: monthIncome - monthExpenses
      },
      thisYear: {
        income: yearIncome,
        expenses: yearExpenses,
        profit: yearIncome - yearExpenses
      },
      stockValue: {
        value: stockValue,
        isEstimate: isStockValueEstimated
      },
      trends: monthlyTrends
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = (req, res) => allowCors(req, res, handler);
