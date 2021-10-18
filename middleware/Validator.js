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

module.exports = { signupValidator, loginValidator }