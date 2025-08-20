import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Submission } from '../models/Submission';
import { Form } from '../models/Form';
import { submissionRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Validation middleware
const validateSubmission = [
  body('formId').isMongoId().withMessage('Valid form ID is required'),
  body('fields').isArray().withMessage('Fields must be an array'),
  body('fields.*.fieldId').notEmpty().withMessage('Field ID is required'),
  body('fields.*.value').notEmpty().withMessage('Field value is required')
];

// Create new submission
router.post('/', submissionRateLimiter, validateSubmission, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { formId, fields } = req.body;

    // Check if form exists and is published
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    if (form.status !== 'published') {
      return res.status(400).json({ success: false, error: 'Form is not published' });
    }

    // Create submission
    const submission = new Submission({
      formId,
      fields,
      metadata: {
        submittedAt: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }
    });

    await submission.save();

    // Update form submission count
    await Form.findByIdAndUpdate(formId, { $inc: { submissions: 1 } });

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    console.error('Submission creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create submission' });
  }
});

// Get submissions by form ID
router.get('/form/:formId', async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const { page = 1, limit = 20, sort = '-metadata.submittedAt' } = req.query;

    // Check if form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const submissions = await Submission.find({ formId })
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit))
      .populate('formId', 'title');

    const total = await Submission.countDocuments({ formId });

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Fetch submissions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
  }
});

// Get submission by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('formId', 'title fields');

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    res.json({ success: true, data: submission });
  } catch (error) {
    console.error('Fetch submission error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch submission' });
  }
});

// Delete submission
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    // Update form submission count
    await Form.findByIdAndUpdate(submission.formId, { $inc: { submissions: -1 } });

    res.json({ success: true, message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete submission' });
  }
});

export default router;
