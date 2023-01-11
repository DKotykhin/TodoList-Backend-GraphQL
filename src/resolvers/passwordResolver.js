import bcrypt from 'bcrypt';

import UserModel from '../models/User.js';
import { checkAuth } from '../middlewares/checkAuth.js';
import { findUser } from '../middlewares/findUser.js';
import { userValidate } from '../validation/validation.js';

const createPasswordHash = async (password) => {
    const salt = await bcrypt.genSalt(5);
    const passwordHash = await bcrypt.hash(password, salt);
    return passwordHash
};

const passwordResolver = {

    userUpdatePassword: async ({ password }, context) => {
        const id = checkAuth(context.auth);
        const user = await findUser(id);

        await userValidate({ password });
        const isValidPass = await bcrypt.compare(password, user.passwordHash);
        if (isValidPass) {
            throw new Error("The same password!")
        }
        const passwordHash = await createPasswordHash(password);
        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: id },
            { passwordHash },
            { returnDocument: 'after' },
        );

        if (updatedUser) {
            return {
                status: true,
                message: "Password successfully updated",
            };
        } else {
            return {
                status: false,
                message: "Can't change password",
            };
        }
    },

    userConfirmPassword: async ({ password }, context) => {
        await userValidate({ password });
        const id = checkAuth(context.auth);
        const user = await findUser(id);

        const isValidPass = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPass) {
            return {
                status: false,
                message: "Wrong password!"
            }
        } else {
            return {
                status: true,
                message: 'Password confirmed'
            }
        }
    },
};

export default passwordResolver;
