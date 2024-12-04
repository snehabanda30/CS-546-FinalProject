const demoFuncOne = (req, res) => {
  return res.render("test", {
    number: 1,
    type: "post",
  });
};

const demoFuncTwo = (req, res) => {
  return res.render("test", {
    number: 2,
    type: "post",
  });
};

export default { demoFuncOne, demoFuncTwo };
