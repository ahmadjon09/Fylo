export const ROLES = {
  ADMIN: 'admin',
  WORKER: 'worker',
};

export const PERMISSIONS = {
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_READ: 'products:read',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',
  SALES_CREATE: 'sales:create',
  SALES_READ: 'sales:read',
  USERS_READ: 'users:read',
  USERS_MANAGE: 'users:manage',
  DASHBOARD_READ: 'dashboard:read',
  EXPORT_DATA: 'export:data',
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.WORKER]: [
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_READ,
  ],
};
