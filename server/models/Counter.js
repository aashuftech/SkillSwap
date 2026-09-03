import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

// Atomically returns the next value for `key` and persists it, so IDs are
// unique and monotonically increasing even under concurrent signups.
// Deleting a user never decrements this, so a freed number is never reissued.
export async function nextSequence(key) {
  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return counter.seq;
}

export async function currentSequence(key) {
  const counter = await Counter.findById(key);
  return counter?.seq || 0;
}

export async function setSequenceIfHigher(key, value) {
  await Counter.findOneAndUpdate(
    { _id: key },
    { $max: { seq: value } },
    { upsert: true },
  );
}

export default Counter;
