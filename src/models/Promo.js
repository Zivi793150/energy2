import mongoose from 'mongoose';

const promoSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Код промокода обязателен'],
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    required: [true, 'Описание промокода обязательно']
  },
  discountType: {
    type: String,
    enum: ['PERCENTAGE', 'FIXED', 'CASHBACK', 'FREE_ITEM', 'BUY_ONE_GET_ONE', 'FREE_DELIVERY'],
    required: [true, 'Тип скидки обязателен']
  },
  discountValue: {
    type: Number,
    required: [true, 'Значение скидки обязательно'],
    min: [0, 'Значение скидки не может быть отрицательным']
  },
  startDate: {
    type: Date,
    required: [true, 'Дата начала действия обязательна']
  },
  endDate: {
    type: Date,
    required: [true, 'Дата окончания действия обязательна']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  minPurchaseAmount: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  applicableCategories: [{
    type: String
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  freeItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  }
}, {
  timestamps: true
});

// Метод для проверки валидности промокода
promoSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
};

// Метод для расчета скидки
promoSchema.methods.calculateDiscount = function(purchaseAmount) {
  if (!this.isValid() || purchaseAmount < this.minPurchaseAmount) {
    return 0;
  }

  let discount = 0;
  if (this.discountType === 'PERCENTAGE' || this.discountType === 'CASHBACK') {
    discount = (purchaseAmount * this.discountValue) / 100;
  } else if (this.discountType === 'FIXED') {
    discount = this.discountValue;
  } else if (this.discountType === 'FREE_DELIVERY') {
    discount = 300; // Стоимость доставки
  }

  if (this.maxDiscountAmount !== null) {
    discount = Math.min(discount, this.maxDiscountAmount);
  }

  return discount;
};

const Promo = mongoose.model('Promo', promoSchema);

export default Promo; 