const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const UserSchema = new mongoose.Schema({
    fullname: String,
    username: String,
    password: String,
    phone: Number,
    email: String,
    role: String,
    language: String,
    image: String
});
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);