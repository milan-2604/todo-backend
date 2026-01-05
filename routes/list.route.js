const express = require("express");
const router = express.Router();

const userModel = require("../models/user.model");
const listModel = require("../models/list.model");
const authMiddleWare = require("../middlewares/authMiddleware");

//adding task
router.post("/addTask",authMiddleWare, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({
        message: "Title and Body cannot be empty",
      });
    }

    const task = await listModel.create({ title, body, user: req.user.id});

    await userModel.findOneAndUpdate(
      { _id: req.user.id},
      { $push: { list: task._id } }
    );
    res.status(201).json({
      task,
      message: "task added in list successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "something went wrong cant add task",
    });
  }
});

//updating task
router.put("/updateTask/:id", authMiddleWare ,async (req, res) => {
  try {
    const { title, body, } = req.body;

    if (!title && !body) {
      return res.status(400).json({
        message: "At least one field(Title or body) required",
      });
    }


    const updatedData = {};
    if (title) updatedData.title = title;
    if (body) updatedData.body = body;

    const updatedTask = await listModel.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id},
      updatedData,
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found or Unauthorized",
      });
    }
    res.status(200).json({
      updatedTask,
      message: "Task updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "something went wrong cant update task",
    });
  }
});

//get Tasks
router.get("/getTasks", authMiddleWare,async (req, res) => {
  try {
    const list = await listModel.find({ user: req.user.id }).sort({createdAt: -1});
    res.status(200).json({
      tasks: list,
      message: "Task fetching successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});


//delete task
router.delete('/deleteTask/:id',authMiddleWare,async (req,res)=>{
  try {
   const deletedTask = await listModel.findOneAndDelete({_id: req.params.id,user:req.user.id});
   if(!deletedTask){
    return res.status(404).json({
      message: "Task not found"
    })
   }
   await userModel.findOneAndUpdate({_id: req.user.id},{$pull: {list: req.params.id}});
   res.status(200).json({
    deletedTask,
    message: "task deleted successfully"
   })
      
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong"
    })
  }
})


module.exports = router;
