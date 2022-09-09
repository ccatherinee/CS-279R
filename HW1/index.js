// Express is a node js web application framework 
// Require Express because it provides features for building web apps
// Returns a function reference
const express = require("express");
// returns the Express app 
const app = express(); 
// Needed to add .env file which keeps of confidential information like our DB_CONNECT string
const dotenv = require("dotenv");
dotenv.config();
// Need mongoose because it's node js's way of interacting with MongoDB
const mongoose = require("mongoose");
// Wrote a file specifying the todo task database model schems
// Import that file 
const TodoTask = require("./models/TodoTask");
// Tells app it needs to use the static files we've stored in public (such as our stylesheet)
app.use("/static", express.static("public"));
// required for POST requests to parse Request Objects of form application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Tries to connect to MongoDB
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () => {
    // logs to inform user when conenction is successful 
    console.log("Connected to db!"); 
    // attaches to specified host/port to bing/listen for connections 
    // then logs to inform user 
    app.listen(process.env.PORT, () => console.log("Server Up and running"));
});

// need view engine to be able to render web pages using the template files in view folder
// set view engine to ejs
app.set("view engine", "ejs")

// defines the GET request behavior: make the to-do list show up on the screen by finding all the existing tasks in the database and rendering them 
app.get("/", (req, res) => {
    TodoTask.find({}, (err, tasks) => {
        res.render("todo.ejs", { todoTasks: tasks});
    });
});

// we specify in the todo.ejs file that we submit a POST request everytime we add a new task and submit the form 
// therefore our POST request behavior is adding new tasks to the todo list
app.post('/', async (req, res) => {
    // using the TodoTask MongoDB model specified in models, create a new task with the text we put in the form 
    const todoTask = new TodoTask({
        content: req.body.content
    });
    try {
        // if the task is successfully saved to the database, reload the todo list where user will see the new task added 
        await todoTask.save();
        res.redirect("/");
    } catch (err) {
        // reload even if task is not successfully saved to database
        res.redirect("/");
    }
});

// handles the editing task feature on our todo list 
app 
    // adds id of the task we're editing to the url and gives to todoEdit which needs the id 
    .route("/edit/:id")
    
    .get((req, res) => {
        // gets the id of the task we're editing 
        const id = req.params.id;
        TodoTask.find({}, (err, tasks) => {
            // renders the todoEdit.ejs template where we single out the task with id == id 
            // make that task display differently 
            res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id});
        });
    })
    // once again, POST request handles when we submit the edit form 
    .post((req, res) => {
        const id = req.params.id;
        // find the task with the specified id and update the content with what was submitted on the form 
        TodoTask.findByIdAndUpdate(id, { content: req.body.content }, err => {
            // if there was an error with finding and updating, send error and reload todo list
            if (err) return res.send(500, err);
            res.redirect("/");
        })
    })

// handles removing task feature on our todo list 
app
    // updates urls accordingly 
    .route("/remove/:id")
    .get((req, res) => {
        // get id of the task we're trying to delete 
        const id = req.params.id;
        // find the task with specified id and remove it from the database 
        TodoTask.findByIdAndRemove(id, err => {
            if (err) return res.send(500, err);
            // reload the todo list where the user will not longer see that task because it's been removed from the database
            res.redirect("/");
        });
    });