import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserFavorites
} from '@/controllers/userController';

const router = Router();

// ============= USER ROUTES =============

// GET /api/v1/users - Získání všech uživatelů
router.get('/', getUsers);

// GET /api/v1/users/:id - Získání jednoho uživatele (MongoDB ID nebo Clerk ID)
router.get('/:id', getUser);

// POST /api/v1/users - Vytvoření nového uživatele
router.post('/', createUser);

// PUT /api/v1/users/:id - Aktualizace uživatele
router.put('/:id', updateUser);

// DELETE /api/v1/users/:id - Smazání uživatele
router.delete('/:id', deleteUser);

// ============= USER FAVORITES ROUTES =============

// GET /api/v1/users/:id/favorites - Oblíbené události uživatele
router.get('/:id/favorites', getUserFavorites);

export default router;