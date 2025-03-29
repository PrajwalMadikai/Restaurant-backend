import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import cloudinary from '../config/cloudinary';
import pool from '../database/db';


export const fetchAllRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await pool.query('SELECT * FROM restaurants');

        res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        next(error);
    }
};

export const addRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, location, contact } = req.body;

        if (!req.file) {
            res.status(400).json({ success: false, message: 'Image file is required' });
            return
        }

        const imagePath = req.file.path;
        const cloudinaryResponse = await cloudinary.uploader.upload(imagePath);
        const imageUrl = cloudinaryResponse.secure_url;

        const query = `
            INSERT INTO restaurants (name, location, image, contact)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [name, location, imageUrl, contact];
        const result = await pool.query(query, values);

        fs.unlinkSync(imagePath); 

        res.status(201).json({
            success: true,
            message: 'Restaurant added successfully',
            data: result.rows[0],
        });
        return
    } catch (error) {
        next(error);
    }
};

export const updateRestaurant = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;  
        const { name, location, contact } = req.body;

        console.log({ id, name, location, contact });  

        let imageUrl = null;
        if (req.file) {
            const imagePath = req.file.path;
            const cloudinaryResponse = await cloudinary.uploader.upload(imagePath);
            imageUrl = cloudinaryResponse.secure_url;

            fs.unlinkSync(imagePath); 
        }

     
        const fetchQuery = `
            SELECT * FROM restaurants
            WHERE id = $1;
        `;
        const fetchResult = await pool.query(fetchQuery, [id]);

        if (fetchResult.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Restaurant not found' });
            return;
        }

        const existingRestaurant = fetchResult.rows[0];

        const queryFields = [];
        const values = [];

        if (name !== undefined && name !== '') {
            queryFields.push('name = $' + (values.length + 1));
            values.push(name);
        } else {
            queryFields.push('name = $' + (values.length + 1));
            values.push(existingRestaurant.name);  
        }

        if (location !== undefined && location !== '') {
            queryFields.push('location = $' + (values.length + 1));
            values.push(location);
        } else {
            queryFields.push('location = $' + (values.length + 1));
            values.push(existingRestaurant.location);  
        }

        if (contact !== undefined && contact !== '') {
            queryFields.push('contact = $' + (values.length + 1));
            values.push(contact);
        } else {
            queryFields.push('contact = $' + (values.length + 1));
            values.push(existingRestaurant.contact); 
        }

        if (imageUrl) {
            queryFields.push('image = $' + (values.length + 1));
            values.push(imageUrl);
        } else {
            queryFields.push('image = $' + (values.length + 1));
            values.push(existingRestaurant.image);  
        }

        values.push(id); 

        const query = `
            UPDATE restaurants
            SET ${queryFields.join(', ')}
            WHERE id = $${values.length}
            RETURNING *;
        `;

        const result = await pool.query(query, values);

        res.status(200).json({
            success: true,
            message: 'Restaurant updated successfully',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        next(error);
    }
};
 
export const deleteRestaurant = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params; 

        const query = `
            DELETE FROM restaurants
            WHERE id = $1
            RETURNING *;
        `;
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Restaurant not found' });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Restaurant deleted successfully',
            data: result.rows[0],  
        });
    } catch (error) {
        next(error);
    }
};

export default { fetchAllRestaurant, addRestaurant,updateRestaurant,deleteRestaurant};