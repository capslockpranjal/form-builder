import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Form } from '../models/Form';

const router = express.Router();

// Validation middleware
const validateForm = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('fields').isArray().withMessage('Fields must be an array'),
  body('fields.*.type').isIn(['text', 'email', 'select', 'checkbox', 'radio', 'textarea', 'file']).withMessage('Invalid field type'),
  body('fields.*.label').trim().isLength({ min: 1 }).withMessage('Field label is required'),
  body('fields.*.required').isBoolean().withMessage('Required must be a boolean'),
  body('settings').optional().isObject(),
  body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status')
];

// Get all forms
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    const forms = await Form.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-fields');
    
    const total = await Form.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        forms,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch forms' });
  }
});

// Get form by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const form = await Form.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }
    
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch form' });
  }
});

// Create new form
router.post('/', validateForm, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const formData = {
      ...req.body,
      createdBy: req.body.createdBy || 'anonymous'
    };
    
    const form = new Form(formData);
    await form.save();
    
    res.status(201).json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create form' });
  }
});

// Update form
router.put('/:id', validateForm, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }
    
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update form' });
  }
});

// Delete form
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }
    
    res.json({ success: true, message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete form' });
  }
});

// Duplicate form
router.post('/:id/duplicate', async (req: Request, res: Response) => {
  try {
    const originalForm = await Form.findById(req.params.id);
    
    if (!originalForm) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }
    
    const duplicatedForm = new Form({
      ...originalForm.toObject(),
      _id: undefined,
      title: `${originalForm.title} (Copy)`,
      status: 'draft',
      submissions: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await duplicatedForm.save();
    
    res.status(201).json({ success: true, data: duplicatedForm });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to duplicate form' });
  }
});

// Publish form
router.patch('/:id/publish', async (req: Request, res: Response) => {
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'published', 
        publishedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }
    
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to publish form' });
  }
});

// Unpublish form
router.patch('/:id/unpublish', async (req: Request, res: Response) => {
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'draft', 
        publishedAt: undefined,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }
    
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to unpublish form' });
  }
});

export default router;
