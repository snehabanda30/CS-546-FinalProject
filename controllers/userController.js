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

export default {demoFuncOne, demoFuncTwo}