import express from 'express';
import Promo from '../models/Promo.js';

const router = express.Router();

// Получить все промокоды
router.get('/', async (req, res) => {
    try {
        const promos = await Promo.find();
        res.json(promos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получить промокод по коду
router.get('/:code', async (req, res) => {
    try {
        const promo = await Promo.findOne({ code: req.params.code });
        if (!promo) {
            return res.status(404).json({ message: 'Промокод не найден' });
        }
        res.json(promo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Создать новый промокод
router.post('/', async (req, res) => {
    const promo = new Promo({
        code: req.body.code,
        discount: req.body.discount,
        validFrom: req.body.validFrom,
        validUntil: req.body.validUntil,
        usageLimit: req.body.usageLimit
    });

    try {
        const newPromo = await promo.save();
        res.status(201).json(newPromo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Обновить промокод
router.put('/:id', async (req, res) => {
    try {
        const promo = await Promo.findById(req.params.id);
        if (!promo) {
            return res.status(404).json({ message: 'Промокод не найден' });
        }

        if (req.body.code) promo.code = req.body.code;
        if (req.body.discount) promo.discount = req.body.discount;
        if (req.body.validFrom) promo.validFrom = req.body.validFrom;
        if (req.body.validUntil) promo.validUntil = req.body.validUntil;
        if (req.body.isActive !== undefined) promo.isActive = req.body.isActive;
        if (req.body.usageLimit) promo.usageLimit = req.body.usageLimit;

        const updatedPromo = await promo.save();
        res.json(updatedPromo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Удалить промокод
router.delete('/:id', async (req, res) => {
    try {
        const promo = await Promo.findById(req.params.id);
        if (!promo) {
            return res.status(404).json({ message: 'Промокод не найден' });
        }
        await promo.deleteOne();
        res.json({ message: 'Промокод удален' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Проверить валидность промокода
router.post('/validate/:code', async (req, res) => {
    try {
        const promo = await Promo.findOne({ code: req.params.code });
        
        if (!promo) {
            return res.status(404).json({ 
                valid: false, 
                message: 'Промокод не найден' 
            });
        }

        const now = new Date();
        const isValid = 
            promo.isActive && 
            now >= promo.validFrom && 
            now <= promo.validUntil && 
            (!promo.usageLimit || promo.usedCount < promo.usageLimit);

        if (!isValid) {
            return res.json({ 
                valid: false, 
                message: 'Промокод недействителен' 
            });
        }

        res.json({ 
            valid: true, 
            discount: promo.discount,
            message: 'Промокод действителен' 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router; 