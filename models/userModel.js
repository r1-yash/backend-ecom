import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true

    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        default: 0 // 0 = User, 1 = Admin, we need to update db manually to convert a user into admin, using role = 0 to 1
    },

    
},{timestamps: true})

export default mongoose.model('users',userSchema);