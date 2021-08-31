const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const fileupload = require("express-fileupload");
require("./db");
const bcrypt = require("bcryptjs");
const cookies = require("cookie-parser");
const userModal = require("./schema");
const cloudinary = require("cloudinary").v2;
app.use(express.json());
app.use(
	fileupload({
		useTempFiles: true,
	})
);

app.use(cookies());
cloudinary.config({
	cloud_name: "dfivaypb3",
	api_key: "223934452241258",
	api_secret: "NL6btVeP6d-oa1QE1B0hW3tM6zw",
});

const auth = (req, res, next) => {
	if (req.cookies.JWToken) {
		next();
	} else {
		res.status(400).send({ message: "user not login" });
	}
};

app.post("/signup", async (req, res) => {
	if (!req.body.email || !req.body.password) {
		res.status(400).send({ message: "Missing credential " });
	}
	try {
		let userExist = await userModal.findOne({ email: req.body.email });
		if (userExist) {
			res.status(400).send({ message: "User Exist" });
		} else {
			data = {
				email: req.body.email,
				password: req.body.password,
			};
			let newUser = userModal(data);
			await newUser.save();
			res.status(200).send({ message: "User created" });
		}
	} catch (err) {
		console.log(err);
	}
});

app.post("/login", async (req, res) => {
	let token;
	console.log(req.body);
	if (!req.body.email || !req.body.password) {
		res.status(400).send({ message: "Missing credential " });
	}
	try {
		let userExist = await userModal.findOne({ email: req.body.email });
		if (userExist) {
			token = await userExist.generateAuthToken();
			console.log(token);
			res.cookie("JWToken", token),
				{
					expires: new Date(Date.now() + 100000000),
					httpOnly: true,
				};
			const checkPassword = await bcrypt.compare(req.body.password, userExist.password);
			if (checkPassword) {
				res.status(200).send({ message: "Login Succesful" });
			} else {
				res.status(400).send({ message: "User not exist" });
			}
		} else {
			res.status(400).send({ message: "User not exists" });
		}
	} catch (err) {
		console.log(err);
	}
});

app.delete("/delete", auth, async (req, res) => {
	try {
		const deleteUser = await userModal.deleteOne({ email: req.body.email });
		if (deleteUser) {
			res.status(200).send({ message: "User deleted successfully" });
		} else {
			res.status(400).send({ message: "Error in deletion of user" });
		}
	} catch (e) {
		console.log(e);
	}
});

app.post("/upload", auth, async (req, res) => {
	const file = req.files.photo;
	if (req.body.email) {
		cloudinary.uploader.upload(file.tempFilePath, async function (err, result) {
			if (err) {
				res.status(400).send({ message: "Error while uploading file" });
			} else {

				if (userModal.findOne({email: req.body.email})) {
					await userModal.findOneAndUpdate(
						{ email: req.body.email },
						{ $set: { profile: result.url } },
						{ $upsert: true }
					);
					 res.status(200).send({ message: "file uploaded", result: result });
				}
				else{
					res.status(400).send({ message: "please login first" });
				}
				
			}
		});
	}
});

app.get("/clearCookies", (req, res) => {
	res.clearCookie("JWToken");
	res.status(200).send("cookies cleared");
});

app.get("/allUsers", auth, async (req, res) => {
	try{
	const user = await userModal.findOne({email:req.body.email});
	if(user){
	const result = await userModal.find({}, { email: 1, profile: 1, _id: 0 });
	res.status(200).send(result);}
	else{
		res.status(400).send({message:"failed"});
	}
	}catch(e){
		console.log(e)
	}
});

app.listen(2000, () => {
	console.log("running at port 2000");
});
