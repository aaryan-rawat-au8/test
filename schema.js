const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken");
var userSchema = new mongoose.Schema({
	email: String,
	password: String,
	profile: String,
        tokens:[
                {
                        token: String,
                }
        ]
});

userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 12);
		console.log(this.password);
	}
	next();
});

userSchema.methods.generateAuthToken =async function(){
        try{
                let token=jwt.sign({_id:this._id},"ABCDE");
                this.tokens=this.tokens.concat({token:token})
                await this.save();
                return token;
        }catch(e){
                console.log(e);
        }
}

var User = mongoose.model("User", userSchema);
module.exports = User;
