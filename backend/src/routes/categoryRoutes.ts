import { Router } from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/controllers/categoryController';

// Vytvoření router instance
const router = Router();

// ============= CATEGORY ROUTES =============

// GET /api/v1/categories - Získání všech kategorií
router.get('/', getCategories);

// GET /api/v1/categories/:id - Získání jedné kategorie
// :id může být ObjectId nebo slug
router.get('/:id', getCategory);

// POST /api/v1/categories - Vytvoření nové kategorie
router.post('/', createCategory);

// PUT /api/v1/categories/:id - Aktualizace kategorie
router.put('/:id', updateCategory);

// DELETE /api/v1/categories/:id - Smazání kategorie (soft delete)
router.delete('/:id', deleteCategory);

export default router;