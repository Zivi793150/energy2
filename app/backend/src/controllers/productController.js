import Product from '../models/Product.js';
import Rating from '../models/Rating.js';

// Получение всех продуктов
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || '-createdAt';
    const { flavor, firm, minPrice, maxPrice } = req.query;
    
    const query = { isActive: true };

    // Добавляем фильтры
    if (flavor && flavor !== 'undefined') query.flavor = flavor;
    if (firm && firm !== 'undefined') query.firm = firm;
    
    // Добавляем фильтры по цене
    if (minPrice && minPrice !== 'undefined') {
      query.price = { ...query.price, $gte: Number(minPrice) };
    }
    if (maxPrice && maxPrice !== 'undefined') {
      query.price = { ...query.price, $lte: Number(maxPrice) };
    }

    // Выполняем запрос с пагинацией
    const products = await Product.find(query)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Получаем общее количество продуктов
    const count = await Product.countDocuments(query);

    // Добавляем информацию о рейтинге
    const productsWithRating = await Promise.all(products.map(async (product) => {
      const ratings = await Rating.find({ product: product._id });
      const ratingCount = ratings.length;
      const ratingAvg = ratingCount > 0 
        ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratingCount 
        : 0;

      return {
        ...product,
        ratingCount,
        ratingAvg
      };
    }));

    res.json({
      products: productsWithRating,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalProducts: count
    });
  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении продуктов', 
      error: error.message 
    });
  }
};

// Получение одного продукта
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении продукта' });
  }
};

// Создание продукта
export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при создании продукта' });
  }
};

// Обновление продукта
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении продукта' });
  }
};

// Удаление продукта
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }
    res.json({ message: 'Продукт удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении продукта' });
  }
};

// Получение топовых продуктов
export const getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ ratingAvg: -1, popularity: -1 })
      .limit(5)
      .lean();

    const productsWithRating = await Promise.all(products.map(async (product) => {
      const ratings = await Rating.find({ product: product._id });
      const ratingCount = ratings.length;
      const ratingAvg = ratingCount > 0 
        ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratingCount 
        : 0;

      return {
        ...product,
        ratingCount,
        ratingAvg
      };
    }));

    res.json(productsWithRating);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении топовых продуктов' });
  }
};

// Добавление рейтинга
export const addRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const productId = req.params.id;
    const userId = req.user._id;

    let ratingDoc = await Rating.findOne({ product: productId, user: userId });
    
    if (ratingDoc) {
      ratingDoc.rating = rating;
      await ratingDoc.save();
    } else {
      ratingDoc = new Rating({
        product: productId,
        user: userId,
        rating
      });
      await ratingDoc.save();
    }

    // Обновляем средний рейтинг продукта
    const ratings = await Rating.find({ product: productId });
    const ratingCount = ratings.length;
    const ratingAvg = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratingCount;

    await Product.findByIdAndUpdate(productId, {
      ratingAvg,
      ratingCount
    });

    res.json(ratingDoc);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при добавлении рейтинга' });
  }
};

