const express = require('express')
const mongoose = require('mongoose')
const Task = require('../models/tasks')
const auth = require('../middleware/auth')
const router = new express.Router();

router.post('/tasks',auth,async (req,res)=>{
    const task = new Task(
        {
            ...req.body,
            owner: req.user._id
        })
    try{
    await task.save()
    res.status(201).send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.get('/getTasks',auth,async (req,res)=>{
    try{
    
    const match = {}
    const sort = {}
    //for filtering
    if(req.query.completed){
        match.completed = req.query.completed==="true"
    }
    //for sorting
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1]==="desc"?-1 : 1
    }
    await req.user.populate({
        path:'tasks',
        match,
        options:{
           limit: parseInt(req.query.limit),
           skip: parseInt(req.query.skip),
           sort
        }
    })
    res.status(200).send({"tasks":req.user.tasks})
    }
    catch(e){
    res.status(500).send(e)
    }
})

router.get('/task/:id',auth,async(req,res)=>{
    try{
        
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        
        if(!task){
            res.status(404).send()
        }
        res.send(task)
    }
    catch(e){
        res.status(500).send()
    }
})

router.patch('/updateTask/:id',auth,async (req,res)=>{
    const allowedUpdateFields = ["description","completed"];
    const updates = Object.keys(req.body)
    const isValid = updates.every(update => allowedUpdateFields.includes(update))
    
    if(!isValid)
    return res.status(404).send({"error":"Invalid updates!!!"})

    try{
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        
        if(!task)
        return res.status(404).send()
        updates.forEach(update => task[update] = req.body[update]);

        await task.save()
        res.send(task)
    }
    catch(e){
        res.status(500).send(e)
    }

})

router.delete('/taskDelete/:id', auth,async (req,res)=>{
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        
        if(!task)
        return res.status(404).send()

        res.send(task)
    }
    catch(e){
        res.status(500).send(e)
    }
})


module.exports = router;