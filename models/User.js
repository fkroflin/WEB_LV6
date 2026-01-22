const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  try {
    this.password = await bcrypt.hash(this.password, 10);
  } catch (err) {
    throw err; 
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);