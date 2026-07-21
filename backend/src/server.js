require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const User = require("./models/User");

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: "phi123123@gmail.com" });
    if (!adminExists) {
      await User.create({
        name: "System Admin",
        email: "phi123123@gmail.com",
        password: "jbjbdabkjdghsbcsa",
        phoneNumber: "0000000000",
        role: "Admin",
      });
      console.log("Default Admin seeded successfully.");
    }
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
  }
};

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
