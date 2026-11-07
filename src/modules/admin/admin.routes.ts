import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminMiddleware } from '../../middlewares/admin.middleware';
import {
  assignUserRolesController,
  createAdminModuleController,
  createAdminPermissionController,
  createAdminRoleController,
  createAdminUserController,
  listAdminModulesController,
  listAdminRolesController,
  listAdminUsersController,
  listPermissionsController,
  listRolePermissionsController,
  updateRolePermissionsController,
  updateUserStatusController,
} from './admin.controller';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', listAdminUsersController);
router.get('/roles', listAdminRolesController);
router.get('/roles/:roleName/permissions', listRolePermissionsController);
router.get('/modules', listAdminModulesController);
router.get('/permissions', listPermissionsController);
router.post('/users', createAdminUserController);
router.post('/roles', createAdminRoleController);
router.post('/modules', createAdminModuleController);
router.post('/permissions', createAdminPermissionController);
router.patch('/roles/:roleName/permissions', updateRolePermissionsController);
router.patch('/users/:userId/status', updateUserStatusController);
router.patch('/users/:userId/roles', assignUserRolesController);

export default router;
