// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// 1. Create Task
router.post('/', auth, async (req, res) => {
    try {
        console.log("req.user =", req.user);
        console.log("req.body =", req.body);

        const newTask = new Task({
            ...req.body,
            user: req.user
        });

        const task = await newTask.save();

        res.status(201).json(task);
    } catch (err) {
        console.error("TASK ERROR:", err);

        res.status(500).json({
            error: err.message,
            stack: err.stack
        });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user });
        res.json(tasks);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 3. Update Task
router.put('/:id', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        if (task.user.toString() !== req.user) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        task = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(task);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        if (task.user.toString() !== req.user) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await task.deleteOne();
        res.json({ msg: 'Task removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;