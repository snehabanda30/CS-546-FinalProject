import User from "../models/User.js"

const demoFuncOne = (req, res) => {
  return res.render("test", {
    number: 1,
    type: "user"
  })
}

const demoFuncTwo = (req, res) => {
  return res.render("test", {
    number: 2,
    type: "user"
  })
}

// Signup

const getSignup = (req, res) => {
  return res.render("signup")
}

const signup = (req, res) => {
  // Logic for signup
  const { username, password } = req.body
  console.log(username, password)
  return res.redirect("/")
}

export default {demoFuncOne, demoFuncTwo, getSignup, signup}