import Promo from '../models/Promo.js';

// Получение всех промокодов
export const getAllPromos = async (req, res) => {
  try {
    const promos = await Promo.find()
      .sort({ createdAt: -1 })
      .lean(); // Используем lean() для получения простых JavaScript объектов
    
    // Преобразуем даты в строки ISO для корректной сериализации
    const formattedPromos = promos.map(promo => ({
      ...promo,
      startDate: promo.startDate.toISOString(),
      endDate: promo.endDate.toISOString(),
      createdAt: promo.createdAt.toISOString(),
      updatedAt: promo.updatedAt.toISOString()
    }));

    console.log('Отправляем промокоды:', formattedPromos);
    res.json(formattedPromos);
  } catch (error) {
    console.error('Ошибка при получении промокодов:', error);
    res.status(500).json({ message: 'Ошибка при получении промокодов' });
  }
};

// Получение промокода по ID
export const getPromoById = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await Promo.findById(id);
    
    if (!promo) {
      return res.status(404).json({ message: 'Промокод не найден' });
    }
    
    res.json(promo);
  } catch (error) {
    console.error('Ошибка при получении промокода:', error);
    res.status(500).json({ message: 'Ошибка при получении промокода' });
  }
};

// Создание нового промокода
export const createPromo = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      isActive,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
      applicableCategories,
      excludedProducts,
      freeItem
    } = req.body;

    // Проверка на существующий код
    const existingPromo = await Promo.findOne({ code });
    if (existingPromo) {
      return res.status(400).json({ message: 'Промокод с таким кодом уже существует' });
    }

    // Создание нового промокода
    const promo = new Promo({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue: Number(discountValue),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: Boolean(isActive),
      minPurchaseAmount: Number(minPurchaseAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      applicableCategories: applicableCategories || [],
      excludedProducts: excludedProducts || [],
      freeItem: freeItem || null
    });

    await promo.save();
    res.status(201).json(promo);
  } catch (error) {
    console.error('Ошибка при создании промокода:', error);
    res.status(500).json({ 
      message: 'Ошибка при создании промокода',
      error: error.message 
    });
  }
};

// Обновление промокода
export const updatePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      isActive,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
      applicableCategories,
      excludedProducts,
      freeItem
    } = req.body;

    // Проверка на существующий код (кроме текущего промокода)
    if (code) {
      const existingPromo = await Promo.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingPromo) {
        return res.status(400).json({ message: 'Промокод с таким кодом уже существует' });
      }
    }

    const promo = await Promo.findById(id);
    if (!promo) {
      return res.status(404).json({ message: 'Промокод не найден' });
    }

    // Обновление полей
    if (code) promo.code = code.toUpperCase();
    if (description) promo.description = description;
    if (discountType) promo.discountType = discountType;
    if (discountValue !== undefined) promo.discountValue = Number(discountValue);
    if (startDate) promo.startDate = new Date(startDate);
    if (endDate) promo.endDate = new Date(endDate);
    if (isActive !== undefined) promo.isActive = Boolean(isActive);
    if (minPurchaseAmount !== undefined) promo.minPurchaseAmount = Number(minPurchaseAmount);
    if (maxDiscountAmount !== undefined) promo.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
    if (usageLimit !== undefined) promo.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (applicableCategories) promo.applicableCategories = applicableCategories;
    if (excludedProducts) promo.excludedProducts = excludedProducts;
    if (freeItem !== undefined) promo.freeItem = freeItem;

    await promo.save();
    res.json(promo);
  } catch (error) {
    console.error('Ошибка при обновлении промокода:', error);
    res.status(500).json({ 
      message: 'Ошибка при обновлении промокода',
      error: error.message 
    });
  }
};

// Удаление промокода
export const deletePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await Promo.findByIdAndDelete(id);
    if (!promo) {
      return res.status(404).json({ message: 'Промокод не найден' });
    }
    res.json({ message: 'Промокод успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении промокода:', error);
    res.status(500).json({ message: 'Ошибка при удалении промокода' });
  }
};

// Применение промокода
export const applyPromo = async (req, res) => {
  try {
    const { code, purchaseAmount } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false,
        message: 'Не указан код промокода' 
      });
    }

    if (!purchaseAmount || purchaseAmount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Неверная сумма покупки' 
      });
    }

    console.log('Попытка найти промокод с кодом:', code.toUpperCase());
    console.log('Тип объекта Promo:', typeof Promo);
    console.log('Объект Promo:', Promo);

    const promo = await Promo.findOne({ code: code.toUpperCase() });
    
    if (!promo) {
      return res.status(404).json({ 
        success: false,
        message: 'Промокод не найден' 
      });
    }

    // Проверяем валидность промокода
    const now = new Date();
    if (!promo.isActive || 
        now < promo.startDate || 
        now > promo.endDate || 
        (promo.usageLimit && promo.usedCount >= promo.usageLimit)) {
      return res.status(400).json({ 
        success: false,
        message: 'Промокод недействителен' 
      });
    }

    // Проверяем минимальную сумму покупки
    if (purchaseAmount < promo.minPurchaseAmount) {
      return res.status(400).json({ 
        success: false,
        message: `Минимальная сумма покупки для применения промокода: ${promo.minPurchaseAmount} руб.` 
      });
    }

    // Рассчитываем скидку
    const discount = promo.calculateDiscount(purchaseAmount);
    
    // Формируем ответ
    const response = {
      success: true,
      message: 'Промокод успешно применен',
      promoDetails: {
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue
      },
      discount: discount
    };

    // Если это промокод на бесплатную доставку
    if (promo.discountType === 'FREE_DELIVERY') {
      response.deliveryPrice = 0;
    }

    // Если это промокод на бесплатный товар
    if (promo.discountType === 'FREE_ITEM' && promo.freeItem) {
      response.freeItem = promo.freeItem;
    }

    console.log('Применение промокода:', {
      code: promo.code,
      purchaseAmount,
      discount,
      response
    });

    res.json(response);
  } catch (error) {
    console.error('Ошибка при применении промокода:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка при применении промокода',
      error: error.message 
    });
  }
};

export default {
  getAllPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
  applyPromo
}; 