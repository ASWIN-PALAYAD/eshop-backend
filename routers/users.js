const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); //for crypting the password
const mongoose = require("mongoose");

//API for geting all users details
router.get("/", async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }

  res.send(userList);
});

//API for getting single user
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(500).send("sorry.. The user ID cant process..!");
  }

  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user)
    return res.status(400).send("The user with given ID was not found");

  res.status(200).send(user);
});

//API for registering a new user
router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    appartment: req.body.appartment,
    street: req.body.street,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();

  if (!user) return res.status(400).send("the user cannot be created");

  res.send(user);
});

//API for editing a user details
router.put("/:id", async (req, res) => {
    //checking is password change is required or not
    const userExist = await User.findById(req.params.id)
    let newPassword
    if(req.body.password){
        newPassword = bcrypt.hashSync(req.body.password,10)
    }else{
        newPassword = userExist.passwordHash
    }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      appartment: req.body.appartment,
      street: req.body.street,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    },
    { new: true }
  );

  if (!user) return res.status(400).send("The user cannot be created...");

  res.send(user);
});

module.exports = router;
