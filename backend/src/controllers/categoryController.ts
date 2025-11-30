import { Request, Response } from 'express';
import { Category } from '@/models/Category';
import { ApiResponse, CreateCategoryDTO } from '@/types';

// ============= GET ALL CATEGORIES =============
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Getting all categories...');
    
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .select('name slug description icon color parentCategory isActive createdAt');
    
    console.log(`Found ${categories.length} categories`);
    
    const response: ApiResponse = {
      success: true,
      data: categories,
      message: `Found ${categories.length} categories`
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting categories:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch categories'
    };
    
    res.status(500).json(response);
  }
};

// ============= GET SINGLE CATEGORY =============
export const getCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Category ID is required'
      };
      
      res.status(400).json(response);
      return;
    }
    
    console.log(`Getting category with ID: ${id}`);
    
    // Zkontroluj jestli je to validní ObjectId (24 hex znaky)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let query;
    if (isValidObjectId) {
      // Vyhledej podle _id
      query = { _id: id, isActive: true };
    } else {
      // Vyhledej podle slug
      query = { slug: id, isActive: true };
    }
    
    const category = await Category.findOne(query)
      .populate('children')
      .select('name slug description icon color parentCategory isActive createdAt');
    
    if (!category) {
      const response: ApiResponse = {
        success: false,
        error: 'Category not found'
      };
      
      res.status(404).json(response);
      return;
    }
    
    console.log(`Found category: ${category.name}`);
    
    const response: ApiResponse = {
      success: true,
      data: category,
      message: 'Category found'
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting category:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch category'
    };
    
    res.status(500).json(response);
  }
};

// ============= CREATE CATEGORY =============
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryData: CreateCategoryDTO = req.body;
    console.log('Creating new category:', categoryData.name);
    
    if (!categoryData.name) {
      const response: ApiResponse = {
        success: false,
        error: 'Category name is required'
      };
      
      res.status(400).json(response);
      return;
    }
    
    const existingCategory = await Category.findOne({ 
      name: categoryData.name 
    });
    
    if (existingCategory) {
      const response: ApiResponse = {
        success: false,
        error: 'Category with this name already exists'
      };
      
      res.status(409).json(response);
      return;
    }
    
    const category = new Category({
      name: categoryData.name,
      description: categoryData.description,
      icon: categoryData.icon,
      color: categoryData.color,
      parentCategory: categoryData.parentCategory || null
    });
    
    const savedCategory = await category.save();
    
    console.log(`Category created: ${savedCategory.name} (${savedCategory._id})`);
    
    const response: ApiResponse = {
      success: true,
      data: savedCategory,
      message: 'Category created successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating category:', error);
    
    if ((error as any).name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors)
        .map((err: any) => err.message);
      
      const response: ApiResponse = {
        success: false,
        error: 'Validation failed',
        details: validationErrors
      };
      
      res.status(400).json(response);
      return;
    }
    
    if ((error as any).code === 11000) {
      const response: ApiResponse = {
        success: false,
        error: 'Category with this name or slug already exists'
      };
      
      res.status(409).json(response);
      return;
    }
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create category'
    };
    
    res.status(500).json(response);
  }
};

// ============= UPDATE CATEGORY =============
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Category ID is required'
      };
      
      res.status(400).json(response);
      return;
    }
    
    console.log(`Updating category: ${id}`);
    
    // Zkontroluj jestli je to validní ObjectId (24 hex znaky)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let query;
    if (isValidObjectId) {
      // Vyhledej podle _id
      query = { _id: id, isActive: true };
    } else {
      // Vyhledej podle slug
      query = { slug: id, isActive: true };
    }
    
    const category = await Category.findOneAndUpdate(
      query,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!category) {
      const response: ApiResponse = {
        success: false,
        error: 'Category not found'
      };
      
      res.status(404).json(response);
      return;
    }
    
    console.log(`Category updated: ${category.name}`);
    
    const response: ApiResponse = {
      success: true,
      data: category,
      message: 'Category updated successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating category:', error);
    
    if ((error as any).name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors)
        .map((err: any) => err.message);
      
      const response: ApiResponse = {
        success: false,
        error: 'Validation failed',
        details: validationErrors
      };
      
      res.status(400).json(response);
      return;
    }
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to update category'
    };
    
    res.status(500).json(response);
  }
};

// ============= DELETE CATEGORY =============
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Category ID is required'
      };
      
      res.status(400).json(response);
      return;
    }
    
    console.log(`Deleting category: ${id}`);
    
    // Zkontroluj jestli je to validní ObjectId (24 hex znaky)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let query;
    if (isValidObjectId) {
      // Vyhledej podle _id
      query = { _id: id, isActive: true };
    } else {
      // Vyhledej podle slug
      query = { slug: id, isActive: true };
    }
    
    const category = await Category.findOne(query);
    
    if (!category) {
      const response: ApiResponse = {
        success: false,
        error: 'Category not found'
      };
      
      res.status(404).json(response);
      return;
    }
    
    category.isActive = false;
    await category.save();
    
    console.log(`Category deleted (soft): ${category.name}`);
    
    const response: ApiResponse = {
      success: true,
      message: 'Category deleted successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error deleting category:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to delete category'
    };
    
    res.status(500).json(response);
  }
};