// Функция для инициализации базы данных
export const initializeProducts = async () => {
  try {
    // Очищаем существующую коллекцию
    await Product.deleteMany({});
    console.log('Коллекция products очищена');

    // Создаем новые продукты
    const products = [
      // Volt Energy (5 продуктов)
      {
        name: 'Volt Energy Drink Classic',
        description: 'Классический энергетический напиток с высоким содержанием таурина и витаминов группы B',
        price: 120,
        stock: 100,
        firm: 'Volt',
        flavor: 'classic',
        images: ['/images/volt.png'],
        isActive: true
      },
      {
        name: 'Volt Energy Drink Zero',
        description: 'Энергетический напиток без сахара с нулевой калорийностью',
        price: 130,
        stock: 80,
        firm: 'Volt',
        flavor: 'citrus',
        images: ['/images/nosugar_volt.jpg'],
        isActive: true
      },
      {
        name: 'Volt Energy Drink Blue',
        description: 'Энергетический напиток с освежающим вкусом',
        price: 140,
        stock: 60,
        firm: 'Volt',
        flavor: 'berry',
        images: ['/images/volt_blue.jpg'],
        isActive: true
      },
      {
        name: 'Volt Energy Drink Orange',
        description: 'Энергетический напиток с цитрусовым вкусом',
        price: 150,
        stock: 70,
        firm: 'Volt',
        flavor: 'citrus',
        images: ['/images/orange_volt.png'],
        isActive: true
      },
      {
        name: 'Volt Energy Drink Sport',
        description: 'Энергетический напиток для спортсменов',
        price: 145,
        stock: 50,
        firm: 'Volt',
        flavor: 'tropic',
        images: ['/images/product1.jpg'],
        isActive: true
      },

      // Jaguar Energy (5 продуктов)
      {
        name: 'Jaguar Energy Drink Classic',
        description: 'Мощный энергетический напиток с экстрактом гуараны',
        price: 140,
        stock: 90,
        firm: 'Jaguar',
        flavor: 'classic',
        images: ['/images/jaguar_original.jpg'],
        isActive: true
      },
      {
        name: 'Jaguar Energy Drink Live',
        description: 'Энергетический напиток с повышенным содержанием таурина',
        price: 150,
        stock: 70,
        firm: 'Jaguar',
        flavor: 'tropic',
        images: ['/images/Jaguar_live.jpg'],
        isActive: true
      },
      {
        name: 'Jaguar Energy Drink Berry',
        description: 'Энергетический напиток с ягодным вкусом',
        price: 160,
        stock: 65,
        firm: 'Jaguar',
        flavor: 'berry',
        images: ['/images/Jaguar_berry.jpg'],
        isActive: true
      },
      {
        name: 'Jaguar Energy Drink Tropic',
        description: 'Энергетический напиток с тропическим вкусом',
        price: 145,
        stock: 75,
        firm: 'Jaguar',
        flavor: 'tropic',
        images: ['/images/jaguar_tropic.png'],
        isActive: true
      },
      {
        name: 'Jaguar Energy Drink Sport',
        description: 'Энергетический напиток для спортсменов',
        price: 155,
        stock: 60,
        firm: 'Jaguar',
        flavor: 'exotic',
        images: ['/images/product2.jpg'],
        isActive: true
      },

      // Monster Energy (5 продуктов)
      {
        name: 'Monster Energy Classic',
        description: 'Культовый энергетический напиток с уникальным вкусом',
        price: 160,
        stock: 85,
        firm: 'Monster',
        flavor: 'classic',
        images: ['/images/monster.png'],
        isActive: true
      },
      {
        name: 'Monster Energy Ultra',
        description: 'Энергетический напиток без сахара с нулевой калорийностью',
        price: 170,
        stock: 75,
        firm: 'Monster',
        flavor: 'citrus',
        images: ['/images/monster_ultra.jpg'],
        isActive: true
      },
      {
        name: 'Monster Energy Java',
        description: 'Энергетический напиток со вкусом кофе',
        price: 175,
        stock: 70,
        firm: 'Monster',
        flavor: 'chocolate',
        images: ['/images/monster_java.jpg'],
        isActive: true
      },
      {
        name: 'Monster Energy Ultra Red',
        description: 'Энергетический напиток без сахара со вкусом красных ягод',
        price: 175,
        stock: 65,
        firm: 'Monster',
        flavor: 'berry',
        images: ['/images/redbull_tropical.jpg'],
        isActive: true
      },
      {
        name: 'Monster Energy Ultra Blue',
        description: 'Энергетический напиток без сахара со вкусом голубой малины',
        price: 175,
        stock: 60,
        firm: 'Monster',
        flavor: 'berry',
        images: ['/images/redbull_original.jpg'],
        isActive: true
      },

      // Adrenaline Rush (5 продуктов)
      {
        name: 'Adrenaline Rush Classic',
        description: 'Энергетический напиток с экстрактом женьшеня и гуараны',
        price: 145,
        stock: 95,
        firm: 'Adrenaline',
        flavor: 'classic',
        images: ['/images/adrenaline_rush.jpg'],
        isActive: true
      },
      {
        name: 'Adrenaline Rush Sport',
        description: 'Энергетический напиток для спортсменов с L-карнитином',
        price: 155,
        stock: 65,
        firm: 'Adrenaline',
        flavor: 'berry',
        images: ['/images/gorilla_energy.jpg'],
        isActive: true
      },
      {
        name: 'Adrenaline Rush Zero',
        description: 'Энергетический напиток без сахара с нулевой калорийностью',
        price: 150,
        stock: 70,
        firm: 'Adrenaline',
        flavor: 'citrus',
        images: ['/images/hell_strong.jpg'],
        isActive: true
      },
      {
        name: 'Adrenaline Rush Ultra',
        description: 'Премиальный энергетический напиток с экстрактом гуараны и таурином',
        price: 165,
        stock: 55,
        firm: 'Adrenaline',
        flavor: 'tropic',
        images: ['/images/rockstar_punched.jpg'],
        isActive: true
      },
      {
        name: 'Adrenaline Rush Focus',
        description: 'Энергетический напиток для улучшения концентрации с гинкго билоба',
        price: 160,
        stock: 60,
        firm: 'Adrenaline',
        flavor: 'mint',
        images: ['/images/black_insomnia.jpg'],
        isActive: true
      },

      // LitEnergy (5 продуктов)
      {
        name: 'Lit Energy Drink Classic',
        description: 'Современный энергетический напиток с натуральными ингредиентами',
        price: 135,
        stock: 100,
        firm: 'LitEnergy',
        flavor: 'classic',
        images: ['/images/Lit.png'],
        isActive: true
      },
      {
        name: 'Lit Energy Drink Original',
        description: 'Энергетический напиток с классическим вкусом',
        price: 145,
        stock: 80,
        firm: 'LitEnergy',
        flavor: 'original',
        images: ['/images/Lit_original.png'],
        isActive: true
      },
      {
        name: 'Lit Energy Drink Berry',
        description: 'Энергетический напиток с ягодным вкусом',
        price: 155,
        stock: 70,
        firm: 'LitEnergy',
        flavor: 'berry',
        images: ['/images/Lit_berry.png'],
        isActive: true
      },
      {
        name: 'Lit Energy Drink Bercoc',
        description: 'Энергетический напиток с уникальным вкусом',
        price: 165,
        stock: 65,
        firm: 'LitEnergy',
        flavor: 'exotic',
        images: ['/images/lit_bercoc.png'],
        isActive: true
      },
      {
        name: 'Lit Energy Drink Sport',
        description: 'Энергетический напиток для спортсменов',
        price: 150,
        stock: 75,
        firm: 'LitEnergy',
        flavor: 'mint',
        images: ['/images/boost_nitro.jpg'],
        isActive: true
      }
    ];

    // Добавляем продукты в базу данных
    const insertedProducts = await Product.insertMany(products);
    console.log('Добавлено продуктов:', insertedProducts.length);
    console.log('Список добавленных продуктов:');
    insertedProducts.forEach(product => {
      console.log({
        id: product._id,
        name: product.name,
        firm: product.firm,
        flavor: product.flavor,
        price: product.price,
        stock: product.stock
      });
    });

    return insertedProducts;
  } catch (error) {
    console.error('Ошибка при инициализации продуктов:', error);
    throw error;
  }
};

// Получение похожих продуктов по вкусу
export const getSimilarProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }

    // Ищем продукты с таким же вкусом, исключая текущий продукт
    const similarProducts = await Product.find({
      flavor: product.flavor,
      _id: { $ne: id },
      isActive: true
    }).limit(4);

    res.json(similarProducts);
  } catch (error) {
    console.error('Ошибка при поиске похожих продуктов:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получение всех уникальных вкусов
export const getFlavors = async (req, res) => {
  try {
    const flavors = await Product.distinct('flavor');
    res.json(flavors);
  } catch (error) {
    console.error('Ошибка при получении списка вкусов:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
}; 