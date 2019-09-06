const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema({
    to: {type:String,required:true},
    from: {type:String,required:true},
    text: {type:String},
    timestamp: {type:Number,required:true}
});

module.exports = mongoose.model("Message", MessageSchema);