const logger = require('../config/logger');
const { Role } = require('../models/role.model');
const { Permission } = require('../models/permission.model');
const { User } = require('../models/user.model');
const { Variable } = require('../models/variable.model');
const { MessageTemplate } = require('../models/message_template.model');
const { Country } = require('../models/country.model');
const { createMessageTemplate } = require('../services/message_template.service');
const { createUser } = require('../services/user.service');
const { countries } = require('./constants');

const setAdminPermissions = async () => {
  const adminRole = await Role.findOne({ where: { name: 'admin' } });
  const adminPermissions = await Permission.findAll();
  await adminRole.setPermissions(adminPermissions);
};

const setUserPermissions = async () => {
  const studentRole = await Role.findOne({ where: { name: 'user' } });
  const permissionsValue = ['users.view', 'users.manage'];
  const userPermissions = await Permission.findAll({ where: { value: permissionsValue } });
  await studentRole.setPermissions(userPermissions);
};

const createRoles = async () => {
  // create roles
  const roles = [
    {
      name: 'admin',
      description: 'system admin with access to all features',
    },
    {
      name: 'user',
      description: 'system user with access to all features',
    },
  ];

  //   get existing roles
  const allRoles = await Role.findAll();

  //   if role is empty bulk create roles
  if (allRoles.length === 0 || allRoles.length !== roles.length) {
    // filter for roles that do not exist
    const filteredRoles = roles.filter((role) => !allRoles.find((r) => r.dataValues.name === role.name));
    await Role.bulkCreate(filteredRoles);
    logger.info('roles created'.rainbow);
  }
};

const createVariables = async () => {
  // create variables
  const variables = [
    {
      name: 'lastName',
    },
    {
      name: 'firstName',
    },
    {
      name: 'token',
    },
    {
      name: 'code',
    },
  ];

  //   get existing variables
  const allVariables = await Variable.findAll();

  //   if variables is empty bulk create variables
  if (allVariables.length === 0 || allVariables.length !== variables.length) {
    // filter for variables that do not exist
    const filteredVariables = variables.filter((variable) => !allVariables.find((v) => v.dataValues.name === variable.name));
    await Variable.bulkCreate(filteredVariables);
    logger.info('variables created'.rainbow);
  }
};

const createMessageTemplates = async () => {
  const MessageTemplates = [
    {
      messageTemplate: {
        title: 'Welcome_Email',
        description: 'Welcome email to new users',
        emailSubject: 'Welcome to the platform',
        emailBody: 'Hello {{firstName}}, welcome to the platform',
        smsSubject: 'Welcome to the platform',
        smsBody: 'Hello {{firstName}}, welcome to the platform',
        type: 'admin',
      },
      variables: [
        {
          name: 'firstName',
        },
      ],
    },
    {
      messageTemplate: {
        title: 'Reset_Password',
        description: 'Reset password message',
        emailSubject: 'Reset Password',
        emailBody:
          'Dear {{firstName}}, To reset your password, click on this link: http://localhost:3000/reset-password?token={{token}} If you did not request any password resets, then ignore this email.',
        smsSubject: 'Reset Password',
        smsBody:
          'Dear {{firstName}}, To reset your password, click on this link: http://localhost:3000/reset-password?token={{token}} If you did not request any password resets, then ignore this email.',
        type: 'admin',
      },
      variables: [
        {
          name: 'firstName',
        },
        {
          name: 'token',
        },
      ],
    },
    {
      messageTemplate: {
        title: 'Test_Invitation',
        description: 'Test invitation message',
        emailSubject: 'Test Invitation',
        emailBody:
          'Dear {{firstName}}, You have been invited to take a test. Your password is "password1". Click on this link to take the test: http://localhost:3000/take-test?code={{code}}',
        smsSubject: 'Test Invitation',
        smsBody:
          'Dear {{firstName}}, You have been invited to take a test. Your password is "password1". Click on this link to take the test: http://localhost:3000/take-test?code={{code}}',
        type: 'admin',
      },
      variables: [
        {
          name: 'firstName',
        },
        {
          name: 'code',
        },
      ],
    },
    {
      messageTemplate: {
        title: 'Order_Confirmation',
        description: 'Order confirmation message',
        emailSubject: 'Order Confirmation',
        emailBody:
          'Dear {{firstName}}, You have successfully placed an order on fodusstore. Your order number is {{orderId}}. Thanks for your patronage.',
        smsSubject: 'Order Confirmation',
        smsBody:
          'Dear {{firstName}}, You have successfully placed an order on fodusstore. Your order number is {{orderId}}. Thanks for your patronage.',
        type: 'admin',
      },
      variables: [
        {
          name: 'firstName',
        },
        {
          name: 'code',
        },
      ],
    },
  ];

  //   get existing message templates
  const allMessageTemplates = await MessageTemplate.findAll();

  //   if message templates is empty bulk create message templates
  if (allMessageTemplates.length === 0 || allMessageTemplates.length !== MessageTemplates.length) {
    // filter for message templates that do not exist
    const filteredMessageTemplates = MessageTemplates.filter(
      (messageTemplate) => !allMessageTemplates.find((m) => m.dataValues.title === messageTemplate.messageTemplate.title)
    );
    filteredMessageTemplates.forEach(async (messageTemplate) => {
      await createMessageTemplate(messageTemplate);
    });
    logger.info('message templates created'.rainbow);
  }
};

