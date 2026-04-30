const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

/**
 * User Model - Sequelize Implementation
 * Production-ready with proper validation, hooks, and associations
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Name is required',
      },
      len: {
        args: [2, 255],
        msg: 'Name must be between 2 and 255 characters',
      },
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      msg: 'Email already exists',
    },
    validate: {
      isEmail: {
        msg: 'Please provide a valid email',
      },
      notEmpty: {
        msg: 'Email is required',
      },
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Password is required',
      },
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters long',
      },
    },
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Avatar must be a valid URL',
      },
    },
  },
  goal: {
    type: DataTypes.ENUM('weight_loss', 'muscle_gain', 'endurance', 'general_fitness', 'strength'),
    allowNull: false,
    defaultValue: 'general_fitness',
    field: 'fitness_goal'
  },
  height: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: {
        args: [50],
        msg: 'Height must be at least 50 cm',
      },
      max: {
        args: [300],
        msg: 'Height must be less than 300 cm',
      },
    },
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: {
        args: [20],
        msg: 'Weight must be at least 20 kg',
      },
      max: {
        args: [500],
        msg: 'Weight must be less than 500 kg',
      },
    },
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [13],
        msg: 'Age must be at least 13 years',
      },
      max: {
        args: [120],
        msg: 'Age must be less than 120 years',
      },
    },
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true,
  },
  activity_level: {
    type: DataTypes.ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
    allowNull: false,
    defaultValue: 'moderate',
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  email_verification_token: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  password_reset_token: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  premium_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['email'],
    },
    {
      fields: ['fitness_goal'],
    },
    {
      fields: ['created_at'],
    },
    {
      fields: ['email_verified'],
    },
    {
      fields: ['is_active'],
    },
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

/**
 * Instance Methods
 */
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

User.prototype.getJSON = function() {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    goal: this.goal,
    height: this.height,
    weight: this.weight,
    age: this.age,
    gender: this.gender,
    activity_level: this.activity_level,
    email_verified: this.email_verified,
    is_active: this.is_active,
    is_premium: this.is_premium,
    premium_expires: this.premium_expires,
    last_login: this.last_login,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.email_verification_token;
  delete values.password_reset_token;
  delete values.password_reset_expires;
  return values;
};

/**
 * Class Methods
 */
User.findByEmail = function(email) {
  return this.findOne({ where: { email } });
};

User.findActiveUsers = function(limit = 10, offset = 0) {
  return this.findAndCountAll({
    where: { is_active: true },
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });
};

User.searchUsers = function(query, limit = 10) {
  return this.findAll({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { name: { [sequelize.Sequelize.Op.like]: `%${query}%` } },
        { email: { [sequelize.Sequelize.Op.like]: `%${query}%` } },
      ],
      is_active: true,
    },
    limit,
    order: [['name', 'ASC']],
  });
};

/**
 * Update last login
 */
User.updateLastLogin = async (userId) => {
  await User.update(
    { last_login: new Date() },
    { where: { id: userId } }
  );
};

module.exports = User;
