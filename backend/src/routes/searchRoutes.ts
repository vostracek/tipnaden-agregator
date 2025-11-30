import { Router } from 'express';
import { search, getSuggestions } from '@/controllers/searchController';
import { searchLimiter } from '@/controllers/rateLimiters';

const router = Router();

// GET /api/v1/search?q=koncert
// ✅ Hlavní vyhledávání - vrátí kompletní eventy
router.get('/', searchLimiter, search);

// GET /api/v1/search/suggestions?q=kon
// ✅ Autocomplete suggestions - rychlé návrhy
router.get('/suggestions', searchLimiter, getSuggestions);

export default router;