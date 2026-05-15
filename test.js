const bcrypt = require("bcryptjs");

bcrypt.hash("admin123", 12).then(console.log);