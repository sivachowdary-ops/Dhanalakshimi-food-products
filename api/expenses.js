const { allowCors } = require('./_cors');
const { supabase } = require('./_supabase');
const { verifyAdminShield } = require('./_auth_shield');

function getISTDate() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
}

function formatISTDate(date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}

async function handler(req, res) {
  const method = req.method;

  if (method === 'GET') {
    try {
      let query = supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply category filter if specified
      if (req.query.category && req.query.category !== 'All') {
        query = query.eq('category', req.query.category);
      }

      // Apply simple date preset filtering on server-side if provided
      if (req.query.dateRange) {
        const dateRange = req.query.dateRange;
        const today = getISTDate();
        
        if (dateRange === 'Today') {
          query = query.eq('expense_date', today);
        } else if (dateRange === 'This Week') {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          query = query.gte('expense_date', formatISTDate(oneWeekAgo));
        } else if (dateRange === 'This Month') {
          const firstDayOfMonth = new Date();
          firstDayOfMonth.setDate(1);
          query = query.gte('expense_date', formatISTDate(firstDayOfMonth));
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ADMIN OPERATIONS SHIELD FOR WRITE OPERATIONS
  const auth = await verifyAdminShield(req);
  if (!auth.success) {
    return res.status(auth.status).json({ error: auth.error });
  }

  if (method === 'POST') {
    try {
      const { expense_name, category, amount, expense_date, notes } = req.body;
      
      if (!expense_name || !category || amount === undefined) {
        return res.status(400).json({ error: 'Missing required expense details.' });
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          expense_name,
          category,
          amount: parseFloat(amount),
          expense_date: expense_date || getISTDate(),
          notes: notes || ''
        }])
        .select()
        .single();
        
      if (error) throw error;
      return res.status(201).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'PUT') {
    try {
      const { id, expense_name, category, amount, expense_date, notes } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Missing expense ID.' });
      }

      const updateFields = {};
      if (expense_name !== undefined) updateFields.expense_name = expense_name;
      if (category !== undefined) updateFields.category = category;
      if (amount !== undefined) updateFields.amount = parseFloat(amount);
      if (expense_date !== undefined) updateFields.expense_date = expense_date;
      if (notes !== undefined) updateFields.notes = notes;

      const { data, error } = await supabase
        .from('expenses')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Missing expense ID.' });
      }
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${method} Not Allowed` });
}

module.exports = (req, res) => allowCors(req, res, handler);
