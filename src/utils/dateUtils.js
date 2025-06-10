/**
 * Утилиты для работы с датами
 */

/**
 * Форматирует дату в локальный формат
 * @param {string|Date} dateString - Дата в формате строки или объекта Date
 * @param {boolean} includeTime - Включать ли время в форматированную дату
 * @returns {string} Дата в формате ДД.ММ.ГГГГ (или ДД.ММ.ГГГГ ЧЧ:ММ если includeTime=true)
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'Не указано';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Некорректная дата';
    }
    
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('ru-RU', options);
  } catch (error) {
    console.error('Ошибка при форматировании даты:', error);
    return 'Ошибка форматирования';
  }
};

/**
 * Проверяет, истекла ли дата
 * @param {string|Date} dateString - Дата в формате строки или объекта Date
 * @returns {boolean} true если дата в прошлом, иначе false
 */
export const isExpired = (dateString) => {
  if (!dateString) return true;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    return date < now;
  } catch (error) {
    console.error('Ошибка при проверке даты:', error);
    return true; // Если ошибка при обработке даты, считаем её истекшей
  }
}; 