const mongoose = require("mongoose");

const UsersSchema = mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true,},
    name: {type: String, required: true,},
    phone: {type: String, required: true, unique: true},
    salt : {type:String}
});

module.exports = mongoose.model("User", UsersSchema);