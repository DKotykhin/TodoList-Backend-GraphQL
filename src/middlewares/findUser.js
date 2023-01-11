import UserModel from '../models/User.js';

export const findUser = async (id) => {
    const user = await UserModel.findById(id);
        if (!user) {
            throw new Error("Can't find user")
        }
    return user;
}