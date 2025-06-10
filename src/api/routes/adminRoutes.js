import express from 'express';
const router = express.Router();

// Временные маршруты для тестирования
router.get('/dashboard', (req, res) => {
    res.json({ message: 'Admin dashboard route' });
});

export default router; 