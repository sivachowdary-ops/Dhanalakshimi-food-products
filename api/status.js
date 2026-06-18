const { allowCors } = require('./_cors');
const { supabase } = require('./_supabase');

async function handler(req, res) {
  try {
    // Check Supabase database connectivity
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'businessName').single();
    
    if (error) {
      return res.status(500).json({
        status: 'partial_online',
        message: 'API is running but database is not reachable.',
        error: error.message
      });
    }

    res.status(200).json({
      status: 'online',
      message: 'Dhanalakshmi Food Products Backend API is operational.',
      database: 'connected',
      businessName: data.value
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Backend server error occurred.',
      error: err.message
    });
  }
}

module.exports = (req, res) => allowCors(req, res, handler);
