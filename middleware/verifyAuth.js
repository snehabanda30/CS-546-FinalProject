export const verifyAuth = (req, res, next) => {
  if (!req.session.profile) {
    return res.redirect("/users/login");
  }

  next();
};
