/**
 * Fast Multi-Tenant Restaurant Onboarding Script for OrderRestro / Fudiyo
 *
 * Usage:
 *   node scripts/create-tenant.js "Restaurant Name" "Branch Name" "admin@example.com" "password123" "PREFIX"
 *
 * Can target local Postgres OR remote Supabase by setting DATABASE_URL environment variable.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const STAFF_ROLES = ['OWNER', 'MANAGER', 'CASHIER', 'KITCHEN_STAFF', 'WAITER'];

const DEFAULT_ROLE_PERMISSIONS = {
  OWNER: [
    'orders.view', 'orders.create', 'orders.edit', 'orders.cancel', 'orders.split_bill', 'orders.discount',
    'tables.view', 'tables.manage', 'kds.view', 'kds.manage', 'menu.view', 'menu.manage',
    'inventory.view', 'inventory.manage', 'reports.view', 'settings.manage', 'staff.manage'
  ],
  MANAGER: [
    'orders.view', 'orders.create', 'orders.edit', 'orders.cancel', 'orders.split_bill', 'orders.discount',
    'tables.view', 'tables.manage', 'kds.view', 'kds.manage', 'menu.view', 'menu.manage',
    'inventory.view', 'inventory.manage', 'reports.view', 'staff.manage'
  ],
  CASHIER: [
    'orders.view', 'orders.create', 'orders.edit', 'orders.split_bill', 'tables.view', 'menu.view'
  ],
  KITCHEN_STAFF: ['kds.view', 'kds.manage'],
  WAITER: ['orders.view', 'orders.create', 'tables.view', 'menu.view']
};

async function createTenant() {
  const [,, restaurantName, branchName, email, password, prefix] = process.argv;

  if (!restaurantName || !email || !password) {
    console.error('Usage: node scripts/create-tenant.js "<Restaurant Name>" "<Branch Name>" "<Email>" "<Password>" "[InvoicePrefix]"');
    console.error('Example: node scripts/create-tenant.js "Fudiyo Cafe" "Main Branch" "owner@fudiyo.com" "SecurePass123" "FUD1"');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const bName = branchName || 'Main Branch';
  const invPrefix = (prefix || 'BR1').toUpperCase().trim();

  try {
    console.log(`\n--- Creating New Restaurant: "${restaurantName}" ---`);

    // 1. Check if email already exists
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      throw new Error(`An account with email "${email}" already exists!`);
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 3. Create Restaurant, Branch, Roles, and Admin User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName,
          currency: 'INR',
          timezone: 'Asia/Kolkata',
        },
      });

      // Create Branch with unique invoice prefix
      const branch = await tx.branch.create({
        data: {
          restaurantId: restaurant.id,
          name: bName,
          invoicePrefix: invPrefix,
          country: 'IN',
          taxRegime: 'INDIA_GST',
          taxMode: 'INCLUSIVE',
        },
      });

      // Create Roles
      let ownerRoleId = '';
      for (const roleName of STAFF_ROLES) {
        const role = await tx.role.create({
          data: {
            restaurantId: restaurant.id,
            name: roleName,
            label: roleName.replace(/_/g, ' '),
          },
        });
        if (roleName === 'OWNER') ownerRoleId = role.id;
      }

      // Create Owner User
      const owner = await tx.user.create({
        data: {
          email,
          name: `${restaurantName} Admin`,
          passwordHash,
          restaurantId: restaurant.id,
          roleId: ownerRoleId,
        },
      });

      // Link User to Branch
      await tx.userBranch.create({
        data: {
          userId: owner.id,
          branchId: branch.id,
        },
      });

      return { restaurant, branch, owner };
    });

    console.log('\n======================================================');
    console.log('   RESTAURANT ONBOARDING COMPLETED SUCCESSFULLY!      ');
    console.log('======================================================');
    console.log(`Restaurant ID : ${result.restaurant.id}`);
    console.log(`Restaurant    : ${result.restaurant.name}`);
    console.log(`Branch ID     : ${result.branch.id}`);
    console.log(`Branch Name   : ${result.branch.name}`);
    console.log(`Invoice Prefix: ${result.branch.invoicePrefix}`);
    console.log(`Admin Login   : ${result.owner.email}`);
    console.log('======================================================\n');

  } catch (err) {
    console.error('\n[ERROR] Failed to create tenant:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTenant();
