const { allowCors } = require('./_cors');
const { supabase } = require('./_supabase');

async function handler(req, res) {
  const method = req.method;

  if (method === 'POST') {
    try {
      const { customer, items, totalWeight, subtotal, shipping, total, paymentRef, notes } = req.body;
      
      if (!customer || !items) {
        return res.status(400).json({ error: 'Missing required checkout details.' });
      }

      // Generate order ID e.g. DFP-123456
      const orderId = "DFP-" + Math.floor(100000 + Math.random() * 900000);
      const computedPaymentRef = paymentRef || `WA-${orderId}`;

      // 1. Insert order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          id: orderId,
          customer_name: customer.name,
          customer_phone: customer.phone,
          address: customer.address,
          state: customer.state,
          pincode: customer.pincode,
          total_weight: totalWeight,
          subtotal: parseFloat(subtotal),
          shipping_charge: parseFloat(shipping),
          total_amount: parseFloat(total),
          payment_ref: computedPaymentRef,
          notes: notes,
          status: 'New Order'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items
      const itemRows = items.map(item => ({
        order_id: orderId,
        product_id: (item.productId && item.productId.startsWith('prod_')) ? null : item.productId, 
        product_name: item.name,
        weight: item.weight,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity)
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemRows);

      if (itemsError) throw itemsError;

      // Map back to frontend expected structure
      const responseObj = {
        id: orderId,
        customer: {
          name: orderData.customer_name,
          phone: orderData.customer_phone,
          address: orderData.address,
          state: orderData.state,
          pincode: orderData.pincode
        },
        items: items,
        totalWeight: orderData.total_weight,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping_charge,
        total: orderData.total_amount,
        paymentRef: orderData.payment_ref,
        status: orderData.status,
        notes: orderData.notes,
        timestamp: orderData.created_at
      };

      return res.status(201).json(responseObj);
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

  if (method === 'GET') {
    try {
      // Fetch all orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (ordersError) throw ordersError;

      // Fetch all order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*');
        
      if (itemsError) throw itemsError;

      // Assemble together
      const formattedOrders = orders.map(ord => {
        const matchingItems = items
          .filter(it => it.order_id === ord.id)
          .map(it => ({
            productId: it.product_id || "prod_legacy",
            name: it.product_name,
            weight: it.weight,
            price: parseFloat(it.price),
            quantity: it.quantity
          }));

        return {
          id: ord.id,
          customer: {
            name: ord.customer_name,
            phone: ord.customer_phone,
            address: ord.address,
            state: ord.state,
            pincode: ord.pincode
          },
          items: matchingItems,
          totalWeight: ord.total_weight,
          subtotal: parseFloat(ord.subtotal),
          shipping: parseFloat(ord.shipping_charge),
          total: parseFloat(ord.total_amount),
          paymentRef: ord.payment_ref,
          status: ord.status,
          notes: ord.notes,
          timestamp: ord.created_at
        };
      });

      return res.status(200).json(formattedOrders);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'PUT') {
    try {
      const { id, status, paymentRef, notes } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Missing order ID.' });
      }

      const updateFields = {};
      if (status) updateFields.status = status;
      if (paymentRef) updateFields.payment_ref = paymentRef;
      if (notes) updateFields.notes = notes;

      const { data: orderData, error: updateError } = await supabase
        .from('orders')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      return res.status(200).json(orderData);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT']);
  return res.status(405).json({ error: `Method ${method} Not Allowed` });
}

module.exports = (req, res) => allowCors(req, res, handler);
