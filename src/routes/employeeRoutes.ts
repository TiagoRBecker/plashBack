// routes/employeeRoutes.js
import { Router } from 'express';
import { chekingTokenAdmin } from '../Middleware';
import AdminEmployeeController from '../Controllers/Employee';
import { GCLOUD ,upload} from '../utils/multerConfig';

const router = Router();

// Employee management routes
router.post('/create', chekingTokenAdmin, upload.single('profile'), AdminEmployeeController.createEmployee);
router.post('/update/:slug', chekingTokenAdmin, GCLOUD.single('newProfile'), AdminEmployeeController.editEmployee);
router.delete('/delete', chekingTokenAdmin, AdminEmployeeController.deletEmployee);
router.get('/all', chekingTokenAdmin, AdminEmployeeController.getAllEmployees);
router.get('/:slug', chekingTokenAdmin, AdminEmployeeController.getOneEmployee);

export default router;
