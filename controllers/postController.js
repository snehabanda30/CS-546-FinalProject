import Post from "../models/Post.js";

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

const getAllPosts = async (req,res) => {
  try{
    const posts = await Post.find(); 
    const sanitizedPosts = posts.map(post => JSON.parse(JSON.stringify(post)));

    console.log(posts); 
    const user = req.session.profile || null; 
    console.log(user);
    
    return res.status(200).render("home", {user,posts: sanitizedPosts});
  } catch(error) {
    return res.status(500).send("Server Error");
  }
}

export default { demoFuncOne, demoFuncTwo,getAllPosts };
