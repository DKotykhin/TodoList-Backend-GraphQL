import { GraphQLError } from 'graphql';

import TaskModel from '../models/Task.js';

import { checkAuth } from '../middlewares/checkAuth.js';
import { taskValidate } from '../validation/validation.js';

class TaskService {
    async get(params, token) {
        const id = checkAuth(token);

        const { limit, page, tabKey, sortField, sortOrder, search } = params;        

        const tasksOnPage = limit > 0 ? limit : 6;
        const parsePage = page > 0 ? page : 1;
        const parseSortOrder = sortOrder === -1 ? -1 : sortOrder === 1 ? 1 : -1;
        console.log(parseSortOrder)

        let sortKey;
        switch (sortField) {
            case 'createdAt': sortKey = { createdAt: parseSortOrder }
                break;
            case 'deadline': sortKey = { deadline: parseSortOrder }
                break;
            case 'title': sortKey = { title: parseSortOrder }
                break;
            default: sortKey = { createdAt: -1 }
        };

        let taskFilter = { author: id };
        if (tabKey === 1) taskFilter = { ...taskFilter, completed: false };
        if (tabKey === 2) taskFilter = { ...taskFilter, completed: true };
        if (search) taskFilter =
            { ...taskFilter, title: { $regex: search, $options: 'i' } };

        const totalTasksQty = (await TaskModel.find(taskFilter)).length;
        const totalPagesQty = Math.ceil(totalTasksQty / tasksOnPage);

        const tasks = await TaskModel.find(taskFilter, {
            _id: true,
            title: true,
            subtitle: true,
            description: true,
            completed: true,
            createdAt: true,
            deadline: true
        }).sort(sortKey).limit(tasksOnPage).skip((parsePage - 1) * tasksOnPage);

        const tasksOnPageQty = tasks.length;

        return { totalTasksQty, totalPagesQty, tasksOnPageQty, tasks };
    }

    async create(data, token) {
        await taskValidate(data);
        const id = checkAuth(token);
        const { title, subtitle, description, completed, deadline } = data;

        const doc = new TaskModel({
            title,
            subtitle,
            description,
            completed,
            deadline,
            author: id
        });
        const task = await doc.save();

        return task;
    }

    async update(data, token) {
        await taskValidate(data);
        const id = checkAuth(token);
        const { title, subtitle, description, _id, completed, deadline } = data;

        const updatedTask = await TaskModel.findOneAndUpdate(
            { _id, author: id },
            {
                $set: {
                    title,
                    subtitle,
                    description,
                    completed,
                    deadline
                }
            },
            { returnDocument: 'after' },
        );
        if (!updatedTask) {
            throw new GraphQLError("Modified forbidden")
        };

        return updatedTask;
    }

    async delete(_id, token) {
        const id = checkAuth(token);

        const taskStatus = await TaskModel.deleteOne({ _id, author: id });
        if (!taskStatus.deletedCount) {
            throw new GraphQLError("Deleted forbidden")
        }

        return taskStatus;
    }
}

export default new TaskService;