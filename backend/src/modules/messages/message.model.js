import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true, maxlength: 2000 },
  read: { type: Boolean, default: false, index: true },
  readAt: { type: Date, default: null },
  // For faster conversation queries
  conversationKey: { type: String, index: true }, // sorted from+to joined
}, { timestamps: true });

messageSchema.index({ from: 1, to: 1, createdAt: -1 });
messageSchema.index({ to: 1, read: 1 });
messageSchema.index({ conversationKey: 1, createdAt: -1 });

messageSchema.pre('save', function(next){
  if (!this.conversationKey) {
    const ids = [this.from.toString(), this.to.toString()].sort();
    this.conversationKey = ids.join('_');
  }
  next();
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
