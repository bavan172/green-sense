const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;


const generateToken = (user) => {
  return jwt.sign({ id: user._id, username: user.username || user.name }, JWT_SECRET, { expiresIn: '1h' });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

  const user = await User.create({ name, email, password });
    const token = generateToken(user);

    res.status(201).json({
      userId: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

  const token = generateToken(user);
    res.status(200).json({
      userId: user._id,
      name: user.name,
      email: user.email,
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  console.log("in upate user")
  const { name, email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name;
    if (password) {
      user.password = password; 
    }

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

  // try {
  //   const user = await User.findOneAndUpdate(
  //     { email },
  //     { name, password },
  //     { new: true }
  //   );
  //   res.status(200).json({
  //     message: 'User updated successfully',
  //     userId : user._id
  //   }); 
  // }
  // catch (error) {

  //   console.error(error);
  //   res.status(500).json({ message: 'Server error' });
  // }
}

module.exports = { registerUser, loginUser, updateUser };
