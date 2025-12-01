import { PreferenceLabel } from '../types/models';

/**
 * Storage service stub for persisting labels.
 * 
 * In production, this would:
 * 1. Store labels in PostgreSQL or similar database
 * 2. Index for efficient querying
 * 3. Support analytics queries (aggregations, etc.)
 * 
 * Example PostgreSQL schema:
 * 
 * CREATE TABLE labels (
 *   id SERIAL PRIMARY KEY,
 *   task_id VARCHAR(255) NOT NULL,
 *   rater_id VARCHAR(255) NOT NULL,
 *   preferred_candidate_id VARCHAR(255) NOT NULL,
 *   scores JSONB NOT NULL,
 *   notes TEXT,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   
 *   INDEX idx_task_id (task_id),
 *   INDEX idx_rater_id (rater_id),
 *   INDEX idx_created_at (created_at)
 * );
 * 
 * Example with pg library:
 * 
 * import { Pool } from 'pg';
 * 
 * const pool = new Pool({
 *   connectionString: process.env.DATABASE_URL
 * });
 * 
 * export async function saveLabel(label: PreferenceLabel): Promise<string> {
 *   const result = await pool.query(
 *     `INSERT INTO labels (task_id, rater_id, preferred_candidate_id, scores, notes)
 *      VALUES ($1, $2, $3, $4, $5)
 *      RETURNING id`,
 *     [
 *       label.task_id,
 *       label.rater_id,
 *       label.preferred_candidate_id,
 *       JSON.stringify(label.scoresByCandidate),
 *       label.notes || null
 *     ]
 *   );
 *   
 *   return result.rows[0].id;
 * }
 * 
 * export async function getLabelsForTask(taskId: string): Promise<PreferenceLabel[]> {
 *   const result = await pool.query(
 *     `SELECT * FROM labels WHERE task_id = $1 ORDER BY created_at DESC`,
 *     [taskId]
 *   );
 *   
 *   return result.rows.map(row => ({
 *     rater_id: row.rater_id,
 *     preferred_candidate_id: row.preferred_candidate_id,
 *     scoresByCandidate: row.scores,
 *     notes: row.notes
 *   }));
 * }
 */

// In-memory storage for demo purposes
const labels: PreferenceLabel[] = [];

export async function saveLabel(label: PreferenceLabel): Promise<string> {
  console.log('[Storage] Saving label:', label);
  
  // In production, insert into database
  labels.push(label);
  
  const labelId = `label-${Date.now()}`;
  console.log(`[Storage] Label saved with ID: ${labelId}`);
  
  return labelId;
}

export async function getLabelsForTask(taskId: string): Promise<PreferenceLabel[]> {
  console.log(`[Storage] Fetching labels for task: ${taskId}`);
  
  // In production, query database
  return labels;
}

export async function getLabelStats(taskId: string): Promise<{
  total: number;
  byCandidate: Record<string, number>;
}> {
  console.log(`[Storage] Computing stats for task: ${taskId}`);
  
  // In production, run aggregation query
  const stats = {
    total: labels.length,
    byCandidate: {} as Record<string, number>
  };
  
  for (const label of labels) {
    const candidateId = label.preferred_candidate_id;
    stats.byCandidate[candidateId] = (stats.byCandidate[candidateId] || 0) + 1;
  }
  
  return stats;
}
