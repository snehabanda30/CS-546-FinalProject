import Post from "../models/Post.js";
import User from "../models/User.js";
import { postSchema } from "../utils/schemas.js";

// Allow user to create a Post
const getCreatePost = (req, res) => {
  // Redirect to login page if user is not logged in
  if (!req.session.profile) {
    return res.redirect("/users/login");
  }

  // redirect to createPost form
  return res.render("createPost", {
    script: "/public/js/validatePostSchema.js",
    user: req.session.profile,
    title: "Create Post",
  });
};

// Create Post function
const createPost = async (req, res) => {
  // Check if the user is logged in
  if (!req.session.profile || !req.session.profile.id) {
    return res.status(401).json({ error: "User not logged in" });
  }

  // Get the form input from req.body
  const {
    category,
    location,
    skillsRequired,
    priority,
    status,
    description,
    completeBy,
  } = req.body;

  // Validate using Zod schema
  try {
    const postData = {
      category,
      location,
      skillsRequired,
      priority,
      status: status || "Pending", // Default to 'Pending' if status is not provided
      description,
      completeBy,
    };

    const result = postSchema.safeParse(postData);
    if (result.success === false) {
      const errors = result.error.errors.map((error) => error.message);
      return res.status(400).json({
        error: errors.join(", "),
      });
    }

    let skills = [];
    if (skillsRequired && typeof skillsRequired === "string") {
      skills = skillsRequired.split(",").map((skill) => skill.trim());
    }

    // If validation passes, create the post object
    const post = await Post.create({
      posterID: req.session.profile.id, // Set posterID to the logged-in user's ID from the session
      category,
      location,
      skillsRequired: skills,
      priority,
      status: status || "Pending",
      description,
      completeBy,
    });

    // Update the user's posts array with the new post ID
    await User.findOneAndUpdate(
      { _id: req.session.profile.id },
      { $push: { posts: post._id } },
    );

    // Redirect to the post details page after successful creation
    //res.redirect(`/posts/post/${post._id}`);
    return res.json({ _id: post._id });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
};

const getPostDetails = async (req, res) => {
  console.log("Fetching post with ID:", req.params.postId);

  const postId = req.params.postId;

  // check if the user is logged in, if not, redirect
  if (!req.session.profile) {
    return res.redirect("/users/login");
  }

  try {
    // Find the post by its ID in the database
    const post = await Post.findById(postId);

    // If no post is found, return a 404 error
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const user = await User.findById(post.posterID);

    if (!user) {
      return res.status(404).json({ error: "Poster not found" });
    }

    // Render the 'postDetails' page and pass the post data
    const formattedPost = {
      ...post.toObject(),
      completeBy: post.completeBy.toLocaleDateString("en-US", {
        timeZone: "UTC",
      }), // Format date
      username: user.username, // Add username
    };

    res.render("postDetails", {
      post: formattedPost,
      user: req.session.profile,
      title: "Post Details",
    });
  } catch (error) {
    console.error("Error retrieving post details:", error);
    res.status(500).json({ error: "Failed to retrieve the post" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    const sanitizedPosts = posts.map((post) =>
      JSON.parse(JSON.stringify(post)),
    );

    const user = req.session.profile || null;

    return res
      .status(200)
      .render("home", { user, posts: sanitizedPosts, title: "Home" });
  } catch (error) {
    return res.status(500).send("Server Error");
  }
};

const postSearch = async (req, res) => {

  const searchTerm = req.query.q;
  console.log("Query parameter q:", req.query.q);

  try{

    if(!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) throw `Search term is required.`;
    
    const exp = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const searchedPosts = await Post.find({
      $or: [{ category: exp }, { description: exp }],
    }).lean();

    const searchResults = searchedPosts.map((post) =>
      JSON.parse(JSON.stringify(post)),
    );
    console.log(searchResults);

    const user = req.session.profile || null;
    
    return res
      .status(200)
      .render("searchResults", { user, searchedPosts: searchResults });


  } catch(error){
      return res.status(500).send("Server Error");
  }
    
};

const postFilter = async (req, res) => {

};

export default { getCreatePost, createPost, getPostDetails, getAllPosts, postSearch, postFilter };
