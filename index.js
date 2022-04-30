import express from "express";
import asyncHandler from "express-async-handler";
import morgan from "morgan";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();

app.use(morgan("dev"));
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

const dbPromise = open({
    filename: "data.db",
    driver: sqlite3.Database,
});

// GET ALL DATA
app.get("/", asyncHandler(async (req, res) => {
    const db = await dbPromise;
    const logs = await db.all("SELECT * FROM Logs");
    res.status(200).json({ data: logs });
}));

// ADD DATA
app.post("/create", asyncHandler(async (req, res) => {
    const db = await dbPromise;
    const { startDate, endDate, description } = req.body;

    if (!startDate || !endDate || !description)
        res.status(400).json({ data: "All field are mandetory!" });

    await db.run(
        "INSERT INTO Logs (startDate, endDate, description) VALUES(?, ?, ?);",
        startDate,
        endDate,
        description
    );
    res.status(201).json({ data: "Record added successfully." });
}));

// UPDATE DATA
app.post("/update", asyncHandler(async (req, res) => {
    const db = await dbPromise;
    const { id, startDate, endDate, description } = req.body;

    if (!startDate || !endDate || !description)
        res.status(400).json({ data: "All field are mandetory!" });

    // check for record
    const record = await db.get("SELECT * FROM Logs WHERE id = (?);", id);
    console.log(record);

    // response does not exists
    if (!record) res.status(404).json({ data: "Record not found!" });
    else {
        await db.run(
            "UPDATE Logs SET startDate = (?), endDate = (?), description = (?) WHERE id = (?)",
            startDate,
            endDate,
            description,
            id
        );
        res.status(200).json({ data: "Record updated successfully." });
    }
}));

// DELETE DATA
app.post("/delete", asyncHandler(async (req, res) => {
    const db = await dbPromise;
    const { id } = req.body;
    await db.run("DELETE FROM Logs WHERE id = (?);", id);
    res.status(200).json({ data: "Record deleted successfully." });
}));

const setup = async () => {
    const db = await dbPromise;
    await db.migrate();
    app.listen(process.env.PORT || 5000, () => {
        console.log("listening on localhost:5000");
    });
};
setup();
