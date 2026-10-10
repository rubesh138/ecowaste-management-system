const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_smart_waste_jwt_key_2026_production', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
