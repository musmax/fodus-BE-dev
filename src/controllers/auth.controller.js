const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService, roleService } = require('../services');
const { extractPermissions } = require('../services/auth.service');
const pick = require('../utils/pick');

const register = catchAsync(async (req, res) => {
  const role = await roleService.getRolesByName(req.body.role);
  // console.log(role);
  const user = await userService.createUser({ ...req.body, role: [role.id], roleId: role.id });
  // Send email verification
  const verification = await authService.handleSendEmailVerificationToken(user);
  res.status(httpStatus.CREATED).send(verification);
});
const registerParent = catchAsync(async (req, res) => {
  const role = await roleService.getRolesByName(req.body.role);
  // console.log(role);
  const user = await userService.createParent({ ...req.body, role: [role.id], roleId: role.id });
  // Send email verification
  res.status(httpStatus.CREATED).send(user);
});

const studentRegistration = catchAsync(async (req, res) => {
  const role = await roleService.getRolesByName(req.body.role);
  await userService.studentRegistration({ ...req.body, role: [role.id] });
  res.status(httpStatus.CREATED).send({
    status: true,
    message: 'Students added successfully',
  });
});

const BulkTeacherRegidtration = catchAsync(async (req, res) => {
  const role = await roleService.getRolesByName(req.body.role);
  await userService.employeeRegistration({ ...req.body, role: [role.id] });
  res.status(httpStatus.CREATED).send({
    status: true,
    message: 'Employee added successfully',
  });
});

const login = catchAsync(async (req, res) => {
  const { password, ...others } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(others, password);

  if (!user.isEmailVerified) {
    return res.status(httpStatus.UNAUTHORIZED).send({
      code: httpStatus.UNAUTHORIZED,
      isVerified: false,
      email: user.dataValues.email,
      message: 'Please verify your email to login. We have sent you a verification email.',
    });
  }

  // Generate tokens
  const tokens = await tokenService.generateAuthTokens(user.dataValues.id);

  // Modify user object to bring permissions to the front
  const data = extractPermissions(user);
  // encrypt user data
  const encryptedUser = await userService.encryptData({ ...user.dataValues, ...data });

  res.send({ encryptedUser, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  const data = await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send({ data });
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const { email } = pick(req.query, ['email']);
  const user = await userService.getUserByEmail(email);
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
  await emailService.sendVerificationEmail(email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  const data = await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send({ data });
});

const createManyStudents = catchAsync(async (req, res) => {
  const students = await userService.createManyStudents(req.file);
  res.status(httpStatus.CREATED).send(students);
});
const createManyEmployee = catchAsync(async (req, res) => {
  const employee = await userService.createManyEmployee(req.file);
  res.status(httpStatus.CREATED).send(employee);
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  studentRegistration,
  BulkTeacherRegidtration,
  registerParent,
  createManyStudents,
  createManyEmployee,
};
