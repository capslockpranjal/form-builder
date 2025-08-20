import express, { Request, Response } from 'express';
import { Submission } from '../models/Submission';
import { Form } from '../models/Form';
import { createObjectCsvWriter } from 'csv-writer';

const router = express.Router();

// Get overall analytics overview
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get overall statistics
    const totalForms = await Form.countDocuments();
    const publishedForms = await Form.countDocuments({ status: 'published' });
    const totalSubmissions = await Submission.countDocuments();

    // Get top performing forms
    const topForms = await Form.find()
      .sort({ submissions: -1 })
      .limit(5)
      .select('title submissions createdAt');

    // Get recent submissions
    const recentSubmissions = await Submission.find()
      .sort({ 'metadata.submittedAt': -1 })
      .limit(10)
      .populate('formId', 'title')
      .select('formId metadata.submittedAt status');

    // Format recent submissions for frontend
    const formattedRecentSubmissions = recentSubmissions.map(submission => ({
      _id: submission._id,
      formTitle: (submission.formId as any)?.title || 'Unknown Form',
      createdAt: submission.metadata.submittedAt,
      status: submission.status
    }));

    res.json({
      success: true,
      data: {
        totalForms,
        publishedForms,
        totalSubmissions,
        topForms,
        recentSubmissions: formattedRecentSubmissions
      }
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics overview' });
  }
});

// Get form analytics
router.get('/form/:formId', async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const { period = '30d' } = req.query;

    // Check if form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get submissions in date range
    const submissions = await Submission.find({
      formId,
      'metadata.submittedAt': { $gte: startDate }
    });

    // Calculate daily submission counts
    const dailyStats = new Map<string, number>();
    const currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyStats.set(dateKey, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    submissions.forEach(submission => {
      const dateKey = submission.metadata.submittedAt.toISOString().split('T')[0];
      dailyStats.set(dateKey, (dailyStats.get(dateKey) || 0) + 1);
    });

    // Calculate field response statistics
    const fieldStats = new Map<string, { count: number; values: Map<string, number> }>();
    
    form.fields.forEach(field => {
      fieldStats.set(field.id, { count: 0, values: new Map() });
    });

    submissions.forEach(submission => {
      submission.fields.forEach(field => {
        const stats = fieldStats.get(field.fieldId);
        if (stats) {
          stats.count++;
          
          if (field.value) {
            const value = Array.isArray(field.value) ? field.value.join(', ') : field.value;
            stats.values.set(value, (stats.values.get(value) || 0) + 1);
          }
        }
      });
    });

    // Convert field stats to array format
    const fieldStatsArray = Array.from(fieldStats.entries()).map(([fieldId, stats]) => {
      const formField = form.fields.find(f => f.id === fieldId);
      return {
        fieldId,
        label: formField?.label || fieldId,
        type: formField?.type || 'unknown',
        responseCount: stats.count,
        responseRate: form.submissions > 0 ? (stats.count / form.submissions * 100).toFixed(2) : '0',
        topValues: Array.from(stats.values.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([value, count]) => ({ value, count }))
      };
    });

    res.json({
      success: true,
      data: {
        formId,
        title: form.title,
        period,
        totalSubmissions: form.submissions,
        periodSubmissions: submissions.length,
        dailyStats: Array.from(dailyStats.entries()).map(([date, count]) => ({ date, count })),
        fieldStats: fieldStatsArray,
        averageSubmissionsPerDay: (submissions.length / Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))).toFixed(2)
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// Export submissions to CSV
router.get('/form/:formId/export', async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const { format = 'csv' } = req.query;

    // Check if form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    // Get all submissions for the form
    const submissions = await Submission.find({ formId }).sort({ 'metadata.submittedAt': -1 });

    if (format === 'csv') {
      // Prepare CSV data
      const csvData = submissions.map((submission: any) => {
        const row: any = {
          'Submission ID': submission._id.toString(),
          'Submitted At': submission.metadata.submittedAt.toISOString(),
          'IP Address': submission.metadata.ipAddress || '',
          'User Agent': submission.metadata.userAgent || '',
          'Status': submission.status
        };

        // Add field values
        submission.fields.forEach((field: any) => {
          const formField = form.fields.find(f => f.id === field.fieldId);
          const label = formField?.label || field.fieldId;
          row[label] = Array.isArray(field.value) ? field.value.join(', ') : field.value;
        });

        return row;
      });

      // Set response headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${form.title}-submissions-${new Date().toISOString().split('T')[0]}.csv"`);

      // Create CSV content
      if (csvData.length > 0) {
        const headers = Object.keys(csvData[0]);
        const csvContent = [
          headers.join(','),
          ...csvData.map(row => 
            headers.map(header => {
              const value = row[header] || '';
              // Escape commas and quotes in CSV
              return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
          )
        ].join('\n');

        res.send(csvContent);
      } else {
        res.send('No submissions found');
      }
    } else {
      res.status(400).json({ success: false, error: 'Unsupported export format' });
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, error: 'Failed to export data' });
  }
});

// Get overall analytics dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get overall statistics
    const totalForms = await Form.countDocuments();
    const publishedForms = await Form.countDocuments({ status: 'published' });
    const totalSubmissions = await Submission.countDocuments();
    const periodSubmissions = await Submission.countDocuments({
      'metadata.submittedAt': { $gte: startDate }
    });

    // Get top performing forms
    const topForms = await Form.find()
      .sort({ submissions: -1 })
      .limit(5)
      .select('title submissions createdAt');

    // Get recent activity
    const recentSubmissions = await Submission.find()
      .sort({ 'metadata.submittedAt': -1 })
      .limit(10)
      .populate('formId', 'title')
      .select('formId metadata.submittedAt status');

    res.json({
      success: true,
      data: {
        period,
        overview: {
          totalForms,
          publishedForms,
          totalSubmissions,
          periodSubmissions,
          averageSubmissionsPerForm: totalForms > 0 ? (totalSubmissions / totalForms).toFixed(2) : '0'
        },
        topForms,
        recentActivity: recentSubmissions
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard analytics' });
  }
});

export default router;
