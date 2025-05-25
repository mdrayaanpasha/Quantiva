import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String, // Hash this
    verified: { type: Boolean, default: false },
});

export default userSchema