import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  vars: { type: Map, of: String, default: new Map() }
});
const TestModel = mongoose.model('Test', testSchema);

async function run() {
  const t = new TestModel();
  try {
    const data = { ...Object.fromEntries(t.vars) };
    console.log('Success:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit();
}
run();
