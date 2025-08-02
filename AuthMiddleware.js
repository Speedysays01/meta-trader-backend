import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from './models/UserModel.js';

dotenv.config();

export const verifyUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ status: false });

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.json({ status: false });

    return res.json({ status: true, user });
  } catch (err) {
    return res.json({ status: false });
  }
};
