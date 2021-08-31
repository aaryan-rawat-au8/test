const mongoose = require("mongoose");

const db =
	"mongodb+srv://aryanrawat:aryanDB@cluster0.7drpz.mongodb.net/cometchat?retryWrites=true&w=majority";

const DB=mongoose
	.connect(
		"mongodb+srv://aryanrawat:aryanDB@cluster0.7drpz.mongodb.net/cometchat?retryWrites=true&w=majority",
		{ useNewUrlParser: true }
	)
	.then(() => {
		console.log("mongodb connected");
	})
	.catch((e) => {
		console.log("error connecting to mogodb");
	});
