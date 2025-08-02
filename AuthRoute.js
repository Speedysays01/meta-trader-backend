import express from 'express';
import { SignupAuth, LoginAuth } from './AuthController.js';
import { verifyUser } from './AuthMiddleware.js';

const router = express.Router();

router.post('/', verifyUser);              // Middleware route
router.post('/signup', SignupAuth);        // Signup route
router.post('/login', LoginAuth);          // Login route

router.get('/', (req, res) => {
  res.send('API is running 🎉');
});

export default router;
