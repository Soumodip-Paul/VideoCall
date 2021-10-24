const {body} = require('express-validator')
const signupValidator = [
    body('name', 'Name is not Valid').isLength({ min: 5 }),
    body('email', 'Email is not valid').isEmail(),
    body('password', 'Input a proper password').isStrongPassword()
]

const loginValidator = [
    body('email', 'Enter a valid email address').isEmail(),
    body('password', 'Enter a password').exists()
]

const resetPasswordValidator = [
    body('newPassword', 'This field cannot be empty').isStrongPassword(),
    body('confirmNewPassword', 'This field cannot be empty').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match password');
        }
        // Indicates the success of this synchronous custom validator
        return true;
      })
]

module.exports = { signupValidator, loginValidator, resetPasswordValidator }