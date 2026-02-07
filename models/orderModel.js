import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        itemStatus: {
          type: String,
          enum: ["Ordered", "Cancelled", "Returned", "Delivered"],
          default: "Ordered",
        },
      },
    ],

    timeline: [
      {
        status: {
          type: String,
          required: true,
        },
        updatedBy: {
          type: String, // User | Admin | System
          default: "System",
        },
        remark: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      default: "COD",
    },

    paymentStatus: {
      type: String,
      default: "Pending",
    },

    refundStatus: {
      type: String,
      enum: ["None", "Initiated", "Completed"],
      default: "None",
    },

    orderStatus: {
      type: String,
      default: "Processing",
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
    },

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      addressLine1: {
        type: String,
        required: true,
      },
      addressLine2: {
        type: String,
      },
      landmark: {
        type: String,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        default: "India",
      },
    },

    returnStatus: {
      type: String,
      enum: ["None", "Requested", "Approved", "Rejected"],
      default: "None",
    },
    returnReason: {
      type: String,
    },
    cancelReason: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("orders", orderSchema);
