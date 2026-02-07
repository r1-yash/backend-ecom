export const orderPlacedTemplate = (order) => `
  <h2>Order Placed Successfully 🎉</h2>
  <p>Your order <strong>#${order._id}</strong> has been placed.</p>
  <p>Total Amount: <strong>₹${order.totalAmount}</strong></p>
  <p>Status: ${order.orderStatus}</p>
  <br/>
  <p>Thank you for shopping with us!</p>
`;

export const orderCancelledTemplate = (order, reason) => `
  <h2>Order Cancelled ❌</h2>
  <p>Your order <strong>#${order._id}</strong> has been cancelled.</p>
  <p>Reason: ${reason}</p>
`;

export const orderStatusTemplate = (order, status) => `
  <h2>Order Update 📦</h2>
  <p>Your order <strong>#${order._id}</strong> is now:</p>
  <h3>${status}</h3>
`;

export const welcomeUserTemplate = (user) => `
  <h2>Welcome to E-Commerce App 🎉</h2>
  <p>Hi <strong>${user.name}</strong>,</p>
  <p>Your account has been created successfully.</p>

  <p><strong>Email:</strong> ${user.email}</p>

  <br/>
  <p>You can now log in and start shopping.</p>
  <p>Happy shopping! 🛒</p>
`;

export const adminNewUserTemplate = (user) => `
  <h2>New User Registered 🚀</h2>
  <p><strong>Name:</strong> ${user.name}</p>
  <p><strong>Email:</strong> ${user.email}</p>
  <p><strong>Phone:</strong> ${user.phone}</p>
`;