const createUsers = async () => {
  // get role ID
  const adminRole = await Role.findOne({
    where: {
      name: 'admin',
    },
  });

  const userRole = await Role.findOne({
    where: {
      name: 'user',
    },
  });
  const users = [
    {
      firstname: 'admin',
      lastname: 'admin',
      username: 'admin',
      phoneNumber: '12345678',
      email: 'musaakandeojo@gmail.com',
      password: 'password1',
      userType: 'admin',
      isEmailVerified: true,
      role: [adminRole.id],
    },
    {
      firstname: 'user',
      lastname: 'user',
      username: 'user',
      phoneNumber: '12345678',
      email: 'user@example.com',
      password: 'password1',
      userType: 'user',
      isEmailVerified: true,
      role: [userRole.id],
    },
  ];

  //   get existing users
  const allUsers = await User.findAll();

  //   if user is empty bulk create users
  if (allUsers.length === 0 || allUsers.length !== users.length) {
    // filter for users that do not exist
    const filteredUsers = users.filter((user) => !allUsers.find((l) => l.dataValues.email === user.email));
    filteredUsers.forEach(async (user) => {
      await createUser(user);
    });
    logger.info('users created'.rainbow);
  }
};

const createPermissions = async () => {
  const permissions = [
    {
      name: 'View Users',
      value: 'users.view',
      groupName: 'User Permissions',
      description: 'Permission to view other users account details',
    },
    {
      name: 'Manage Users',
      value: 'users.manage',
      groupName: 'User Permissions',
      description: 'Permission to create, delete and modify other users account details',
    },
    {
      name: 'Add Users',
      value: 'users.add',
      groupName: 'User Permissions',
      description: 'Permission to add new users',
    },
    {
      name: 'Delete Users',
      value: 'users.delete',
      groupName: 'User Permissions',
      description: 'Permission to delete users',
    },
    {
      name: 'Edit role for Users',
      value: 'users.changeRole',
      groupName: 'User Permissions',
      description: 'Permission to Edit role for users',
    },
    {
      name: 'View Permissions',
      value: 'permissions.view',
      groupName: 'Permission Permissions',
      description: 'Permission to view permissions',
    },
    {
      name: 'Manage Permissions',
      value: 'permissions.manage',
      groupName: 'Permission Permissions',
      description: 'Permission to create, delete and modify permissions',
    },
    {
      name: 'View Roles',
      value: 'roles.view',
      groupName: 'Role Permissions',
      description: 'Permission to view roles',
    },
    {
      name: 'Manage Roles',
      value: 'roles.manage',
      groupName: 'Role Permissions',
      description: 'Permission to create, delete and modify roles',
    },
    {
      name: 'View Message Templates',
      value: 'message_templates.view',
      groupName: 'Message Template Permissions',
      description: 'Permission to view message templates',
    },
    {
      name: 'Manage Message Templates',
      value: 'message_templates.manage',
      groupName: 'Message Template Permissions',
      description: 'Permission to create, delete and modify message templates',
    },
    {
      name: 'View Variables',
      value: 'variables.view',
      groupName: 'Variable Permissions',
      description: 'Permission to view variables',
    },
    {
      name: 'Manage Variables',
      value: 'variables.manage',
      groupName: 'Variable Permissions',
      description: 'Permission to create, delete and modify variables',
    },
    {
      name: 'Manage Categories',
      value: 'category.manage',
      groupName: 'Category Permissions',
      description: 'Permission to manage categories',
    },
  ];

  //   get existing permissions
  const allPermissions = await Permission.findAll();

  //   if permission is empty bulk create permissions
  if (allPermissions.length === 0 || allPermissions.length !== permissions.length) {
    // filter for permissions that do not exist
    const filteredPermissions = permissions.filter(
      (permission) => !allPermissions.find((l) => l.dataValues.value === permission.value)
    );
    // Bulk create permissions
    await Permission.bulkCreate(filteredPermissions);
    logger.info('permissions created'.rainbow);
  }

  // set permissions for roles
  await setAdminPermissions();
  await setUserPermissions();
};

const createCountries = async () => {
  //   get existing countries
  const allCountries = await Country.findAll();

  //   if country is empty bulk create countries
  if (allCountries.length === 0 || allCountries.length !== countries.length) {
    // filter for countries that do not exist
    const filteredCountries = countries.filter((country) => !allCountries.find((l) => l.dataValues.code === country.code));
    // bulk create countries
    await Country.bulkCreate(filteredCountries);
    logger.info('countries created'.rainbow);
  }
};

const initializeDatabase = async () => {
  // await createRoles();
  // await createVariables();
  // await createMessageTemplates();
  // await createUsers();
  // await createPermissions();
  // await createCountries();
};

module.exports = {
  initializeDatabase,
};
