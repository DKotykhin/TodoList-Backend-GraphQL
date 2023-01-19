import userService from '../service/userService.js';
import avatarService from '../service/avatarService.js';
import passwordService from '../service/passwordService.js';

const userResolver = {

    getUserByToken: async (_, context) => {
        const user = await userService.loginByToken(context.auth);
        const { _id, email, name, createdAt, avatarURL } = user;

        return {
            _id, email, name, createdAt, avatarURL,
            message: `User ${name} successfully logged via token`,
        };
    },

    userRegister: async ({ registerInput }) => {
        const user = await userService.register(registerInput);
        const { user: { _id, email, name, createdAt }, token } = user;

        return {
            _id, email, name, createdAt, token,
            message: `User ${name} successfully created`,
        };
    },

    userLogin: async ({ email, password }) => {
        const user = await userService.login({ email, password })
        const { user: { _id, name, avatarURL, createdAt }, token } = user;

        return {
            _id, email, name, avatarURL, createdAt, token,
            message: `User ${name} successfully logged`
        };
    },

    userUpdateName: async ({ name }, context) => {
        const updatedUser = await userService.updateName(name, context.auth);
        const { _id, email, avatarURL, createdAt } = updatedUser;

        return {
            _id, email, name, avatarURL, createdAt,
            message: `User ${name} successfully updated`,
        };
    },

    userUpdatePassword: async ({ password }, context) => {
        const updatedUser = await passwordService.updatePassword(password, context.auth);

        if (updatedUser) {
            return {
                status: true,
                message: "Password successfully updated",
            };
        }
    },

    userConfirmPassword: async ({ password }, context) => {
        const status = await passwordService.confirmPassword(password, context.auth);

        return status;
    },

    userDelete: async ({ _id }, context) => {
        const status = await userService.delete(_id, context.auth);

        return {
            ...status,
            message: 'User successfully deleted'
        };
    },

    uploadAvatar: async ({ avatarURL }, context) => {        
        const user = await avatarService.uploadUrl(avatarURL, context.auth);

        return {
            avatarURL: user.avatarURL,
            message: "Avatar URL successfully upload.",
        };
    },

    deleteAvatar: async ({ _id }, context) => {        
        const updatedUser = await avatarService.delete(_id, context.auth);
        const { avatarURL } = updatedUser;

        return {
            avatarURL,
            message: "Avatar successfully deleted.",
        }
    }

};

export default userResolver;
