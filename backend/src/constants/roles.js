export const ROLES = {
  SUPER_ADMIN: 'super_admin',
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
  AUDIT_READ: 'audit:read',
  SYSTEM_MANAGE: 'system:manage',
  MESSAGES_READ: 'messages:read',
  MESSAGES_SEND: 'messages:send',
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: Object.values(PERMISSIONS).filter(p => ![PERMISSIONS.AUDIT_READ, PERMISSIONS.SYSTEM_MANAGE].includes(p)),
  [ROLES.WORKER]: [
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_READ,
    PERMISSIONS.MESSAGES_READ,
    PERMISSIONS.MESSAGES_SEND,
  ],
};
