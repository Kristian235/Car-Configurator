const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
let User = new Schema({
    username: {
        type: String,
        max: 25
    },
    password: {
        type: String,
        required: true,
        max: 25
    }
});

User.pre("save", async function () {
    const hash = await bcrypt.hash(this.password, 12);

    this.password = hash;
})

User.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", User);