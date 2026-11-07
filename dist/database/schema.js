"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableDefinitions = void 0;
exports.initializeSchema = initializeSchema;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const DEFAULT_ADMIN_EMAIL = env_1.env.DEFAULT_ADMIN_EMAIL;
const DEFAULT_ADMIN_PASSWORD = env_1.env.DEFAULT_ADMIN_PASSWORD;
exports.tableDefinitions = [
    `
    CREATE TABLE IF NOT EXISTS modules (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      code VARCHAR(80) NOT NULL UNIQUE,
      description VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
    `
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `,
    `
    CREATE TABLE IF NOT EXISTS roles (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(80) NOT NULL UNIQUE,
      description VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
    `
    CREATE TABLE IF NOT EXISTS permissions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      module_id INT NULL,
      name VARCHAR(80) NOT NULL UNIQUE,
      description VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_permissions_module
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL
    )
  `,
    `
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id INT NOT NULL,
      role_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, role_id),
      CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    )
  `,
    `
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INT NOT NULL,
      permission_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (role_id, permission_id),
      CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    )
  `,
    `
    CREATE TABLE IF NOT EXISTS sessions (
      id CHAR(36) PRIMARY KEY,
      user_id INT NOT NULL,
      refresh_token_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,
    `
    CREATE TABLE IF NOT EXISTS knowledge_categories (
      id INT PRIMARY KEY AUTO_INCREMENT,
      slug VARCHAR(120) NOT NULL UNIQUE,
      name VARCHAR(120) NOT NULL,
      description TEXT NULL,
      color VARCHAR(32) NULL,
      image_url VARCHAR(255) NULL,
      created_by INT NULL,
      updated_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_knowledge_categories_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT fk_knowledge_categories_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `,
    `
    CREATE TABLE IF NOT EXISTS knowledge_articles (
      id INT PRIMARY KEY AUTO_INCREMENT,
      slug VARCHAR(150) NOT NULL UNIQUE,
      title VARCHAR(220) NOT NULL,
      subtitle VARCHAR(240) NULL,
      excerpt TEXT NULL,
      content LONGTEXT NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'draft',
      featured TINYINT(1) NOT NULL DEFAULT 0,
      category_id INT NULL,
      author_id INT NULL,
      author_name VARCHAR(160) NULL,
      cover_image_url VARCHAR(255) NULL,
      read_time INT NULL,
      seo_title VARCHAR(220) NULL,
      seo_description TEXT NULL,
      published_at DATETIME NULL,
      created_by INT NULL,
      updated_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_knowledge_articles_category
        FOREIGN KEY (category_id) REFERENCES knowledge_categories(id) ON DELETE SET NULL,
      CONSTRAINT fk_knowledge_articles_author
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT fk_knowledge_articles_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT fk_knowledge_articles_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `,
    `
    CREATE TABLE IF NOT EXISTS knowledge_events (
      id INT PRIMARY KEY AUTO_INCREMENT,
      slug VARCHAR(150) NOT NULL UNIQUE,
      title VARCHAR(220) NOT NULL,
      summary TEXT NULL,
      description TEXT NULL,
      event_date DATETIME NULL,
      location VARCHAR(180) NULL,
      is_virtual TINYINT(1) NOT NULL DEFAULT 0,
      status VARCHAR(40) NOT NULL DEFAULT 'upcoming',
      cover_image_url VARCHAR(255) NULL,
      created_by INT NULL,
      updated_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_knowledge_events_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT fk_knowledge_events_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `,
    `
    CREATE TABLE IF NOT EXISTS knowledge_calls (
      id INT PRIMARY KEY AUTO_INCREMENT,
      slug VARCHAR(150) NOT NULL UNIQUE,
      title VARCHAR(220) NOT NULL,
      summary TEXT NULL,
      description TEXT NULL,
      start_date DATETIME NULL,
      end_date DATETIME NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'active',
      organization VARCHAR(180) NULL,
      created_by INT NULL,
      updated_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_knowledge_calls_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT fk_knowledge_calls_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `,
    `
    CREATE TABLE IF NOT EXISTS knowledge_resources (
      id INT PRIMARY KEY AUTO_INCREMENT,
      slug VARCHAR(150) NOT NULL UNIQUE,
      title VARCHAR(220) NOT NULL,
      summary TEXT NULL,
      type VARCHAR(80) NOT NULL DEFAULT 'guide',
      file_url VARCHAR(255) NULL,
      external_url VARCHAR(255) NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'active',
      created_by INT NULL,
      updated_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_knowledge_resources_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT fk_knowledge_resources_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `,
    `
    CREATE TABLE IF NOT EXISTS knowledge_media (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(220) NOT NULL,
      type VARCHAR(80) NOT NULL DEFAULT 'image',
      url VARCHAR(255) NULL,
      thumbnail VARCHAR(255) NULL,
      description TEXT NULL,
      created_by INT NULL,
      updated_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_knowledge_media_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT fk_knowledge_media_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `,
];
async function seedRolesAndPermissions() {
    const modules = [
        {
            name: "Dashboard",
            code: "dashboard",
            description: "Módulo principal del dashboard",
        },
        { name: "Usuarios", code: "users", description: "Gestión de usuarios" },
        { name: "Roles", code: "roles", description: "Administración de roles" },
        {
            name: "Marketing",
            code: "marketing",
            description: "Campañas y contenidos",
        },
        {
            name: "Finanzas",
            code: "finance",
            description: "Operaciones financieras",
        },
        {
            name: "Conocimiento",
            code: "knowledge",
            description: "Contenido editorial y recursos de conocimiento empresarial",
        },
    ];
    const roles = [
        { name: "super_admin", description: "Super administrador del sistema" },
        { name: "admin", description: "Administrador general" },
        {
            name: "editor",
            description: "Editor de contenido y conocimiento empresarial",
        },
        { name: "marketing", description: "Equipo de marketing" },
        { name: "comercial", description: "Equipo comercial" },
        { name: "contabilidad", description: "Equipo de finanzas" },
    ];
    const permissions = [
        {
            name: "dashboard.view",
            moduleCode: "dashboard",
            description: "Ver el dashboard principal",
        },
        {
            name: "dashboard.metrics",
            moduleCode: "dashboard",
            description: "Ver métricas del dashboard",
        },
        { name: "users.read", moduleCode: "users", description: "Leer usuarios" },
        {
            name: "users.create",
            moduleCode: "users",
            description: "Crear usuarios",
        },
        { name: "users.edit", moduleCode: "users", description: "Editar usuarios" },
        {
            name: "users.delete",
            moduleCode: "users",
            description: "Eliminar usuarios",
        },
        {
            name: "roles.view",
            moduleCode: "roles",
            description: "Ver roles y permisos",
        },
        {
            name: "roles.manage",
            moduleCode: "roles",
            description: "Administrar roles",
        },
        {
            name: "permissions.manage",
            moduleCode: "roles",
            description: "Administrar permisos",
        },
        {
            name: "marketing.view",
            moduleCode: "marketing",
            description: "Ver campañas y marketing",
        },
        {
            name: "marketing.create",
            moduleCode: "marketing",
            description: "Crear campañas de marketing",
        },
        {
            name: "marketing.edit",
            moduleCode: "marketing",
            description: "Editar campañas de marketing",
        },
        {
            name: "knowledge.dashboard.view",
            moduleCode: "knowledge",
            description: "Ver dashboard del módulo de conocimiento",
        },
        {
            name: "knowledge.articles.view",
            moduleCode: "knowledge",
            description: "Ver artículos del conocimiento",
        },
        {
            name: "knowledge.articles.create",
            moduleCode: "knowledge",
            description: "Crear artículos de conocimiento",
        },
        {
            name: "knowledge.articles.edit",
            moduleCode: "knowledge",
            description: "Editar artículos de conocimiento",
        },
        {
            name: "knowledge.articles.publish",
            moduleCode: "knowledge",
            description: "Publicar artículos",
        },
        {
            name: "knowledge.categories.manage",
            moduleCode: "knowledge",
            description: "Gestionar categorías del conocimiento",
        },
        {
            name: "knowledge.events.manage",
            moduleCode: "knowledge",
            description: "Gestionar eventos del conocimiento",
        },
        {
            name: "knowledge.resources.manage",
            moduleCode: "knowledge",
            description: "Gestionar recursos del conocimiento",
        },
        {
            name: "knowledge.media.manage",
            moduleCode: "knowledge",
            description: "Gestionar multimedia del módulo",
        },
    ];
    const rolePermissions = {
        super_admin: permissions.map((permission) => permission.name),
        admin: permissions.map((permission) => permission.name),
        editor: [
            "dashboard.view",
            "dashboard.metrics",
            "knowledge.dashboard.view",
            "knowledge.articles.view",
            "knowledge.articles.create",
            "knowledge.articles.edit",
            "knowledge.articles.publish",
            "knowledge.categories.manage",
            "knowledge.events.manage",
            "knowledge.resources.manage",
            "knowledge.media.manage",
        ],
        marketing: [
            "dashboard.view",
            "dashboard.metrics",
            "marketing.view",
            "marketing.create",
            "marketing.edit",
        ],
        comercial: [
            "dashboard.view",
            "customers.view",
            "customers.create",
            "customers.edit",
        ],
        contabilidad: [
            "dashboard.view",
            "dashboard.metrics",
            "finance.view",
            "finance.edit",
        ],
    };
    const connection = await database_1.pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(`
        INSERT INTO modules (name, code, description)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          description = VALUES(description)
      `, [modules.map(({ name, code, description }) => [name, code, description])]);
        await connection.query(`
        INSERT INTO roles (name, description)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          description = VALUES(description)
      `, [roles.map(({ name, description }) => [name, description])]);
        const [moduleRows] = (await connection.query("SELECT id, code FROM modules"));
        const moduleMap = new Map(moduleRows.map((module) => [module.code, module.id]));
        await connection.query(`
        INSERT INTO permissions (module_id, name, description)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          description = VALUES(description),
          module_id = VALUES(module_id)
      `, [
            permissions.map((permission) => [
                moduleMap.get(permission.moduleCode) ?? null,
                permission.name,
                permission.description,
            ]),
        ]);
        const [roleRows] = (await connection.query("SELECT id, name FROM roles"));
        const [permissionRows] = (await connection.query("SELECT id, name FROM permissions"));
        const roleMap = new Map(roleRows.map((role) => [role.name, role.id]));
        const permissionMap = new Map(permissionRows.map((permission) => [permission.name, permission.id]));
        const rolePermissionValues = [];
        for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
            const roleId = roleMap.get(roleName);
            if (!roleId)
                continue;
            for (const permissionName of permissionNames) {
                const permissionId = permissionMap.get(permissionName);
                if (!permissionId)
                    continue;
                rolePermissionValues.push([roleId, permissionId]);
            }
        }
        if (rolePermissionValues.length > 0) {
            await connection.query(`
          INSERT IGNORE INTO role_permissions (role_id, permission_id)
          VALUES ?
        `, [rolePermissionValues]);
        }
        await connection.commit();
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
async function seedSuperAdminUser() {
    if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) {
        throw new Error("DEFAULT_ADMIN_EMAIL y DEFAULT_ADMIN_PASSWORD deben estar configurados en las variables de entorno.");
    }
    if (DEFAULT_ADMIN_PASSWORD.length < 12) {
        throw new Error("La contraseña inicial del administrador debe tener al menos 12 caracteres.");
    }
    const connection = await database_1.pool.getConnection();
    try {
        await connection.beginTransaction();
        const [existingResult] = await connection.query("SELECT id FROM users WHERE email = ? LIMIT 1 FOR UPDATE", [DEFAULT_ADMIN_EMAIL]);
        const existing = existingResult;
        let userId;
        if (existing.length > 0) {
            userId = existing[0].id;
        }
        else {
            const passwordHash = await bcryptjs_1.default.hash(DEFAULT_ADMIN_PASSWORD, 12);
            const [result] = (await connection.query(`
          INSERT INTO users (name, email, password_hash, is_active)
          VALUES (?, ?, ?, 1)
        `, ["Super Admin", DEFAULT_ADMIN_EMAIL, passwordHash]));
            userId = result.insertId;
        }
        const [rolesResult] = await connection.query("SELECT id FROM roles WHERE name = ? LIMIT 1", ["super_admin"]);
        const roles = rolesResult;
        if (roles.length === 0) {
            throw new Error("No se encontró el rol super_admin.");
        }
        await connection.query("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)", [userId, roles[0].id]);
        await connection.commit();
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
async function ensurePermissionModuleColumn() {
    const [columns] = (await database_1.pool.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'permissions'
        AND COLUMN_NAME = 'module_id'
      LIMIT 1
    `));
    if (columns.length === 0) {
        await database_1.pool.query("ALTER TABLE permissions ADD COLUMN module_id INT NULL");
    }
    const [constraints] = (await database_1.pool.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'permissions'
        AND CONSTRAINT_NAME = 'fk_permissions_module'
      LIMIT 1
    `));
    if (constraints.length === 0) {
        await database_1.pool.query(`
        ALTER TABLE permissions
        ADD CONSTRAINT fk_permissions_module
        FOREIGN KEY (module_id)
        REFERENCES modules(id)
        ON DELETE SET NULL
      `);
    }
}
async function executeTableDefinitions() {
    await exports.tableDefinitions.reduce(async (previousQuery, statement) => {
        await previousQuery;
        await database_1.pool.query(statement);
    }, Promise.resolve());
}
async function initializeSchema() {
    await executeTableDefinitions();
    await ensurePermissionModuleColumn();
    await seedRolesAndPermissions();
    await seedSuperAdminUser();
    console.log("Esquema inicial verificado.");
    console.log(`Usuario administrador verificado: ${DEFAULT_ADMIN_EMAIL}`);
}
