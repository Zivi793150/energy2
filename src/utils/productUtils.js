// Utility functions for products

// Common flavor keywords that might appear in energy drink names or descriptions
const FLAVOR_KEYWORDS = [
  'манго', 'яблоко', 'вишня', 'клубника', 'лайм', 'лимон', 'апельсин', 'малина', 
  'ананас', 'грейпфрут', 'черника', 'виноград', 'банан', 'персик', 'дыня',
  'клюква', 'маракуйя', 'шоколад', 'мята', 'кокос', 'айс', 'фруктовый', 'ягодный',
  'mango', 'apple', 'cherry', 'strawberry', 'lime', 'lemon', 'orange', 'raspberry',
  'pineapple', 'grapefruit', 'blueberry', 'grape', 'banana', 'peach', 'melon',
  'cranberry', 'passion fruit', 'chocolate', 'mint', 'coconut', 'ice', 'fruit', 'berry'
];

// Группы похожих вкусов
const RELATED_FLAVORS = {
  'tropic': ['tropic', 'exotic', 'mixed'],
  'berry': ['berry', 'cherry', 'mixed'],
  'citrus': ['citrus', 'mixed'],
  'classic': ['classic', 'original', 'cola'],
  'cola': ['cola', 'classic'],
  'original': ['original', 'classic'],
  'exotic': ['exotic', 'tropic', 'mixed'],
  'mint': ['mint', 'other'],
  'cherry': ['cherry', 'berry'],
  'chocolate': ['chocolate', 'other'],
  'mixed': ['mixed', 'tropic', 'berry', 'citrus'],
  'other': ['other']
};

/**
 * Extracts potential flavor information from product name and description
 * @param {Object} product - The product object
 * @returns {Array} Array of identified flavor keywords
 */
export function extractProductFlavors(product) {
  if (!product) return [];
  
  const textToSearch = `${product.name || ''} ${product.description || ''}`.toLowerCase();
  
  return FLAVOR_KEYWORDS.filter(flavor => 
    textToSearch.includes(flavor.toLowerCase())
  );
}

/**
 * Finds similar products based on flavor
 * @param {Object} currentProduct - The current product
 * @param {Array} allProducts - All available products
 * @param {number} limit - Maximum number of similar products to return
 * @returns {Array} Array of similar products
 */
export function findSimilarProducts(currentProduct, allProducts, limit = 4) {
  if (!currentProduct || !allProducts || allProducts.length === 0) {
    return [];
  }

  const currentId = currentProduct._id || currentProduct.id;
  
  // Фильтруем продукты, исключая текущий
  const otherProducts = allProducts.filter(product => 
    (product._id || product.id) !== currentId
  );
  
  // Если у текущего продукта есть поле flavor, используем его
  if (currentProduct.flavor) {
    const currentFlavor = currentProduct.flavor;
    const relatedFlavors = RELATED_FLAVORS[currentFlavor] || [currentFlavor];
    
    // Находим продукты с похожими вкусами
    const similarFlavorProducts = otherProducts.filter(product => 
      product.flavor && relatedFlavors.includes(product.flavor)
    );
    
    // Если найдено достаточное количество похожих продуктов, возвращаем их
    if (similarFlavorProducts.length >= limit) {
      return similarFlavorProducts.slice(0, limit);
    }
    
    // Если похожих по вкусу не хватает, добавляем случайные продукты
    const randomProducts = otherProducts
      .filter(product => !similarFlavorProducts.includes(product))
      .sort(() => 0.5 - Math.random());
      
    return [...similarFlavorProducts, ...randomProducts].slice(0, limit);
  }
  
  // Если поле flavor отсутствует, используем старый алгоритм с ключевыми словами
  const currentFlavors = extractProductFlavors(currentProduct);
  
  // Если не определены ключевые слова вкусов, возвращаем случайные продукты
  if (currentFlavors.length === 0) {
    return otherProducts
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);
  }
  
  // Подсчитываем совпадения ключевых слов для каждого продукта
  const productsWithScores = otherProducts.map(product => {
    const productFlavors = extractProductFlavors(product);
    
    // Подсчитываем совпадающие ключевые слова
    const matchingFlavors = currentFlavors.filter(flavor => 
      productFlavors.includes(flavor)
    );
    
    return {
      product,
      score: matchingFlavors.length
    };
  });
  
  // Сортируем по количеству совпадений (по убыванию)
  return productsWithScores
    .sort((a, b) => b.score - a.score)
    .map(item => item.product)
    .slice(0, limit);
} 