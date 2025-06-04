import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Название продукта обязательно'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Описание продукта обязательно']
  },
  price: {
    type: Number,
    required: [true, 'Цена продукта обязательна'],
    min: [0, 'Цена не может быть отрицательной']
  },
  category: {
    type: String,
    required: [true, 'Категория продукта обязательна']
  },
  image: {
    type: String,
    required: [true, 'Изображение продукта обязательно']
  },
  stock: {
    type: Number,
    required: [true, 'Количество на складе обязательно'],
    min: [0, 'Количество не может быть отрицательным']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  features: [{
    name: String,
    value: String
  }],
  specifications: [{
    name: String,
    value: String
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Метод для обновления среднего рейтинга
productSchema.methods.updateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = sum / this.reviews.length;
  }
  return this.save();
};

const Product = mongoose.model('Product', productSchema);

export default Product; 