const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../schema/UserSchema')
const { sign } = require('../config/sign')
const { verifyToken } = require('../middleware/VerifyToken')
const { validationResult } = require('express-validator')
const { signupValidator, loginValidator, resetPasswordValidator } = require("../middleware/Validator")

//ROUTE 1: Endpoint for user signup ||POST: /api/auth/signup
router.post('/signup', signupValidator, async (req, res) => {
    const errors = validationResult(req)
    const { name, email, password } = req.body
    if (!errors.isEmpty()) {
        return res.status(404).json({ error: errors.array() })
    }
    try {
        let user = await User.findOne({ email })

        if (user) { return res.status(400).json({ error: "User with email already exists" }) }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        user = await User.create({ name, email, password: hashPassword })
        const authToken = jwt.sign({ id: user.id }, sign)
        res.status(200).json({ authToken })

    } catch (error) {
        res.status(500).send("Internal Server error...")
        console.log(error);
    }
})

// ROUTE 2: endpoint for user login ||POST : /api/auth/login

router.post('/login', loginValidator, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { return res.status(400).json({ error: errors.array() }) }
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) { return res.status(400).send("Please login with a valid email and password") }
        const checkPass = await bcrypt.compare(password, user.password)
        if (!checkPass) { return res.status(400).send("Please login with a valid email and password") }

        const authToken = jwt.sign({ id: user.id }, sign)
        res.status(200).json({ authToken })

    } catch (error) {
        res.status(500).send("Internal Server error...")
        console.log(error);
    }
})

// ROUTE 3: endpoint to get user data || POST: /api/auth/user

router.post('/user', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.id).select("-password");
        if (!user) { return res.status(401).send("Not allowed") }
        res.send(user);
    } catch (error) {
        res.status(500).send("Internal server error")
        console.log(error)
    }
})

// ROUTE 4: endpoint for forget password link || POST: /api/auth/resetpassword
router.post('/resetpassword',resetPasswordValidator , verifyToken, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty) { return res.status(400).json(errors.array()) }
    try {
        let user = await User.findById(req.id)
        if (!user) { return res.status(401).send("Not allowed") }
        const { password, newPassword, confirmNewPassword } = req.body

        const checkPass = await bcrypt.compare(password, user.password)
        if (!checkPass) { res.status(400).send('invalid request') }

        const salt = await bcrypt.genSalt(10)
        const hashPass = await bcrypt.hash(newPassword,salt)

        user =await User.findByIdAndUpdate(req.id, {$set: {password: hashPass}}, {new: false})
        res.status(200).send("Password Updated")
    } catch (error) {
        res.status(500).send("Internal server error")
        console.log(error)
    }
})

module.exports = router;
