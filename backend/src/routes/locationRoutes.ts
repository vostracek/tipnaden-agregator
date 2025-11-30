import { Router } from 'express';
import {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation
} from '@/controllers/locationController';

const router = Router();

// ============= LOCATION ROUTES =============

// GET /api/v1/locations - Získání všech lokací
router.get('/', getLocations);

// GET /api/v1/locations/:id - Získání jedné lokace
router.get('/:id', getLocation);

// POST /api/v1/locations - Vytvoření nové lokace
router.post('/', createLocation);

// PUT /api/v1/locations/:id - Aktualizace lokace
router.put('/:id', updateLocation);

// DELETE /api/v1/locations/:id - Smazání lokace
router.delete('/:id', deleteLocation);

export default router;