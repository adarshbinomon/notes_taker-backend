const express = require("express");
const {
  createAccount,
  login,
  addNote,
  editNote,
  getAllNotes,
  deleteNote,
  pinNote,
  getUser,
} = require("../controller/controller");
const { authenticateToken } = require("../utilities");
const route = express();

route.get("/", (req, res) => {
  res.json({ data: "hello" });
});

//create-account
route.post("/create-account", createAccount);

//login
route.post("/login", login);

//get user
route.get("/get-user", authenticateToken, getUser);

//add note
route.post("/add-note", authenticateToken, addNote);

//edit note
route.post("/edit-note/:noteId", authenticateToken, editNote);

//get all notes
route.get("/get-all-notes", authenticateToken, getAllNotes);

//delete note
route.delete("/delete-note/:noteId", authenticateToken, deleteNote);

//update pin status
route.put("/pin-note/:noteId", authenticateToken, pinNote);

module.exports = route;
