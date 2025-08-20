import express from 'express';
import auth from '../middleware/auth.js';
import { 
  createRule, 
  getRules, 
  getRuleById, 
  updateRule, 
  deleteRule, 
  toggleRuleStatus,
  getApplicableRules
} from '../controller/ruleController.js';

const router = express.Router();

// All rule routes require authentication
router.use(auth);

// Rule management
router.get('/', getRules);
router.get('/applicable', getApplicableRules);
router.get('/:id', getRuleById);
router.post('/', createRule);
router.put('/:id', updateRule);
router.delete('/:id', deleteRule);
router.put('/:id/toggle', toggleRuleStatus);

export default router;











