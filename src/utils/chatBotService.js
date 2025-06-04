const CHAT_FLOW = {
  start: {
    message: 'Здравствуйте! Я виртуальный помощник магазина. Чем я могу вам помочь?',
    options: [
      { text: 'Вопросы о доставке', value: 'delivery' },
      { text: 'Вопросы об оплате', value: 'payment' },
      { text: 'Вопросы о товарах', value: 'products' },
      { text: 'Проблемы с заказом', value: 'order_issue' },
      { text: 'Другое', value: 'other' }
    ]
  },
  
  // Ветка доставки
  delivery: {
    message: 'Какой у вас вопрос о доставке?',
    options: [
      { text: 'Сроки доставки', value: 'delivery_time' },
      { text: 'Стоимость доставки', value: 'delivery_cost' },
      { text: 'Регионы доставки', value: 'delivery_regions' },
      { text: 'Отследить посылку', value: 'delivery_tracking' },
      { text: 'Другой вопрос о доставке', value: 'delivery_other' }
    ]
  },
  
  delivery_time: {
    message: 'Стандартный срок доставки составляет 1-3 рабочих дня в пределах города и 3-7 рабочих дней по России. Вам нужна дополнительная информация?',
    options: [
      { text: 'Да, нужна консультация', value: 'connect_operator_delivery' },
      { text: 'Нет, всё понятно', value: 'thank_you' }
    ]
  },
  
  delivery_cost: {
    message: 'Стоимость доставки зависит от региона и веса заказа. В пределах города доставка бесплатна при заказе от 3000 руб. По России стоимость от 300 руб. Нужны более точные расчеты?',
    options: [
      { text: 'Да, рассчитать стоимость', value: 'connect_operator_delivery' },
      { text: 'Нет, всё понятно', value: 'thank_you' }
    ]
  },
  
  delivery_regions: {
    message: 'Мы осуществляем доставку по всей России. В некоторые отдаленные регионы срок доставки может быть увеличен. Хотите уточнить информацию по вашему региону?',
    options: [
      { text: 'Да, уточнить', value: 'connect_operator_delivery' },
      { text: 'Нет, всё понятно', value: 'thank_you' }
    ]
  },
  
  delivery_tracking: {
    message: 'Для отслеживания посылки нужен номер заказа. Хотите связаться с оператором для отслеживания?',
    options: [
      { text: 'Да, связаться', value: 'connect_operator_delivery' },
      { text: 'Нет, не сейчас', value: 'thank_you' }
    ]
  },
  
  delivery_other: {
    message: 'Для получения подробной информации по другим вопросам доставки предлагаю связаться с оператором.',
    options: [
      { text: 'Связаться с оператором', value: 'connect_operator_delivery' },
      { text: 'Вернуться в начало', value: 'start' }
    ]
  },
  
  // Ветка оплаты
  payment: {
    message: 'Какой у вас вопрос об оплате?',
    options: [
      { text: 'Способы оплаты', value: 'payment_methods' },
      { text: 'Проблема с оплатой', value: 'payment_issue' },
      { text: 'Возврат средств', value: 'payment_refund' },
      { text: 'Другой вопрос об оплате', value: 'payment_other' }
    ]
  },
  
  payment_methods: {
    message: 'Мы принимаем оплату банковскими картами Visa, MasterCard, МИР, электронными платежами (Apple Pay, Google Pay), а также наложенным платежом. Нужна дополнительная информация?',
    options: [
      { text: 'Да, нужна консультация', value: 'connect_operator_payment' },
      { text: 'Нет, всё понятно', value: 'thank_you' }
    ]
  },
  
  payment_issue: {
    message: 'Сожалею о проблеме с оплатой. Для быстрого решения вашего вопроса предлагаю связаться с оператором.',
    options: [
      { text: 'Связаться с оператором', value: 'connect_operator_payment' },
      { text: 'Вернуться в начало', value: 'start' }
    ]
  },
  
  payment_refund: {
    message: 'Возврат средств производится на ту же карту/счет, с которого была произведена оплата, в течение 3-14 рабочих дней в зависимости от банка. Хотите уточнить детали?',
    options: [
      { text: 'Да, уточнить детали', value: 'connect_operator_payment' },
      { text: 'Нет, всё понятно', value: 'thank_you' }
    ]
  },
  
  payment_other: {
    message: 'Для получения подробной информации по другим вопросам оплаты предлагаю связаться с оператором.',
    options: [
      { text: 'Связаться с оператором', value: 'connect_operator_payment' },
      { text: 'Вернуться в начало', value: 'start' }
    ]
  },
  
  // Ветка вопросов о товарах
  products: {
    message: 'Какой у вас вопрос о товарах?',
    options: [
      { text: 'Наличие товара', value: 'product_availability' },
      { text: 'Характеристики товара', value: 'product_specs' },
      { text: 'Сравнение товаров', value: 'product_comparison' },
      { text: 'Другой вопрос о товарах', value: 'product_other' }
    ]
  },
  
  product_availability: {
    message: 'Наличие товара зависит от выбранной модели и может меняться. Хотите уточнить наличие конкретного товара?',
    options: [
      { text: 'Да, уточнить', value: 'connect_operator_products' },
      { text: 'Нет, всё понятно', value: 'thank_you' }
    ]
  },
  
  product_specs: {
    message: 'Характеристики указаны на странице каждого товара. Если вам нужна более подробная информация, предлагаю связаться с нашим консультантом.',
    options: [
      { text: 'Связаться с консультантом', value: 'connect_operator_products' },
      { text: 'Вернуться в начало', value: 'start' }
    ]
  },
  
  product_comparison: {
    message: 'Для сравнения товаров вы можете добавить их в раздел "Сравнение" на сайте. Если нужна помощь в выборе, свяжитесь с нашим консультантом.',
    options: [
      { text: 'Связаться с консультантом', value: 'connect_operator_products' },
      { text: 'Нет, всё понятно', value: 'thank_you' }
    ]
  },
  
  product_other: {
    message: 'Для получения подробной информации по другим вопросам о товарах предлагаю связаться с консультантом.',
    options: [
      { text: 'Связаться с консультантом', value: 'connect_operator_products' },
      { text: 'Вернуться в начало', value: 'start' }
    ]
  },
  
  // Ветка проблем с заказом
  order_issue: {
    message: 'Какая проблема с заказом у вас возникла?',
    options: [
      { text: 'Заказ не пришел', value: 'order_not_received' },
      { text: 'Ошибка в заказе', value: 'order_mistake' },
      { text: 'Некачественный товар', value: 'order_quality' },
      { text: 'Другое', value: 'order_other' }
    ]
  },
  
  order_not_received: {
    message: 'Сожалею о задержке доставки. Для проверки статуса заказа и решения проблемы нам нужно связать вас с оператором службы доставки.',
    options: [
      { text: 'Связаться с оператором', value: 'connect_operator_order' },
      { text: 'Вернуться в начало', value: 'start' }
    ]
  },
  
  order_mistake: {
    message: 'Сожалею об ошибке в заказе. Для быстрого исправления ситуации предлагаю связаться с оператором.',
    options: [
      { text: 'Связаться с оператором', value: 'connect_operator_order' },
      { text: 'Вернуться в начало', value: 'start' }
    ]
  },
  
  order_quality: {
    message: 'Сожалею о проблеме с качеством товара. Мы обязательно разберемся в ситуации. Для оформления замены или возврата предлагаю связаться с оператором.',
    options: [
      { text: 'Связаться с оператором', value: 'connect_operator_order' },
      { text: 'Вернуться в начало', value: 'start' }
    ]
  },
  
  order_other: {
    message: 'Для решения других проблем с заказом предлагаю связаться с оператором, который поможет в вашей ситуации.',
    options: [
      { text: 'Связаться с оператором', value: 'connect_operator_order' },
      { text: 'Вернуться в начало', value: 'start' }
    ]
  },
  
  // Категория "Другое"
  other: {
    message: 'По другим вопросам вам может потребоваться консультация оператора. Хотите связаться с оператором?',
    options: [
      { text: 'Да, связаться с оператором', value: 'connect_operator_general' },
      { text: 'Нет, вернуться в начало', value: 'start' }
    ]
  },
  
  // Конечные точки
  thank_you: {
    message: 'Рад был помочь! Если у вас возникнут еще вопросы, не стесняйтесь обращаться. Хотите задать еще вопрос?',
    options: [
      { text: 'Да, у меня есть вопрос', value: 'start' },
      { text: 'Нет, спасибо', value: 'end_chat' }
    ]
  },
  
  end_chat: {
    message: 'Спасибо за обращение! Желаем вам приятных покупок. Всегда рады помочь!'
  },
  
  // Операторы
  connect_operator_delivery: {
    message: 'Сейчас я соединю вас с оператором по вопросам доставки. Оператор ответит в ближайшее время.',
    next: 'operator_connecting',
    operator: 'delivery'
  },
  
  connect_operator_payment: {
    message: 'Сейчас я соединю вас с оператором по вопросам оплаты. Оператор ответит в ближайшее время.',
    next: 'operator_connecting',
    operator: 'payment'
  },
  
  connect_operator_products: {
    message: 'Сейчас я соединю вас с консультантом по товарам. Консультант ответит в ближайшее время.',
    next: 'operator_connecting',
    operator: 'products'
  },
  
  connect_operator_order: {
    message: 'Сейчас я соединю вас с оператором по вопросам заказов. Оператор ответит в ближайшее время.',
    next: 'operator_connecting',
    operator: 'orders'
  },
  
  connect_operator_general: {
    message: 'Сейчас я соединю вас с оператором. Оператор ответит в ближайшее время.',
    next: 'operator_connecting',
    operator: 'general'
  },
  
  // Состояние соединения с оператором
  operator_connecting: {
    message: 'Соединяем с оператором...'
  }
};

