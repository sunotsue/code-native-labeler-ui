import { Router } from 'express';
import { PreferenceLabel } from '../types/models';
import { saveLabel } from '../services/storage';

export const labelRoutes = Router();

/**
 * POST /api/label
 * 
 * Submits a preference label from a rater. In production, this would:
 * 1. Validate the label data
 * 2. Store in database (PostgreSQL, etc.)
 * 3. Update metrics/analytics
 * 4. Potentially trigger model retraining pipeline
 * 
 * Request body:
 * {
 *   "rater_id": "rater-123",
 *   "preferred_candidate_id": "candidate-a" | "tie",
 *   "scoresByCandidate": {
 *     "candidate-a": { "correctness": 5, "minimality": 4, ... },
 *     "candidate-b": { "correctness": 3, "minimality": 5, ... }
 *   },
 *   "notes": "Optional reasoning..."
 * }
 */
labelRoutes.post('/label', async (req, res) => {
  try {
    const label: PreferenceLabel = req.body;
    
    // Validation
    if (!label.rater_id) {
      return res.status(400).json({ error: 'Missing rater_id' });
    }
    
    if (!label.preferred_candidate_id) {
      return res.status(400).json({ error: 'Missing preferred_candidate_id' });
    }
    
    if (!label.scoresByCandidate || Object.keys(label.scoresByCandidate).length === 0) {
      return res.status(400).json({ error: 'Missing scoresByCandidate' });
    }
    
    // Validate score ranges (0-5)
    for (const [candidateId, scores] of Object.entries(label.scoresByCandidate)) {
      const scoreValues = Object.values(scores).filter(v => v !== undefined) as number[];
      
      for (const score of scoreValues) {
        if (typeof score !== 'number' || score < 0 || score > 5) {
          return res.status(400).json({
            error: `Invalid score ${score} for candidate ${candidateId}. Must be 0-5.`
          });
        }
      }
    }
    
    console.log('Received label:', JSON.stringify(label, null, 2));
    
    // Save label (currently just logs to console)
    await saveLabel(label);
    
    res.json({
      success: true,
      message: 'Label saved successfully',
      labelId: `label-${Date.now()}`
    });
  } catch (error) {
    console.error('Error saving label:', error);
    res.status(500).json({ error: 'Failed to save label' });
  }
});

/**
 * GET /api/labels/:taskId
 * 
 * Retrieves all labels for a specific task (for analysis/review)
 */
labelRoutes.get('/labels/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // In production, query database for labels
    // For now, return empty array
    res.json({ labels: [] });
  } catch (error) {
    console.error('Error fetching labels:', error);
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});
