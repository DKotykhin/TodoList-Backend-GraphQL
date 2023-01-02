import bcrypt from 'bcrypt';

import UserModel from '../models/User.js';
import { checkAuth } from '../middlewares/checkAuth.js';
import { userValidate } from '../validation/validation.js';

const createPasswordHash = async (password) => {
    const salt = await bcrypt.genSalt(5);
    const passwordHash = await bcrypt.hash(password, salt);
    return passwordHash
};

const passwordResolver = {    

    userUpdatePassword: async ({ password }, context) => {
        if (!password) {
            throw new Error("No data");
        };

        const id = checkAuth(context.auth);
        if (id) {
            const user = await UserModel.findById(id);
            if (!user) {
                throw new Error("Can't find user")
            }

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
            const { _id, email, name, avatarURL, createdAt } = updatedUser;

            return {
                id: _id, email, name, avatarURL, createdAt,
                message: `Password successfully updated`,
            };
        } else {
            throw new Error('No autorization data')
        }
    },

    userConfirmPassword: async ({ password }, context) => {
        if (!password) {
            throw new Error("No data");
        };

        const id = checkAuth(context.auth);
        if (id) {
            const user = await UserModel.findById(id);
            if (!user) {
                throw new Error("Can't find user")
            }

            await userValidate({ password });
            
            const isValidPass = await bcrypt.compare(password, user.passwordHash);
            if (!isValidPass) {
                return { status: false, message: "Wrong password!" }
            } else {
                return {
                    status: true,
                    message: 'Password confirmed'
                }
            }
        }
    },
};

export default passwordResolver;
