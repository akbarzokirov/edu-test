const { User } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  console.log("LOGIN BODY:", req.body);
  const { email, password } = req.body;

  try {
    console.log("Login request received:", { email });
    const user = await User.scope(null).findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: "Email yoki parol noto‘g‘ri!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for:", email);
      return res.status(400).json({ success: false, message: "Email yoki parol noto‘g‘ri!" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Sizning hisobingiz bloklangan!" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    const userData = user.toJSON();
    delete userData.password;

    res.json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.scope(null).findByPk(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Joriy parol noto'g'ri" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
