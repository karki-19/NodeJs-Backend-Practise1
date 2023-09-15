const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const path = require("path");
const cookieparser = require("cookie-parser");
const { create } = require("domain");
const jwt = require("jsonwebtoken")
const jwtsecret = "dbcbjsdhcbsdcjbdscjb"
const bcrypt = require("bcrypt")

mongoose
  .connect("mongodb://127.0.0.1:27017",{
    dbName :"Backend",
  })
  .then(() => console.log("Database connected"))
  .catch((e) => console.log(e));

//creating schema

const userschema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
})

//creating model

const User = mongoose.model("User",userschema);

//using middlewares

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());

const isAuthenticated = (req,res,next)=>{
    const token = req.cookies.token;
    if(token){
    const decoded =  jwt.verify(token,jwtsecret)  // decoding the token here
    }
  else{
    res.redirect("/login");
  }
}

//setting up view engine to ejs so that we can send the html file in the ejs format (views folder- views name is very much important here)
app.set("view engine", "ejs");

app.get("/about", isAuthenticated,(req, res) => {
    res.render("Logout")
});

app.get("/register",(req,res)=>{
    res.render("register")
})

app.get("/login",(req,res)=>{
  res.render("login")
})

app.post("/register",async (req,res)=>{
    const{name,email,password} = req.body
    let user = await User.findOne({email})
    if(user){
        return res.redirect("/login")
    }
   
    const hashedPassword = await bcrypt.hash(password,10)
     
    user =await User.create({
        name,
        email,
        password: hashedPassword,
    })
    
    const token =jwt.sign({_id: user._id},jwtsecret)
    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
    });
    res.render("Logout")
})

app.post("/login",async (req,res)=>{
    const{email,password} = req.body
    let user = await User.findOne({email})
    if(!user) return res.render("register")
    
    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch)
       res.render("login",{email,message:"The password is incorrect"})
    
    const token =jwt.sign({_id: user._id},jwtsecret)
    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
    });
    res.render("Logout")
})

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now())
    });
    res.render("Login")
})

app.listen(5000, () => {
  console.log("server is running");
});
