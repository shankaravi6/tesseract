import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect(process.env.MONGO_URL_LOCAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createDynamicModel = (collectionName) => {
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }

  const schema = new mongoose.Schema(
    {
      createdDate: { type: Date, default: Date.now },
      updatedDate: { type: Date, default: Date.now },
    },
    { strict: false }
  );

  schema.pre("save", function (next) {
    this.updatedDate = Date.now();
    next();
  });

  schema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedDate: Date.now() });
    next();
  });

  return mongoose.model(collectionName, schema, collectionName);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads/")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY,
});

app.post("/api/data/:collection", upload.any(), async (req, res) => {
  const { collection } = req.params;
  const model = createDynamicModel(collection);

  try {
    let dynamicFields = req.body;
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        dynamicFields[file.fieldname] = file.filename;
      });
    }
    const newData = new model(dynamicFields);
    await newData.save();
    res.status(201).json({ status: true, data: newData });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to add data" });
  }
});

app.put("/api/data/:collection/:id", upload.any(), async (req, res) => {
  const { collection, id } = req.params;
  const model = createDynamicModel(collection);

  try {
    let dynamicFields = req.body;
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        dynamicFields[file.fieldname] = file.filename;
      });
    }

    const updatedData = await model.findByIdAndUpdate(id, dynamicFields, { new: true });
    if (updatedData) {
      res.json({ status: true, data: updatedData });
    } else {
      res.status(404).json({ status: false, error: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to update data" });
  }
});

app.patch("/api/data/:collection/:id", upload.any(), async (req, res) => {
  const { collection, id } = req.params;
  const model = createDynamicModel(collection);

  try {
    let dynamicFields = req.body;
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        dynamicFields[file.fieldname] = file.filename;
      });
    }

    const updatedData = await model.findByIdAndUpdate(id, { $set: dynamicFields }, { new: true });
    if (updatedData) {
      res.json({ status: true, data: updatedData });
    } else {
      res.status(404).json({ status: false, error: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to update data" });
  }
});


app.get("/api/data/:collection", async (req, res) => {
  const { collection } = req.params;
  const model = createDynamicModel(collection);

  try {
    const data = await model.find();
    res.json({ status: true, data });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to fetch data" });
  }
});

app.get("/api/data/:collection/:id", async (req, res) => {
  const { collection, id } = req.params;
  const model = createDynamicModel(collection);

  try {
    const data = await model.findById(id);
    if (data) {
      res.json({ status: true, data });
    } else {
      res.status(404).json({ status: false, error: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to fetch data" });
  }
});

app.delete("/api/data/:collection/:id", async (req, res) => {
  const { collection, id } = req.params;
  const model = createDynamicModel(collection);

  try {
    const deletedData = await model.findByIdAndDelete(id);
    if (deletedData) {
      res.json({ status: true, message: "Data deleted successfully" });
    } else {
      res.status(404).json({ status: false, error: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to delete data" });
  }
});

app.post("/api/gen-fields", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ status: false, error: "Prompt is required" });
  }

  const modPrompt = `${prompt} genereate fields, make sure just need fields and type. Types are only Text, Long Text, Media, Select, Checkbox, Autocomplete, Date. Maximum 5 fields only. Retrun a string with Array like Field Name, Field Type, Make sure if add Select, Checkbox, Autocomplete must have options return with comma like [{"name": "name", "type": "Text"}, {"name": "age", "type": "Text"}, {"name": "gender", "type": "Select", "options": ["Male", "Female", "Other"], "type": "Checkbox", "options": ["Male", "Female", "Other"], "type": "Autocomplete", "options": ["Male", "Female", "Other"]]`
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      store: true,
      messages: [{ role: "user", content: modPrompt }],
    });
    const generatedText = completion.choices[0].message;
    res.json({ status: true, data: generatedText });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to generate description" });
  }
});


const PORT = 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
