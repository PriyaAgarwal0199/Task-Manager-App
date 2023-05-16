require('./db/mongoose.js')
const express = require('express');
const User = require('./models/users.js') 
const Task = require('./models/tasks.js')
const userRouter = require('./routers/users.js')
const taskRouter = require('./routers/tasks.js')
const app = express();

const port = process.env.PORT || 3000;
//express middleware before router but it should always in separate file for simplicity and clean coding
// app.use((req,res,next)=>{
//     res.status(503).send("Site under maintenance")
// })

app.use(express.json())

app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log(`Server is up on port ${port}`);
})