import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { Address } from "../models/Address.js";
import { Comment } from "../models/Comment.js";
import { Review } from "../models/Review.js";
import { connectDB, closeConnection } from "../config/connectDB.js";

async function seedDatabase() {
  try {
    await connectDB();
    await mongoose.connection.dropDatabase();
    console.log("Database cleared");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    const address1 = await Address.create({
      address: "26 Roosevelt Avenue",
      city: "Dover",
      state: "NJ",
      zipCode: "07801",
      country: "USA",
    });

    const address2 = await Address.create({
      address: "1 Castle Point Terrace",
      city: "Hoboken",
      state: "NJ",
      zipCode: "07030",
      country: "USA",
    });

    const address3 = await Address.create({
      address: "231 River Street",
      city: "Hoboken",
      state: "NJ",
      zipCode: "07030",
      country: "USA",
    });

    const address4 = await Address.create({
      address: "631 Bloomfield Street",
      city: "Hoboken",
      state: "NJ",
      zipCode: "07030",
      country: "USA",
    });

    const address5 = await Address.create({
      address: "506 Washington Street",
      city: "Hoboken",
      state: "NJ",
      zipCode: "07030",
      country: "USA",
    });

    const review1 = await Review.create({
      rating: 4.5,
      reviewBody: "Great helper!",
      posterUsername: "sbanda",
    });

    const review2 = await Review.create({
      rating: 4.0,
      reviewBody: "Very helpful!",
      posterUsername: "bpatel",
    });

    const review3 = await Review.create({
      rating: 4.8,
      reviewBody: "Excellent work!",
      posterUsername: "jferber",
    });

    const review4 = await Review.create({
      rating: 4.2,
      reviewBody: "Very knowledgeable!",
      posterUsername: "pputrevu",
    });

    const review5 = await Review.create({
      rating: 4.6,
      reviewBody: "Great job!",
      posterUsername: "vgiraldo",
    });

    const user1 = await User.create({
      username: "vgiraldo",
      hashedPassword: hashedPassword,
      email: "vgiraldo@stevens.edu",
      phoneNumber: "5512427420",
      firstName: "Victor",
      lastName: "Giraldo",
      address: address1,
      skills: ["Construction", "Plumbing"],
      reviews: [review1, review2],
      averageRating: 4.5,
      profilePicture: "https://i.imgur.com/19JB4HV.png",
    });

    const user2 = await User.create({
      username: "sbanda",
      hashedPassword: hashedPassword,
      email: "sbanda1@stevens.edu",
      phoneNumber: "2015555555",
      firstName: "Sneha",
      lastName: "Banda",
      address: address2,
      skills: ["Programming", "Electrical"],
      reviews: [review5],
      averageRating: 4.0,
      profilePicture: "https://i.imgur.com/19JB4HV.png",
    });

    const user3 = await User.create({
      username: "bpatel",
      hashedPassword: hashedPassword,
      email: "bpatel4@stevens.edu",
      phoneNumber: "2015555555",
      firstName: "Birva",
      lastName: "Patel",
      address: address3,
      skills: ["Drawing", "Painting", "Programming"],
      reviews: [review2],
      averageRating: 4.8,
      profilePicture: "https://i.imgur.com/19JB4HV.png",
    });

    const user4 = await User.create({
      username: "jferber",
      hashedPassword: hashedPassword,
      email: "jferber@stevens.edu",
      phoneNumber: "2015555555",
      firstName: "Justin",
      lastName: "Ferber",
      address: address4,
      skills: ["Construction", "Plumbing", "Electrical"],
      reviews: [review3],
      averageRating: 4.2,
      profilePicture: "https://i.imgur.com/19JB4HV.png",
    });

    const user5 = await User.create({
      username: "pputrevu",
      hashedPassword: hashedPassword,
      email: "pputrevu@stevens.edu",
      phoneNumber: "2015555555",
      firstName: "Prerana",
      lastName: "Putrevu",
      address: address5,
      skills: ["Drawing", "Painting"],
      reviews: [review4],
      averageRating: 4.6,
      profilePicture: "https://i.imgur.com/19JB4HV.png",
    });

    const comment1 = await Comment.create({
      userID: user1._id,
      username: user1.username,
      commentText: "This is a great post!",
    });

    const comment2 = await Comment.create({
      userID: user2._id,
      username: user2.username,
      commentText: "I agree!",
    });

    const comment3 = await Comment.create({
      userID: user3._id,
      username: user3.username,
      commentText: "I disagree!",
    });

    const comment4 = await Comment.create({
      userID: user4._id,
      username: user4.username,
      commentText: "I think this is a great idea!",
    });

    const comment5 = await Comment.create({
      userID: user5._id,
      username: user5.username,
      commentText: "I think this is a terrible idea!",
    });

    const post1 = await Post.create({
      posterID: user1._id,
      helperID: user2._id,
      category: "Construction",
      location: address1,
      skillsRequired: ["Construction", "Plumbing"],
      priority: "High",
      status: "Pending",
      description: "Need help fixing a leaky pipe",
      comments: [comment1, comment2],
      datePosted: new Date(),
      completeBy: new Date(2024, 11, 17),
      requestedUsers: [user2._id, user5._id],
    });

    const post2 = await Post.create({
      posterID: user2._id,
      helperID: user3._id,
      category: "Programming",
      location: address2,
      skillsRequired: ["Programming", "Electrical"],
      priority: "Medium",
      status: "In Progress",
      description: "Need help with a coding project",
      comments: [comment3, comment4],
      datePosted: new Date(),
      completeBy: new Date(2024, 11, 17),
      requestedUsers: [user3._id, user5._id],
    });

    const post3 = await Post.create({
      posterID: user3._id,
      helperID: user4._id,
      category: "Drawing",
      location: address3,
      skillsRequired: ["Drawing", "Painting", "Programming"],
      priority: "Low",
      status: "Completed",
      description: "Need help with a painting project",
      comments: [comment5],
      datePosted: new Date(),
      completeBy: new Date(2024, 11, 17),
      requestedUsers: [user4._id, user2._id],
    });

    const post4 = await Post.create({
      posterID: user4._id,
      helperID: user5._id,
      category: "Gardening",
      location: address4,
      skillsRequired: ["Gardening", "Landscaping"],
      priority: "High",
      status: "Pending",
      description: "Need help with planting flowers",
      comments: [comment5],
      datePosted: new Date(),
      completeBy: new Date(2024, 11, 17),
      requestedUsers: [user5._id, user2._id],
    });

    const post5 = await Post.create({
      posterID: user5._id,
      helperID: user1._id,
      category: "Painting",
      location: address5,
      skillsRequired: ["Painting", "Drawing"],
      priority: "Medium",
      status: "Pending",
      description: "Need help with painting a mural",
      comments: [comment4],
      datePosted: new Date(),
      completeBy: new Date(2024, 11, 17),
      requestedUsers: [user1._id, user2._id],
    });

    await User.findByIdAndUpdate(user1._id, {
      $push: {
        favorites: [user2._id, user3._id],
        tasksPosted: post1._id,
        tasksHelped: post5._id,
      },
    });

    await User.findByIdAndUpdate(user2._id, {
      $push: {
        favorites: [user1._id, user3._id],
        tasksPosted: post2._id,
        tasksHelped: post1._id,
      },
    });

    await User.findByIdAndUpdate(user3._id, {
      $push: {
        favorites: [user1._id, user2._id],
        tasksPosted: post3._id,
        tasksHelped: post2._id,
      },
    });

    await User.findByIdAndUpdate(user4._id, {
      $push: {
        favorites: [user1._id, user2._id],
        tasksPosted: post4._id,
        tasksHelped: post3._id,
      },
    });

    await User.findByIdAndUpdate(user5._id, {
      $push: {
        favorites: [user4._id, user2._id],
        tasksPosted: post5._id,
        tasksHelped: post4._id,
      },
    });

    console.log("Database seeded");
    await closeConnection();
  } catch (error) {
    console.log(error);
  }
}

seedDatabase();
