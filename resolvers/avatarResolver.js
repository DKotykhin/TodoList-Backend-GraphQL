import fs from 'fs';

import { checkAuth } from '../middlewares/checkAuth.js';
import { userValidate } from '../validation/validation.js';

import UserModel from '../models/User.js';

const avatarResolver = {

    uploadAvatar: async ({ avatarInput }, context) => {
        if (Object.keys(avatarInput).length === 0) {
            throw new Error("No data");
        };

        await userValidate(avatarInput);
        const id = checkAuth(context.auth);
        const { avatarURL } = avatarInput;

        if (id) {
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
        } else {
            throw new Error('No autorization data')
        }
    },

    deleteAvatar: async (_, context) => {
        const id = checkAuth(context.auth);

        if (id) {
            const user = await UserModel.findById(id);
            if (!user) {
                throw new Error("Can't find user")
            }
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
                };

            } else {
                throw new Error("Avatar URL doesn't exist")
            }

        } else {
            throw new Error('No autorization data')
        }
    }
}

export default avatarResolver;