// Функция для получения ответа бота
const getBotResponse = (step) => {
  if (!CHAT_FLOW[step]) {
    return {
      text: 'Извините, произошла ошибка. Попробуйте начать сначала.',
      options: [{ text: 'Начать заново', value: 'start' }]
    };
  }
  
  const response = { ...CHAT_FLOW[step] };
  return response;
};

// Функция для имитации ответа оператора (в реальном приложении здесь будет интеграция с системой поддержки)
const simulateOperatorResponse = (operatorType) => {
  const operatorMessages = {
    delivery: 'Здравствуйте! Я оператор службы доставки THE ENERGY LAB. Чем могу помочь вам сегодня?',
    payment: 'Здравствуйте! Я специалист по вопросам оплаты THE ENERGY LAB. Чем могу помочь?',
    products: 'Здравствуйте! Я консультант по товарам THE ENERGY LAB. Что вас интересует?',
    orders: 'Здравствуйте! Я специалист по работе с заказами THE ENERGY LAB. Расскажите, что у вас случилось?',
    general: 'Здравствуйте! Я оператор поддержки THE ENERGY LAB. Чем могу помочь?'
  };
  
  return operatorMessages[operatorType] || operatorMessages.general;
};

// Экспортируем функции для использования в компоненте чат-бота
export { getBotResponse, simulateOperatorResponse }; 