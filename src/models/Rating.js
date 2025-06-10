import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'ratings' });

// Уникальный индекс для комбинации product-user
ratingSchema.index({ product: 1, user: 1 }, { unique: true });

// Обновляем дату изменения при обновлении записи
ratingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Статический метод для получения среднего рейтинга продукта
ratingSchema.statics.getAverageRating = async function(productId) {
  try {
    const result = await this.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    if (result.length > 0) {
      return {
        avgRating: parseFloat(result[0].avgRating.toFixed(1)),
        count: result[0].count
      };
    }
    
    return { avgRating: 0, count: 0 };
  } catch (error) {
    console.error('Ошибка при получении среднего рейтинга:', error);
    return { avgRating: 0, count: 0 };
  }
};

// Статический метод для получения распределения рейтингов
ratingSchema.statics.getRatingDistribution = async function(productId) {
  try {
    const result = await this.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    
    // Создаем объект с ключами 1-5 и значением количества оценок
    const distribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    result.forEach(item => {
      distribution[item._id] = item.count;
    });
    
    return distribution;
  } catch (error) {
    console.error('Ошибка при получении распределения рейтингов:', error);
    return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  }
};

// Статический метод для получения топ продуктов по рейтингу
ratingSchema.statics.getTopRatedProducts = async function(limit = 10) {
  try {
    console.log(`Запрос на получение ${limit} лучших продуктов по рейтингу`);
    
    // Первый проход: получаем товары с хорошими рейтингами (минимум 3 оценки)
    const result = await this.aggregate([
      { $group: { 
          _id: '$product', 
          avgRating: { $avg: '$rating' }, 
          count: { $sum: 1 } 
        } 
      },
      { $match: { count: { $gte: 3 } } }, // Минимум 3 оценки для объективности
      // Сортировка сначала по среднему рейтингу, затем по количеству оценок
      { $sort: { avgRating: -1, count: -1 } },
      { $limit: limit }
    ]);

    console.log(`Найдено ${result.length} продуктов с 3+ оценками`);
    
    // Если получили недостаточно продуктов, попробуем получить популярные с меньшим количеством оценок
    if (result.length < limit) {
      console.log('Ищем дополнительные продукты с любым количеством оценок');
      const additionalResult = await this.aggregate([
        { $group: { 
            _id: '$product', 
            avgRating: { $avg: '$rating' }, 
            count: { $sum: 1 } 
          } 
        },
        // Исключаем те, которые уже получили
        { $match: { 
            _id: { 
              $nin: result.map(item => item._id) 
            } 
          } 
        },
        { $sort: { avgRating: -1, count: -1 } },
        { $limit: limit - result.length }
      ]);
      
      console.log(`Найдено дополнительно ${additionalResult.length} продуктов`);
      
      // Объединяем результаты
      result.push(...additionalResult);
    }

    console.log(`Итого возвращаем ${result.length} популярных продуктов`);
    return result;
  } catch (error) {
    console.error('Ошибка при получении топ продуктов:', error);
    return [];
  }
};

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating; 