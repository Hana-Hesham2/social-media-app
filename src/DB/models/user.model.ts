import mongoose, { Types } from "mongoose";
import { RoleEnum, GenderEnum, ProviderEnum } from "../../common/enum/user.enum";


export interface IUser {
    _id: Types.ObjectId,
    firstName: string,
    lastName: string,
    userName: string,
    email: string,
    password: string,
    cPassword?: string,
    age: number,
    phone?: string,
    address?: string,
    gender?: GenderEnum,
    role?: RoleEnum,
    confirmed?: boolean,
    createdAt: Date,
    updatedAt: Date,
    provider?: ProviderEnum

}

const userSchema = new mongoose.Schema<IUser>({
    firstName:{
     type: String,
     required: true,
     trim: true,
     minlength: 2,
     maxlength: 50
    },
    lastName: {
         type: String,
         required: true,
         trim: true,
         minlength: 2,
         maxlength: 50
        },
    email: {
         type: String,
         required: true,
         unique: true,
         trim: true
    },
    password: {
         type: String,
         required: function(): boolean { return this.provider == ProviderEnum.local ? true : false },
         minlength: 6,
         maxlength: 100
    },
    cPassword: {
         type: String,
         minlength: 6,
         maxlength: 100
    },
    age: {
         type: Number,
         required: function(): boolean { return this.provider == ProviderEnum.local ? true : false },
         min: 13,
         max: 90
        },
    phone: {
         type: String,
         trim: true
    },
    address: {
         type: String,
         trim: true
    },
    gender: {
         type: String,
         enum: Object.values(GenderEnum),
        default: GenderEnum.MALE
    },
    role: {
            type: String,
            enum: Object.values(RoleEnum),
            default: RoleEnum.USER
    },
    confirmed: {
        type: Boolean,
    },
    provider:{
        type: String,
         enum: Object.values(ProviderEnum),
        default: ProviderEnum.system
    }
},{
    timestamps: true,
    strictQuery: true,
    toJSON: {
        virtuals: true},
    toObject: {
        virtuals: true
    }    
});
userSchema.virtual("userName").get(function(this: IUser) {
    return this.firstName + " " + this.lastName;
}).set(function (val: string) {
    this.set ({firstName: val.split(" ")[0],lastName: val.split(" ")[1]}) });


const userModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default userModel;