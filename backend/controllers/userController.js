const { User } = require("../models");
const { validateUser, validateUpdateUser } = require("../validation/userValidation");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const user = await User.create(req.body);

    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const userData = user.toJSON();
    delete userData.password;

    res.status(201).send({ user: userData, token });
  } catch (err) {
    console.error("Backend xatolik:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).send({ message: "Bu email allaqachon mavjud" });
    }

    res.status(500).send({ message: "Serverda xatolik" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).send("User not found");

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateUser = async (req, res) => {
  const { error } = validateUpdateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).send("User not found");

    await user.update(req.body);

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).send("User not found");

    const userData = user.toJSON();
    await user.destroy();

    res.status(200).send(userData);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).send("Search query is required");
    }

    const users = await User.findAll({
      where: {
        fullName: { [Op.iLike]: `%${query}%` },
      },
    });

    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.scope(null).findOne({ where: { email } });
    if (!user) {
      return res.status(400).send({ message: "Email noto‘g‘ri!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Parol noto‘g‘ri!" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    const userData = user.toJSON();
    delete userData.password;

    res.status(200).send({
      message: "Login muvaffaqiyatli",
      token,
      user: userData,
    });
  } catch (error) {
    res.status(500).send({ message: "Server xatosi" });
  }
};