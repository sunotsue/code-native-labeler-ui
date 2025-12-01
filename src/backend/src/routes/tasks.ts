import { Router } from 'express';
import { TASKS } from '../data/mockTasks';

export const taskRoutes = Router();

/**
 * GET /api/task/:id
 * 
 * Retrieves a task by ID. In production, this would:
 * 1. Query database for task metadata
 * 2. Fetch repo snapshot from git at specified commit
 * 3. Load candidate patches from storage
 * 4. Return complete task object
 */
taskRoutes.get('/task/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // For now, just return from in-memory storage
    const task = TASKS[id];
    
    if (!task) {
      return res.status(404).json({ error: `Task ${id} not found` });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/tasks
 * 
 * Lists all available tasks (for admin/selection UI)
 */
taskRoutes.get('/tasks', async (req, res) => {
  try {
    const taskList = Object.values(TASKS).map(task => ({
      id: task.id,
      capability_bucket: task.capability_bucket,
      tags: task.tags,
      repo: task.repo,
      candidate_count: task.candidates.length
    }));
    
    res.json({ tasks: taskList });
  } catch (error) {
    console.error('Error listing tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
