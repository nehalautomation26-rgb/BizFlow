const express = require('express');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getLowStockProducts,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// All product routes require authentication
router.use(protect);
router.use(checkSubscription);
router.route('/')
  .get(getProducts)
  .post(createProduct);

router.get('/low-stock', getLowStockProducts);

router.route('/:id')
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;