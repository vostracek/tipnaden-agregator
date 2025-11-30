import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Middleware pro validaci requestu pomocí Zod schema
 */
export const validateRequest = <T extends ZodSchema>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validuj query, body, a params
      const dataToValidate = {
        query: req.query,
        body: req.body,
        params: req.params,
      };
      
      const validatedData = await schema.parseAsync(dataToValidate) as any;
      
      // ✅ OPRAVA: Použij Object.assign místo přímého přiřazení
      if (validatedData.query) {
        Object.assign(req.query, validatedData.query);
      }
      if (validatedData.body) {
        req.body = validatedData.body;
      }
      if (validatedData.params) {
        Object.assign(req.params, validatedData.params);
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation failed', { 
          errors: error.issues,
          path: req.path,
          method: req.method
        });
        
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          details: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        };
        
        res.status(400).json(response);
        return;
      }
      
      // Jiný error - pošli dál
      next(error);
    }
  };
};