import { Request, Response } from 'express';
import { Location } from '@/models/Location';
import { ApiResponse, CreateLocationDTO } from '@/types';

// ============= GET ALL LOCATIONS =============
export const getLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Getting all locations...');
    
    const locations = await Location.find({})
      .sort({ city: 1, name: 1 })
      .select('name address city region venue coordinates createdAt');
    
    console.log(`Found ${locations.length} locations`);
    
    const response: ApiResponse = {
      success: true,
      data: locations,
      message: `Found ${locations.length} locations`
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting locations:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch locations'
    };
    
    res.status(500).json(response);
  }
};

// ============= GET SINGLE LOCATION =============
export const getLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Location ID is required'
      };
      
      res.status(400).json(response);
      return;
    }
    
    console.log(`Getting location with ID: ${id}`);
    
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let query;
    if (isValidObjectId) {
      query = { _id: id };
    } else {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid location ID format'
      };
      
      res.status(400).json(response);
      return;
    }
    
    const location = await Location.findOne(query);
    
    if (!location) {
      const response: ApiResponse = {
        success: false,
        error: 'Location not found'
      };
      
      res.status(404).json(response);
      return;
    }
    
    console.log(`Found location: ${location.name}`);
    
    const response: ApiResponse = {
      success: true,
      data: location,
      message: 'Location found'
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting location:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch location'
    };
    
    res.status(500).json(response);
  }
};

// ============= CREATE LOCATION =============
export const createLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const locationData: CreateLocationDTO = req.body;
    console.log('Creating new location:', locationData.name);
    
    if (!locationData.name || !locationData.address || !locationData.city || !locationData.region) {
      const response: ApiResponse = {
        success: false,
        error: 'Name, address, city and region are required'
      };
      
      res.status(400).json(response);
      return;
    }
    
    // Zkontroluj duplicitu podle názvu a adresy
    const existingLocation = await Location.findOne({ 
      name: locationData.name,
      address: locationData.address
    });
    
    if (existingLocation) {
      console.log(`Location already exists: ${locationData.name} at ${locationData.address}`);
      
      const response: ApiResponse = {
        success: false,
        error: 'Location with this name and address already exists'
      };
      
      res.status(409).json(response);
      return;
    }
    
    const location = new Location({
      name: locationData.name,
      address: locationData.address,
      city: locationData.city,
      region: locationData.region,
      postalCode: locationData.postalCode,
      country: locationData.country || 'ČR',
      coordinates: locationData.coordinates,
      venue: locationData.venue
    });
    
    const savedLocation = await location.save();
    
    console.log(`Location created: ${savedLocation.name} (${savedLocation._id})`);
    
    const response: ApiResponse = {
      success: true,
      data: savedLocation,
      message: 'Location created successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating location:', error);
    
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
      error: 'Failed to create location'
    };
    
    res.status(500).json(response);
  }
};

// ============= UPDATE LOCATION =============
export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Location ID is required'
      };
      
      res.status(400).json(response);
      return;
    }
    
    console.log(`Updating location: ${id}`);
    
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    if (!isValidObjectId) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid location ID format'
      };
      
      res.status(400).json(response);
      return;
    }
    
    const location = await Location.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!location) {
      const response: ApiResponse = {
        success: false,
        error: 'Location not found'
      };
      
      res.status(404).json(response);
      return;
    }
    
    console.log(`Location updated: ${location.name}`);
    
    const response: ApiResponse = {
      success: true,
      data: location,
      message: 'Location updated successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating location:', error);
    
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
      error: 'Failed to update location'
    };
    
    res.status(500).json(response);
  }
};

// ============= DELETE LOCATION =============
export const deleteLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Location ID is required'
      };
      
      res.status(400).json(response);
      return;
    }
    
    console.log(`Deleting location: ${id}`);
    
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    if (!isValidObjectId) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid location ID format'
      };
      
      res.status(400).json(response);
      return;
    }
    
    const location = await Location.findByIdAndDelete(id);
    
    if (!location) {
      const response: ApiResponse = {
        success: false,
        error: 'Location not found'
      };
      
      res.status(404).json(response);
      return;
    }
    
    console.log(`Location deleted: ${location.name}`);
    
    const response: ApiResponse = {
      success: true,
      message: 'Location deleted successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error deleting location:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to delete location'
    };
    
    res.status(500).json(response);
  }
};