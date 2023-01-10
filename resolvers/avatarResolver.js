import fs from 'fs';

import UserModel from '../models/User.js';

import { checkAuth } from '../middlewares/checkAuth.js';
import { findUser } from '../middlewares/findUser.js';
import { userValidate } from '../validation/validation.js';

const avatarResolver = {

    uploadAvatar: async ({ avatarURL }, context) => {
        if (!avatarURL) {
            throw new Error("No data");
        };

        await userValidate({ avatarURL });
        const id = checkAuth(context.auth);

        const user = await UserModel.findOneAndUpdate(
            { _id: id },
            { avatarURL, },
            { returnDocument: 'after' },
        );
        if (!user) {
            throw new Error("Can't find user")
        }

        return {
            avatarURL: user.avatarURL,
            message: "Avatar URL successfully upload.",
        };
    },

    deleteAvatar: async ({ _id }, context) => {
        const id = checkAuth(context.auth);
        const user = await findUser(id);

        if (id === _id) {
            if (user.avatarURL) {
                fs.unlink("uploads/" + user.avatarURL.split('/')[2], async (err) => {
                    if (err) {
                        throw new Error("Can't delete avatar")
                    }
                });
                const updateUser = await UserModel.findOneAndUpdate(
                    { _id: id },
                    { avatarURL: '' },
                    { returnDocument: 'after' },
                );

                return {
                    avatarURL: updateUser.avatarURL,
                    message: "Avatar successfully deleted.",
                }

            } else {
                throw new Error("Avatar URL doesn't exist")
            }
        } else {
            throw new Error("Authification error")
        }
    }
}

export default avatarResolver;
