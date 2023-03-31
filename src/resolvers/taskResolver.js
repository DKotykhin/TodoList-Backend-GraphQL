import taskService from '../service/taskService.js';

const taskResolver = {

    getTasks: async ({ paramsInput }, context) => {
        const tasksData = await taskService.get(paramsInput, context.auth);

        return tasksData;
    },

    createTask: async ({ createTaskInput }, context) => {
        const newTask = await taskService.create(createTaskInput, context.auth);

        return {
            ...newTask._doc,
            message: 'Task successfully created'
        };
    },

    updateTask: async ({ updateTaskInput }, context) => {
        const updatedTask = await taskService.update(updateTaskInput, context.auth);

        return {
            ...updatedTask._doc,
            message: 'Task successfully updated'
        };
    },

    deleteTask: async ({ _id }, context) => {
        const status = await taskService.delete(_id, context.auth)

        return {
            status,
            message: 'Task successfully deleted'
        }
    },
}

export default taskResolver;