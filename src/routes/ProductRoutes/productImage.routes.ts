import { Router } from 'express';
import {
  createProductImage,
  deleteProductImage,
  getProductImages,
  updateProductImage
} from '../../controllers/ProductAndVariationControllers/productImage.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorizeAdmin } from '../../middlewares/authorizaAdmin';
import { uploadMemory } from '../../upload/multerCloudinary';

const router = Router({ mergeParams: true });

router.get('/:productId', getProductImages);
router.use(authenticate, authorizeAdmin);

router.post('/', uploadMemory.array('image'), createProductImage);
router.patch('/:id', uploadMemory.single('image'), updateProductImage);
router.delete('/:id', deleteProductImage);

export default router;
