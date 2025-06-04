import Promo from '../models/Promo.js';

// Получение всех промокодов (для админа)
export const getAllPromos = async (req, res) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 });
    
    // Дополнительно проверяем валидность для отображения в интерфейсе
    const promosWithStatus = promos.map(promo => {
      const promoObj = promo.toObject();
      promoObj.isValid = promo.isValid();
      return promoObj;
    });
    
    return res.status(200).json({ success: true, promos: promosWithStatus });
  } catch (error) {
    console.error('Ошибка при получении промокодов:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении промокодов',
      error: error.message
    });
  }
};

// Получение промокода по ID (для админа)
export const getPromoById = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await Promo.findById(id);
    
    if (!promo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Промокод не найден' 
      });
    }
    
    const promoObj = promo.toObject();
    promoObj.isValid = promo.isValid();
    
    return res.status(200).json({ success: true, promo: promoObj });
  } catch (error) {
    console.error('Ошибка при получении промокода:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении промокода',
      error: error.message
    });
  }
};

// Создание нового промокода (для админа)
export const createPromo = async (req, res) => {
  try {
    const { 
      code, 
      description, 
      discountType, 
      discountValue, 
      minPurchaseAmount, 
      maxDiscountAmount, 
      startDate, 
      endDate, 
      usageLimit,
      isActive,
      applicableCategories,
      excludedProducts
    } = req.body;
    
    // Проверка на уникальность кода
    const existingPromo = await Promo.findOne({ code: code.toUpperCase() });
    if (existingPromo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Промокод с таким кодом уже существует' 
      });
    }
    
    // Создаем новый промокод
    const promo = new Promo({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minPurchaseAmount: minPurchaseAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      startDate: startDate || new Date(),
      endDate,
      usageLimit: usageLimit || null,
      isActive: isActive !== undefined ? isActive : true,
      applicableCategories: applicableCategories || [],
      excludedProducts: excludedProducts || []
    });
    
    await promo.save();
    
    return res.status(201).json({ 
      success: true, 
      message: 'Промокод успешно создан', 
      promo 
    });
  } catch (error) {
    console.error('Ошибка при создании промокода:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Ошибка при создании промокода',
      error: error.message
    });
  }
};

// Обновление промокода (для админа)
export const updatePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      code, 
      description, 
      discountType, 
      discountValue, 
      minPurchaseAmount, 
      maxDiscountAmount, 
      startDate, 
      endDate, 
      usageLimit,
      isActive,
      applicableCategories,
      excludedProducts,
      usedCount
    } = req.body;
    
    // Проверка существования промокода
    const promo = await Promo.findById(id);
    if (!promo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Промокод не найден' 
      });
    }
    
    // Если код меняется, проверяем уникальность
    if (code && code.toUpperCase() !== promo.code) {
      const existingPromo = await Promo.findOne({ code: code.toUpperCase() });
      if (existingPromo) {
        return res.status(400).json({ 
          success: false, 
          message: 'Промокод с таким кодом уже существует' 
        });
      }
      promo.code = code.toUpperCase();
    }
    
    // Обновляем поля промокода
    if (description) promo.description = description;
    if (discountType) promo.discountType = discountType;
    if (discountValue !== undefined) promo.discountValue = discountValue;
    if (minPurchaseAmount !== undefined) promo.minPurchaseAmount = minPurchaseAmount;
    if (maxDiscountAmount !== undefined) promo.maxDiscountAmount = maxDiscountAmount;
    if (startDate) promo.startDate = startDate;
    if (endDate) promo.endDate = endDate;
    if (usageLimit !== undefined) promo.usageLimit = usageLimit;
    if (isActive !== undefined) promo.isActive = isActive;
    if (usedCount !== undefined) promo.usedCount = usedCount;
    if (applicableCategories) promo.applicableCategories = applicableCategories;
    if (excludedProducts) promo.excludedProducts = excludedProducts;
    
    await promo.save();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Промокод успешно обновлен', 
      promo 
    });
  } catch (error) {
    console.error('Ошибка при обновлении промокода:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Ошибка при обновлении промокода',
      error: error.message
    });
  }
};

// Удаление промокода (для админа)
export const deletePromo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const promo = await Promo.findByIdAndDelete(id);
    
    if (!promo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Промокод не найден' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Промокод успешно удален' 
    });
  } catch (error) {
    console.error('Ошибка при удалении промокода:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Ошибка при удалении промокода',
      error: error.message
    });
  }
};

// Применение промокода
export const applyPromo = async (req, res) => {
  try {
    const { code, purchaseAmount } = req.body;
    
    if (!code || !purchaseAmount) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать код промокода и сумму покупки'
      });
    }
    
    const promo = await Promo.findOne({ code: code.toUpperCase() });
    
    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Промокод не найден'
      });
    }
    
    if (!promo.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Промокод недействителен'
      });
    }
    
    const discount = promo.calculateDiscount(purchaseAmount);
    
    if (discount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Промокод не может быть применен к данной сумме'
      });
    }
    
    // Увеличиваем счетчик использования
    promo.usedCount += 1;
    await promo.save();
    
    return res.status(200).json({
      success: true,
      message: 'Промокод успешно применен',
      discount,
      finalAmount: purchaseAmount - discount
    });
  } catch (error) {
    console.error('Ошибка при применении промокода:', error);
    return res.status(500).json({
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