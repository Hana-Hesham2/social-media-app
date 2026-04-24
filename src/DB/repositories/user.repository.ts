import { UpdateQuery } from "mongoose";
import {
    HydratedDocument, Model,
    PopulateOptions, ProjectionType,
    QueryFilter, QueryOptions, Types } from "mongoose";
import { AppError } from "../../common/utils/globalErrorHandler";
import userModel, { IUser } from "../models/user.model";
import BaseRepository from "./base.repository";

class UserRepository extends BaseRepository<IUser>
{
    constructor(protected readonly model: Model <IUser>= userModel){
        super(model);
    }

    
}
export default UserRepository;
