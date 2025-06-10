import Promo from '../models/Promo.js';

// Получение всех промокодов (только для админа)
export const getPromos = async (req, res) => {
  try {
    const promos = await Promo.find().sort('-createdAt');
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении промокодов', error: error.message });
  }
};

// Получение одного промокода
export const getPromo = async (req, res) => {
  try {
    const promo = await Promo.findOne({ code: req.params.code.toUpperCase() });
    if (!promo) {
      return res.status(404).json({ message: 'Промокод не найден' });
    }
    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении промокода', error: error.message });
  }
};

// Создание промокода (только для админа)
export const createPromo = async (req, res) => {
  try {
    const promo = new Promo({
      ...req.body,
      code: req.body.code.toUpperCase()
    });
    await promo.save();
    res.status(201).json(promo);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании промокода', error: error.message });
  }
};

// Обновление промокода (только для админа)
export const updatePromo = async (req, res) => {
  try {
    const promo = await Promo.findByIdAndUpdate(
      req.params.id,
      { ...req.body, code: req.body.code?.toUpperCase() },
      { new: true, runValidators: true }
    );
    if (!promo) {
      return res.status(404).json({ message: 'Промокод не найден' });
    }
    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении промокода', error: error.message });
  }
};

// Удаление промокода (только для админа)
export const deletePromo = async (req, res) => {
  try {
    const promo = await Promo.findByIdAndDelete(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: 'Промокод не найден' });
    }
    res.json({ message: 'Промокод успешно удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении промокода', error: error.message });
  }
};

// Проверка валидности промокода
export const validatePromo = async (req, res) => {
  try {
    const { code, amount } = req.body;
    const promo = await Promo.findOne({ code: code.toUpperCase() });

    if (!promo) {
      return res.status(404).json({ message: 'Промокод не найден' });
    }

    if (!promo.isValid()) {
      return res.status(400).json({ message: 'Промокод недействителен' });
    }

    if (promo.minPurchaseAmount && amount < promo.minPurchaseAmount) {
      return res.status(400).json({
        message: `Минимальная сумма заказа для использования промокода: ${promo.minPurchaseAmount}`
      });
    }

    // Рассчитываем скидку
    const discount = promo.type === 'percentage'
      ? (amount * promo.discount / 100)
      : promo.discount;

    res.json({
      valid: true,
      discount,
      finalAmount: amount - discount
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при проверке промокода', error: error.message });
  }
}; 