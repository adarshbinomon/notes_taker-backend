const Note = require("../model/note.model");
const User = require("../model/user.model");
const jwt = require("jsonwebtoken");

const createAccount = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name) {
    return res
      .status(400)
      .json({ error: true, message: "full name is required" });
  }
  if (!email) {
    return res.status(400).json({ error: true, message: "email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "password is required" });
  }

  const isUser = await User.findOne({ name: name });

  if (isUser) {
    return res.json({
      error: true,
      message: "user already exists",
    });
  }

  const user = new User({
    name,
    email,
    password,
  });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "399060m",
  });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration Succesfull",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: true, message: "email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "password is required" });
  }

  const userInfo = await User.findOne({ email: email });

  if (!userInfo) {
    return res.status(400).json({ message: "user not found" });
  }

  if (userInfo.email === email && userInfo.password === password) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });

    return res.json({
      error: false,
      message: "login successful",
      email,
      accessToken,
    });
  } else {
    return res.status(400).json({
      error: true,
      message: "invalid credentials",
    });
  }
};

const addNote = async (req, res) => {
  const { title, content, tags } = req.body;

  const { user } = req.user;
  if (!title) {
    return res.status(400).json({ error: true, message: "title is required" });
  }
  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "content is required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });

    await note.save();

    return res
      .status(201)
      .json({ error: false, note, message: "note added successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "internal server error" });
  }
};

const editNote = async (req, res) => {
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;
  const { noteId } = req.params;

  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ error: true, message: "no changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "note not found" });
    }
    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "note updated",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "internal server error" });
  }
};

const getAllNotes = async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

    return res.json({
      error: false,
      notes,
      message: "all notes retrieved",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "internal server error",
    });
  }
};

const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const { user } = req.user;
  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res
        .status(404)
        .json({ error: true, message: "note doesnt exist" });
    }

    await Note.deleteOne({ _id: noteId, userId: user._id });

    return res.status(200).json({ error: false, message: "Note deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "internal server error" });
  }
};

const pinNote = async (req, res) => {
  const { noteId } = req.params;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "note not found" });
    }

    note.isPinned = !note.isPinned;

    await note.save();
    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {}
};

const getUser = async (req, res) => {
  const { user } = req.user;
  const isUser = await User.findOne({ _id: user._id });

  if (!isUser) {
    return res.sendStatus(401);
  }

  return res.json({
    user: isUser,
    message: "",
  });
};
module.exports = {
  createAccount,
  login,
  addNote,
  editNote,
  getAllNotes,
  deleteNote,
  pinNote,
  getUser,
};
