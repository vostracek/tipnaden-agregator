import { Request, Response } from 'express';
import { User } from '@/models/User';
import { ApiResponse, CreateUserDTO, UpdateUserDTO } from '@/types';

// ============= GET ALL USERS =============
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Getting all users...');
    
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select('clerkId email firstName lastName avatar preferences favoriteEventsCount attendedEventsCount createdAt')
      .limit(50); // Limit pro performance
    
    console.log(`Found ${users.length} users`);
    
    const response: ApiResponse = {
      success: true,
      data: users,
      message: `Found ${users.length} users`
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting users:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch users'
    };
    
    res.status(500).json(response);
  }
};

// ============= GET SINGLE USER =============
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'User ID is required'
      };
      
      res.status(400).json(response);
      return;
    }
    
    console.log(`Getting user with ID: ${id}`);
    
    // Můžeme hledat podle MongoDB ObjectId nebo Clerk ID
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let user;
    if (isValidObjectId) {
      // Hledání podle MongoDB ID
      user = await User.findById(id)
        .populate('favoriteEvents', 'title dateTime location category')
        .select('-attendedEvents'); // Skryj attended events pro soukromí
    } else {
      // Hledání podle Clerk ID
      user = await User.findOne({ clerkId: id })
        .populate('favoriteEvents', 'title dateTime location category')
        .select('-attendedEvents');
    }
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      };
      
      res.status(404).json(response);
      return;
    }
    
    console.log(`Found user: ${user.email}`);
    
    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User found'
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting user:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch user'
    };
    
    res.status(500).json(response);
  }
};

// ============= CREATE USER =============
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: CreateUserDTO = req.body;
    console.log('Creating new user:', userData.email);
    
    if (!userData.clerkId || !userData.email) {
      const response: ApiResponse = {
        success: false,
        error: 'Clerk ID and email are required'
      };
      
      res.status(400).json(response);
      return;
    }
    
    // Zkontroluj duplicity podle Clerk ID nebo emailu
    const existingUser = await User.findOne({ 
      $or: [
        { clerkId: userData.clerkId },
        { email: userData.email }
      ]
    });
    
    if (existingUser) {
      console.log(`User already exists: ${userData.email}`);
      
      const response: ApiResponse = {
        success: false,
        error: 'User with this Clerk ID or email already exists'
      };
      
      res.status(409).json(response);
      return;
    }
    
    const user = new User({
      clerkId: userData.clerkId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      avatar: userData.avatar,
      preferences: userData.preferences || {
        favoriteCategories: [],
        favoriteLocations: [],
        notificationsEnabled: true,
        emailNotifications: false
      }
    });
    
    const savedUser = await user.save();
    
    console.log(`User created: ${savedUser.email} (${savedUser._id})`);
    
    const response: ApiResponse = {
      success: true,
      data: savedUser,
      message: 'User created successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating user:', error);
    
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
        error: 'User with this Clerk ID or email already exists'
      };
      
      res.status(409).json(response);
      return;
    }
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create user'
    };
    
    res.status(500).json(response);
  }
};

// ============= UPDATE USER =============
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateUserDTO = req.body;
    
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'User ID is required'
      };
      
      res.status(400).json(response);
      return;
    }
    
    console.log(`Updating user: ${id}`);
    
    // Můžeme aktualizovat podle MongoDB ID nebo Clerk ID
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let user;
    if (isValidObjectId) {
      user = await User.findByIdAndUpdate(id, updateData, { 
        new: true, 
        runValidators: true 
      });
    } else {
      user = await User.findOneAndUpdate(
        { clerkId: id }, 
        updateData, 
        { new: true, runValidators: true }
      );
    }
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      };
      
      res.status(404).json(response);
      return;
    }
    
    console.log(`User updated: ${user.email}`);
    
    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User updated successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating user:', error);
    
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
      error: 'Failed to update user'
    };
    
    res.status(500).json(response);
  }
};

// ============= DELETE USER =============
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'User ID is required'
      };
      
      res.status(400).json(response);
      return;
    }
    
    console.log(`Deleting user: ${id}`);
    
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let user;
    if (isValidObjectId) {
      user = await User.findByIdAndDelete(id);
    } else {
      user = await User.findOneAndDelete({ clerkId: id });
    }
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      };
      
      res.status(404).json(response);
      return;
    }
    
    console.log(`User deleted: ${user.email}`);
    
    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error deleting user:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to delete user'
    };
    
    res.status(500).json(response);
  }
};

// ============= USER FAVORITES =============

// GET /api/v1/users/:id/favorites - Oblíbené události uživatele
export const getUserFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'User ID is required'
      };
      
      res.status(400).json(response);
      return;
    }
    
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let user;
    if (isValidObjectId) {
      user = await User.findById(id).populate({
        path: 'favoriteEvents',
        populate: [
          { path: 'category', select: 'name slug' },
          { path: 'location', select: 'name city' }
        ]
      });
    } else {
      user = await User.findOne({ clerkId: id }).populate({
        path: 'favoriteEvents',
        populate: [
          { path: 'category', select: 'name slug' },
          { path: 'location', select: 'name city' }
        ]
      });
    }
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      };
      
      res.status(404).json(response);
      return;
    }
    
    const response: ApiResponse = {
      success: true,
      data: user.favoriteEvents,
      message: `Found ${user.favoriteEvents.length} favorite events`
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting user favorites:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch user favorites'
    };
    
    res.status(500).json(response);
  }
};