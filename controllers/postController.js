import { format } from "date-fns";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { postSchema } from "../utils/schemas.js";
import { commentSchema } from "../utils/schemas.js";

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
  const postId = req.params.postId;

  try {
    // Find the post by its ID in the database
    const post = await Post.findById(postId).populate("posterID").exec();

    // If no post is found, return a 404 error
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const user = await User.findById(post.posterID);

    if (!user) {
      return res.status(404).json({ error: "Poster not found" });
    }

    const objectComments = post.comments.map((comment) => ({
      text: comment.commentText,
      commenter: comment.username,
      ...comment.toObject(),
    }));

    // Render the 'postDetails' page and pass the post data
    const formattedPost = {
      ...post.toObject(),
      completeBy: post.completeBy.toLocaleDateString("en-US", {
        timeZone: "UTC",
      }), // Format date
      datePosted: post.datePosted.toLocaleDateString("en-US", {
        timeZone: "UTC",
      }),
      comments: objectComments,
      username: user.username, // Add username
    };

    console.log("Formatted Comments:", formattedPost.comments);

    res.render("postDetails", {
      post: formattedPost,
      user: req.session.profile,
      script: "/public/js/validateComments.js",
      title: "Post Details",
    });
  } catch (error) {
    console.error("Error retrieving post details:", error);
    res.status(500).json({ error: "Failed to retrieve the post" });
  }
};

// new comment creation
const createComment = async (req, res) => {
  if (!req.session.profile) {
    return res.status(401).json({ error: "User not logged in" });
  }

  const postId = req.params.postId;
  console.log(postId);
  const { commentText } = req.body;

  if (commentText.trim().length === 0) {
    return res.status(404).json({ error: "Cannot post empty comments." });
  }

  try {
    // Validate using Zod schema
    const result = commentSchema.safeParse({
      userID: req.session.profile.id,
      username: req.session.profile.username,
      commentText,
    });
    if (result.success === false) {
      const errors = result.error.errors.map((error) => error.message);
      return res.status(400).json({
        error: errors.join(", "),
      });
    }

    // finding the post to add the comment
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // add the new comment
    const newComment = {
      userID: req.session.profile.id,
      username: req.session.profile.username,
      commentText,
    };
    // const newComment = {
    //   commenter: { username: req.session.profile.username },
    //   text: commentText,
    // };

    post.comments.push(newComment);
    await post.save();

    // Redirect to the comments page
    // res.redirect(`/posts/${postId}/comments`);
    return res.status(201).json({ message: "Comment posted" });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("posterID").exec();

    // const sanitizedPosts = posts.map((post) =>
    //   JSON.parse(JSON.stringify(post)),
    // );
    const sanitizedPosts = posts.map((post) => {
      const formattedPost = post.toObject();
      // Format the completeBy and datePosted dates from DB
      formattedPost.completeBy = post.completeBy.toLocaleDateString("en-US", {
        timeZone: "UTC",
      });
      formattedPost.datePosted = post.datePosted.toLocaleDateString("en-US", {
        timeZone: "UTC",
      });
      return formattedPost;
    });

//     const sanitizedPosts = posts.map((post) => ({
//       ...post.toObject(),
//       datePosted: format(post.datePosted, "MM/dd/yyyy"),
//       completeBy: format(post.completeBy, "MM/dd/yyyy"),
//     }));

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
      $or: [{ category: exp }, { description: exp }]
    }).lean();

    const searchResults = searchedPosts.map((post) =>
      JSON.parse(JSON.stringify(post)),
    );
    //console.log(searchResults);

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

const sendInfo = async (req, res) => {
  try {
    const postID = req.params.postID;

    const post = await Post.findById(postID).populate("posterID").exec();

    if (!req.session.profile) {
      return res
        .status(401)
        .json({ error: "You must be logged in to do that!" });
    }

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const user = await User.findOne({ _id: req.session.profile.id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (post.posterID.equals(user._id)) {
      return res.status(400).json({ error: "Cannot send info to own post" });
    }

    if (!post.requestedUsers.includes(user._id)) {
      post.requestedUsers.push(user._id);
      await post.save();
    }

    return res.status(200).json({ success: true, message: "Info sent" });
  } catch (error) {
    console.error("Error sending info:", error);
    res.status(500).json({ error: "Failed to send info" });
  }
};

const getHelpers = async (req, res) => {
  try {
    if (!req.session.profile) {
      return res.redirect("/users/login");
    }

    const user = req.session.profile;
    const postID = req.params.postID;

    const post = await Post.findById(postID)
      .lean()
      .populate([{ path: "requestedUsers" }, { path: "posterID" }])
      .exec();

    if (!post) {
      return res.status(404).render("404", { error: "Post not found" });
    }

    if (user.id !== post.posterID._id.toString()) {
      return res.status(403).render("403", { error: "You are not the poster" });
    }

    return res.status(200).render("helpers", {
      user,
      post,
      title: "Helpers",
    });
  } catch (error) {
    console.error("Error retrieving helpers:", error);
    res.status(500).json({ error: "Failed to retrieve helpers" });
  }
};

const selectHelper = async (req, res) => {
  try {
    const user = req.session.profile;
    if (!user) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const postID = req.params.postID;
    const helperID = req.params.helperID;

    const post = await Post.findById(postID).populate("posterID").exec();

    if (user.id !== post.posterID._id.toString()) {
      return res.status(403).json({
        error: "You are not authorized to select a helper for this post",
      });
    }

    if (post.posterID._id.toString() === helperID) {
      return res
        .status(400)
        .json({ error: "Cannot select yourself as a helper" });
    }

    if (!post.requestedUsers.some((id) => id.toString() === helperID)) {
      return res
        .status(400)
        .json({ error: "This user has not requested to help with the post" });
    }

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.helperID) {
      return res
        .status(400)
        .json({ error: "A helper has already been selected" });
    } else {
      post.helperID = helperID;
      post.status = "In Progress";
      await post.save();
    }

    return res.status(200).json({ success: true, message: "Helper selected" });
  } catch (error) {
    console.error("Error selecting helper:", error);
    res.status(500).json({ error: "Failed to select helper" });
  }
};


export default {
  getCreatePost,
  createPost,
  getPostDetails,
  getAllPosts,
  sendInfo,
  getHelpers,
  createComment
  selectHelper,
  postSearch, 
  postFilter
};

