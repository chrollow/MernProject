import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import UserModel from "../models/userModel.js";import JWT from 'jsonwebtoken'; // Ensure this line is present


const requireSignIn = asyncHandler(async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: "JWT must be provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user information to the request
        req.user = await UserModel.findById(decoded._id);

        if (!req.user || req.user.role !== 0) {
            return res.status(401).json({ message: "Unauthorised User" });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: "JWT must be provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded);

        // Attach user information to the request
        req.user = await UserModel.findById(decoded._id);
        // console.log(req.user);
        if (!req.user || req.user.role !== 1) {
            return res
                .status(403)
                .json({ message: "Access denied. Admin privileges required." });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});


const protect = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        console.log('No token provided');
        return res.status(401).send({ success: false, message: 'No token, authorization denied' });
    }

    console.log('Token received:', token);  // Log the token to verify

    try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded:', decoded);  // Log the decoded token to check its contents
        req.user = decoded; // Attach decoded user to req.user
        next();
    } catch (err) {
        console.log('Token verification failed:', err.message);
        return res.status(401).send({ success: false, message: 'Token is not valid' });
    }
};

export default protect;


export { requireSignIn, isAdmin };
// import JWT from "jsonwebtoken";
// import userModel from "../models/userModel.js";
// import asyncHandler from "express-async-handler";

// //Protected routes token based
// export const requireSignIn = asyncHandler(async (req, res, next) => {
//     try {
//         const token = req.headers?.authorization;
//         // console.log(token);
//         if (!token) {
//             return res.status(401).send({
//                 success: false,
//                 message: "JWT must be provided",
//                 ok: false,
//             });
//         }
//         const decode = JWT.verify(token, process.env.JWT_SECRET);
//         // Set the user information given in token payload
//         req.user = decode;
//         next();
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             success: false,
//             message: "Invalid JWT",
//         });
//     }
// });

// //ADMIN access
// export const isAdmin = asyncHandler(async (req, res, next) => {
//     try {
//         const user = await userModel.findById(req.user._id);
//         if (user.role !== 1) {
//             return res.status(401).send({
//                 success: false,
//                 message: "User is not Admin",
//                 ok: false,
//             });
//         }
//         next();
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             success: false,
//             error,
//             message: "Error in admin middleware",
//         });
//     }
// });
