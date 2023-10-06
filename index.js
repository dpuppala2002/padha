const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// In-memory storage for registered users, user posts, and post IDs (you'd typically use a database).
const registeredUsers = {};
const userPosts = {};
let postIdCounter = 1;

app.use(bodyParser.json());

// User Sign-Up API Endpoint
app.post('/signup', (req, res) => {
  const { name, email } = req.body;

  // Check if email already exists
  if (registeredUsers[email]) {
    return res.status(400).json({ status: 400, message: "Email already registered." });
  }

  // Check if the email is in a valid format
  if (!isValidEmail(email)) {
    return res.status(400).json({ status: 400, message: "Invalid email format." });
  }

  // Register the user (you would typically store this in a database)
  registeredUsers[email] = { name, email };

  res.status(200).json({ status: 200, message: "Successful user sign-up." });
});

// Create Post API Endpoint
app.post('/createpost', (req, res) => {
  const { userId, content } = req.body;

  // Check if the user ID exists
  if (!registeredUsers[userId]) {
    return res.status(404).json({ status: 404, message: "User ID not found." });
  }

  // Check if the content is empty
  if (!content || content.trim() === '') {
    return res.status(400).json({ status: 400, message: "Content cannot be empty." });
  }

  // Store the post (you would typically store this in a database) and assign a unique post ID
  const postId = postIdCounter++;
  if (!userPosts[userId]) {
    userPosts[userId] = [];
  }
  userPosts[userId].push({ postId, content });

  res.status(200).json({ status: 200, message: "Successfully created." });
});

// Delete Post API Endpoint
app.delete('/deletepost/:postId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const userId = req.body.userId;

  // Check if the post ID exists
  if (!postExists(userId, postId)) {
    return res.status(404).json({ status: 404, message: "Post ID not found." });
  }

  // Check if the user is authorized to delete this post
  if (!isAuthorizedToDelete(userId, postId)) {
    return res.status(403).json({ status: 403, message: "Unauthorized to delete this post." });
  }

  // Delete the post (you would typically remove this from the database)
  deletePost(userId, postId);

  res.status(200).json({ status: 200, message: "Successful post deletion." });
});

// Fetch User's Posts API Endpoint
app.get('/userposts/:userId', (req, res) => {
  const userId = req.params.userId;

  // Check if the user ID exists
  if (!registeredUsers[userId]) {
    return res.status(404).json({ status: 404, message: "User ID not found." });
  }

  // Check if the user has any posts
  if (!userPosts[userId] || userPosts[userId].length === 0) {
    return res.status(404).json({ status: 404, message: "No posts found for this user." });
  }

  // Retrieve the user's posts
  const userPostsData = userPosts[userId];

  res.status(200).json({ status: 200, posts: userPostsData });
});

// Helper function to validate email format
function isValidEmail(email) {
  // This is a simple email format validation; you can use a library for more robust validation.
  return /\S+@\S+\.\S+/.test(email);
}

// Helper function to check if a post exists
function postExists(userId, postId) {
  return userPosts[userId] && userPosts[userId].some(post => post.postId === postId);
}

// Helper function to check if the user is authorized to delete a post
function isAuthorizedToDelete(userId, postId) {
  // For simplicity, let's assume the user can delete their own posts
  return userPosts[userId].some(post => post.postId === postId);
}

// Helper function to delete a post
function deletePost(userId, postId) {
  userPosts[userId] = userPosts[userId].filter(post => post.postId !== postId);
}

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

