const { check } = require('express-validator');

exports.signupValidator = [
  check('name')
    .notEmpty().withMessage('Please provide a name')
    .matches(/[a-zA-Z]/).withMessage('Name must contain at least one alphabetic character'),
  check('email')
    .isEmail().withMessage('Please add a valid email'),
  check('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one numeric digit')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/).withMessage('Password must contain at least one special character')
];

exports.loginValidator = [
  check('email')
    .notEmpty().withMessage('Please provide email')
    .isEmail().withMessage('Please add a valid email'),
  check('password')
    .notEmpty().withMessage('Please provide password')
];

exports.requestLoginOTPValidator = [
  check('email')
    .notEmpty().withMessage('Please provide email')
    .isEmail().withMessage('Please add a valid email')
];

exports.verifyOTPValidator = [
  check('email')
    .notEmpty().withMessage('Please provide email')
    .isEmail().withMessage('Please add a valid email'),
  check('otp')
    .notEmpty().withMessage('Please provide OTP')
];

exports.forgotPasswordValidator = [
  check('email')
    .notEmpty().withMessage('Please provide email')
    .isEmail().withMessage('Please add a valid email')
];

exports.resetPasswordValidator = [
  check('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one numeric digit')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/).withMessage('Password must contain at least one special character')
];
