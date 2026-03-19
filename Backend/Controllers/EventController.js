import Event from "../Models/EventSchema.js";
import Category from "../Models/CategorySchema.js";

// Get a single event by ID
export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id).populate("category", "name");
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new event
export const createEvent = async (req, res) => {
    try {
        const { name, description, category, people, place } = req.body;
        const image = req.file ? req.file.path.replace(/\\/g, "/") : req.body.image; // Handle file upload or URL

        if (!name || !description || !category || !people || !image || !place) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newEvent = new Event({
            name,
            description,
            image,
            category,
            people,
            place
        });

        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all events
export const getEvents = async (req, res) => {
    try {
        const events = await Event.find().populate("category", "name"); // Populate category name
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get events by Category ID
export const getEventsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const events = await Event.find({ category: categoryId }).populate("category", "name");
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete an event
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await Event.findByIdAndDelete(id);
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an Event
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, people, place } = req.body;
        let updateData = { name, description, category, people, place };

        if (req.file) {
            updateData.image = req.file.path.replace(/\\/g, "/");
        }

        const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
