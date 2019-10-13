const bcrypt = require('bcrypt');
const uniqueId = require('./unique-id');
const testUsers = require('./test-users.json');

const PROVIDER_NAME_ELMU = 'elmu';
const PASSWORD_SALT_ROUNDS = 1024;

const ADMIN_USER = {
  username: 'test',
  password: 'test',
  roles: ['user', 'editor', 'super-editor', 'super-user'],
  lockedOut: false
};

function createTestUsers(userIds) {
  const usersToCreate = testUsers.concat([ADMIN_USER]);

  if (userIds.length > usersToCreate.length) {
    throw new Error('Not enough test users');
  }

  for (let i = 0; i < userIds.length; i += 1) {
    usersToCreate[i] = {
      ...usersToCreate[i],
      _id: userIds[i]
    };
  }

  return Promise.all(usersToCreate.map(createUser))
}

async function createUser(user) {
  return {
    _id: user._id || uniqueId.create(),
    provider: PROVIDER_NAME_ELMU,
    username: user.username,
    passwordHash: await bcrypt.hash(user.password, PASSWORD_SALT_ROUNDS),
    email: `${user.username}@test.com`,
    roles: user.roles,
    expires: null,
    verificationCode: null,
    lockedOut: !!user.lockedOut,
    profile: user.profile || null
  };
}

module.exports = {
  createTestUsers,
  createUser
};
