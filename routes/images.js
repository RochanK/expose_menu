const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Image = require('../models/Image');

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware to check if user is admin (owner)
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// Upload a new image (admin only)
router.post('/upload', isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newImage = new Image({
      name: req.body.name,
      filename: req.file.filename,
      uploadedBy: req.user._id
    });

    await newImage.save();
    res.status(201).json({ message: 'Image uploaded successfully', image: newImage });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// Search for images
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const images = await Image.find({ name: { $regex: query, $options: 'i' } });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error searching images', error: error.message });
  }
});

// Get all images
router.get('/', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching images', error: error.message });
  }
});

// Delete an image (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete file from storage
    fs.unlink(path.join('public/uploads/', image.filename), async (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
      
      // Delete image from database
      await Image.findByIdAndDelete(req.params.id);
      res.json({ message: 'Image deleted successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
});

module.exports = router;
