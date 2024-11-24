import mongoose from 'mongoose';
import orderModel from "../../models/orderModel.js";

const getMonthlySales = async (req, res) => {
    try {
        // Get the current date to filter the orders
        const currentDate = new Date();
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1); // Start of this year
        const endOfYear = new Date(currentDate.getFullYear(), 11, 31); // End of this year

        // Aggregate the sales per seller per month
        const salesData = await orderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfYear, $lte: endOfYear }, // Filter by year range
                    orderStatus: { $in: ['Delivered', 'Processing'] } // Include only relevant statuses
                }
            },
            {
                $unwind: "$products" // Unwind the products array to access individual products
            },
            {
                $project: {
                    year: { $year: "$createdAt" }, // Extract the year from the createdAt field
                    month: { $month: "$createdAt" }, // Extract the month from the createdAt field
                    discountPrice: "$products.discountPrice", // Project the discountPrice field
                    seller: "$products.seller", // Include the seller ID
                    sellerName: "$sellerInfo.name" // Assuming seller name is stored in "name"
                }
            },
            {
                $group: {
                    _id: { 
                        year: "$year", 
                        month: "$month", 
                        seller: "$seller" // Group by year, month, and seller
                    },
                    totalSales: { $sum: "$discountPrice" } // Sum the discountPrice for each month
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 } // Sort by year and month
            }
        ]);

        // If no sales data is found for the seller in the current year
        if (salesData.length === 0) {
            return res.status(200).json({ message: "No sales data found for this seller in the current year." });
        }

        // Send the result with total sales for each seller per month
        return res.status(200).json({ salesData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export default getMonthlySales;
