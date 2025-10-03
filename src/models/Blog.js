const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        body: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // reference User model
            required: true,
        },
        state: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },
        read_count: {
            type: Number,
            default: 0,
        },
        reading_time: {
            type: String, 
        },
    },
    { timestamps: true }
);

// Utility function to estimate reading time before saving
BlogSchema.pre("save", function (next) {
    if (this.body) {
        const wordsPerMinute = 200; 
        const words = this.body.split(" ").length;
        const minutes = Math.ceil(words / wordsPerMinute);
        this.reading_time = `${minutes} min read`;
    }
    next();
});


module.exports =
    mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
