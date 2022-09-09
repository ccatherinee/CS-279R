// use mongoose library to interact with MongoDB
const mongoose = require('mongoose');
// define a new schema 
// defines how a todo task is stored in teh database 
const todoTaskSchema = new mongoose.Schema({
    // each task is defined by a string that is the task name
    content: {
        type: String, 
        required: true
    }, 
    // and the date 
    date: {
        type: Date,
        default: Date.now
    }
})
// Export this model so we can use it in index.js
module.exports = mongoose.model('TodoTask', todoTaskSchema);