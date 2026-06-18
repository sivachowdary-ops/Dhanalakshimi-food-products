const { allowCors } = require('./_cors');
const { supabase } = require('./_supabase');

async function handler(req, res) {
  const method = req.method;

  if (method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Map DB schema back to the storefront's expected format
      const formattedProducts = data.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
        image: p.image,
        prices: {
          "500g": parseFloat(p.price_500g),
          "1kg": parseFloat(p.price_1kg)
        },
        inStock: p.in_stock,
        isBestSeller: p.is_bestseller
      }));
      
      return res.status(200).json(formattedProducts);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ADMIN OPERATIONS SHIELD
  const targetPassword = process.env.ADMIN_PASSWORD;
  if (!targetPassword) {
    console.error("Configuration Error: ADMIN_PASSWORD environment variable is not configured on the server.");
    return res.status(500).json({ error: "Server Configuration Error: Admin operations are disabled." });
  }

  const adminPasswordHeader = req.headers['x-admin-password'];
  if (!adminPasswordHeader || adminPasswordHeader !== targetPassword) {
    return res.status(401).json({ error: 'Unauthorized: Admin credentials invalid.' });
  }

  if (method === 'POST') {
    try {
      let { name, category, description, image, price_500g, price_1kg, inStock, isBestSeller, prices } = req.body;
      
      if (prices) {
        if (prices['500g'] !== undefined) price_500g = prices['500g'];
        if (prices['1kg'] !== undefined) price_1kg = prices['1kg'];
      }
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name,
          category,
          description,
          image,
          price_500g: parseFloat(price_500g),
          price_1kg: parseFloat(price_1kg),
          in_stock: inStock === undefined ? true : inStock,
          is_bestseller: isBestSeller === undefined ? false : isBestSeller
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
      let { id, name, category, description, image, price_500g, price_1kg, inStock, isBestSeller, prices } = req.body;
      
      if (prices) {
        if (prices['500g'] !== undefined) price_500g = prices['500g'];
        if (prices['1kg'] !== undefined) price_1kg = prices['1kg'];
      }
      
      const updateFields = {};
      
      if (name !== undefined) updateFields.name = name;
      if (category !== undefined) updateFields.category = category;
      if (description !== undefined) updateFields.description = description;
      if (image !== undefined) updateFields.image = image;
      if (price_500g !== undefined) updateFields.price_500g = parseFloat(price_500g);
      if (price_1kg !== undefined) updateFields.price_1kg = parseFloat(price_1kg);
      if (inStock !== undefined) updateFields.in_stock = inStock;
      if (isBestSeller !== undefined) updateFields.is_bestseller = isBestSeller;

      const { data, error } = await supabase
        .from('products')
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
      
      const { error } = await supabase
        .from('products')
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
