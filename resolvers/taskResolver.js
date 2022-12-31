import TaskModel from '../models/Task.js';
import { checkAuth } from '../middlewares/checkAuth.js';
import { taskValidate } from '../validation/validation.js';

const taskResolver = {

    getTasks: async (_, context) => {
        const id = checkAuth(context.auth);

        if (id) {
            const tasksOnPage = context.query.limit > 0 ? context.query.limit : 0;
            const pageNumber = context.query.page > 0 ? context.query.page : 1;

            let taskFilter = { author: id };
            if (context.query.tabKey === '1') taskFilter = { ...taskFilter, completed: false };
            if (context.query.tabKey === '2') taskFilter = { ...taskFilter, completed: true };
            if (context.query.search) taskFilter =
                { ...taskFilter, title: { $regex: context.query.search, $options: 'i' } };

            let sortKey = { createdAt: 1 };
            switch (context.query.sortField) {
                case 'createdAt': sortKey = { createdAt: context.query.sortOrder }
                    break;
                case 'deadline': sortKey = { deadline: context.query.sortOrder }
                    break;
                case 'title': sortKey = { title: context.query.sortOrder }
                    break;
                default: sortKey = { createdAt: 1 }
            };

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
            }).sort(sortKey).limit(tasksOnPage).skip((pageNumber - 1) * tasksOnPage);

            const tasksOnPageQty = tasks.length;

            return {
                totalTasksQty, totalPagesQty, tasksOnPageQty, tasks
            };
        }
    },

    createTask: async ({ createTaskInput }, context) => {
        const id = checkAuth(context.auth);
        await taskValidate(createTaskInput);
        if (id) {
            const { title, subtitle, description, completed, deadline } = createTaskInput;
            const doc = new TaskModel({
                title,
                subtitle,
                description,
                completed,
                deadline,
                author: id
            });
            const task = await doc.save();
            const { _id, createdAt } = task;

            return {
                _id, title, subtitle, description, completed, createdAt, deadline,
                message: 'Task successfully created'
            };

        } else {
            throw new Error('No autorization data')
        }
    },

    updateTask: async ({ updateTaskInput }, context) => {
        const id = checkAuth(context.auth);
        await taskValidate(updateTaskInput);
        if (id) {
            const { title, subtitle, description, _id, completed, deadline } = updateTaskInput;

            const status = await TaskModel.updateOne(
                { _id, author: id },
                {
                    $set: {
                        title,
                        subtitle,
                        description,
                        completed,
                        deadline
                    }
                }
            );

            if (!status.modifiedCount) {
                throw new Error("Modified forbidden")
            }

            return {
                status,
                message: 'Task successfully updated'
            };

        } else {
            throw new Error('No autorization data')
        }
    },

    deleteTask: async ({ deleteTaskInput }, context) => {
        const id = checkAuth(context.auth);
        const { _id } = deleteTaskInput;

        const status = await TaskModel.deleteOne({ _id, author: id });
        if (!status.deletedCount) {
            throw new Error("Deleted forbidden")
        }

        return {
            status,
            message: 'Task successfully deleted'
        }
    },
}

export default taskResolver;