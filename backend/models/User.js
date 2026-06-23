const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    mobileNumber: { type: String, default: '' },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'staff'],
      default: 'staff',
    },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    deactivatedAt: { type: Date, default: null },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
