import mongoose from 'mongoose';

const PasteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Content is required'],
        validate: {
            validator: function (v) {
                return v && v.trim().length > 0;
            },
            message: 'Content cannot be empty'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: null
    },
    maxViews: {
        type: Number,
        default: null
    },
    currentViews: {
        type: Number,
        default: 0
    }
});

// Prevent model recompilation in development
export default mongoose.models.Paste || mongoose.model('Paste', PasteSchema);
