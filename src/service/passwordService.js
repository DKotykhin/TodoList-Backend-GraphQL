import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';

import UserModel from '../models/User.js';

import { checkAuth } from '../middlewares/checkAuth.js';
import { userValidate } from '../validation/validation.js';

import { findUser } from '../utils/findUser.js';
import { createPasswordHash } from '../utils/createPasswordHash.js';

class PasswordService {
    async confirmPassword(password, token) {
        await userValidate({ password });
        const _id = checkAuth(token);
        const user = await findUser(_id);

        const isValidPass = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPass) {
            return {
                status: false,
                message: "Wrong password!"
            }
        } else return {
            status: true,
            message: 'Password confirmed'
        }
    }

    async updatePassword(password, token) {
        await userValidate({ password });

        const _id = checkAuth(token);
        const user = await findUser(_id);

        const isValidPass = await bcrypt.compare(password, user.passwordHash);
        if (isValidPass) {
            throw new GraphQLError("The same password!")
        }
        const passwordHash = await createPasswordHash(password);
        const updatedUser = await UserModel.findOneAndUpdate(
            { _id },
            { passwordHash },
            { returnDocument: 'after' },
        );
        if (!updatedUser) {
            throw new GraphQLError("Can't change password")
        }
        return updatedUser;
    }
}

export default new PasswordService;