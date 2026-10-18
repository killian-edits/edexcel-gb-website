/**
 * Calculator module — public API for the grading engine.
 */

export {
  calculateGrade,
  calculateTarget,
  validateMarks,
  aggregateMarks,
  determineGrade,
} from './engine';

export type { GradingEngineContext } from './engine';

