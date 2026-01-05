const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const router = express.Router();

const userModel = require("../models/user.model");


router.post(
  "/signup",
  [
    body("email").trim().normalizeEmail().isEmail(),
    body("username").trim().isLength({ min: 5 }),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: errors.array(),
          message: "Invalid entries",
        });
      }

      const { email, username, password } = req.body;

      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          message: "User Already Exists",
        });
      }

      const hashPassword = await bcrypt.hash(password, 10);

      const newUser = await userModel.create({
        email,
        username,
        password: hashPassword,
      });

      res.status(201).json({
        user: {
          userId: newUser._id,
          email: newUser.email,
          username: newUser.username,
        },
      });
    } catch (error) {
      //11000 is MongoDB’s built-in error code for a duplicate key violation.
      if (error.code === 11000) {
        return res.status(409).json({
          message: "User already exists",
        });
      }

      res.status(500).json({
        message: "Unable to signup",
      });
    }
  }
);

router.post(
  "/signin",
  [
    body("email").trim().normalizeEmail().isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: errors.array(),
          message: "Please enter a valid email and password",
        });
      }

      const { email, password } = req.body;

      const user = await userModel.findOne({ email });

      if (!user) {
        return res.status(401).json({
          message: "Please enter a valid email and password",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          message: "Please enter a valid email and password",
        });
      }

      const token = jwt.sign({id:user._id},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
      );

      const isProd = process.env.NODE_ENV === "production";
      res.cookie("token",token,{
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" :  "lax",
        maxAge: 24*60*60*1000
      });

      const userObj = user.toObject();
      delete userObj.password;

      res.status(200).json({
        message: "Login successful",
        user: userObj,
      });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  }
);


router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });

  res.status(200).json({
    message: "Logout successful",
  });
});


module.exports = router;
