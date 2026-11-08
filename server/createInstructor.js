require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const createInstructor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({
      email: "student@test.com"
    });

    if (!user) {
      console.log("Test student not found. Register first.");
      return;
    }

    user.role = "instructor";
    await user.save();

    console.log("Instructor role assigned successfully!");
    console.log(user.name, user.role);
  } catch (error) {
    console.log("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createInstructor();