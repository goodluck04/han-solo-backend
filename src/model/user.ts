import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  avatar?: {
    public_id: string;
    url: string;
  };
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: { type: String },
    username: {
      type: String,
      required: [true, "Please enter your username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
    },
    phone: {
      type: String,
      required: [true, "Please enter your phone number"],
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 6 character"],
      required: true,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model("User", userSchema);
export default User;
