const { allowCors } = require('./_cors');
const { supabase } = require('./_supabase');
const { verifyAdminShield } = require('./_auth_shield');

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
        isBestSeller: p.is_bestseller,
        stock_kg: p.stock_kg !== undefined ? parseFloat(p.stock_kg) : 0,
        cost_price_per_kg: p.cost_price_per_kg !== undefined ? parseFloat(p.cost_price_per_kg) : 0
      }));
      
      return res.status(200).json(formattedProducts);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ADMIN OPERATIONS SHIELD
  const auth = await verifyAdminShield(req);
  if (!auth.success) {
    return res.status(auth.status).json({ error: auth.error });
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
      let { id, name, category, description, image, price_500g, price_1kg, inStock, isBestSeller, prices, stock_kg, cost_price_per_kg } = req.body;
      
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
      if (stock_kg !== undefined) updateFields.stock_kg = parseFloat(stock_kg);
      if (cost_price_per_kg !== undefined) updateFields.cost_price_per_kg = parseFloat(cost_price_per_kg);

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
