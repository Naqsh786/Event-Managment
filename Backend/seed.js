import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Category from "./Models/CategorySchema.js";
import Event from "./Models/EventSchema.js";
import Slide from "./Models/SlideSchema.js";
import User from "./Models/UserSchema.js";

// Load env vars
dotenv.config();

const mongoUri = process.env.DATABASE;

const categoriesList = ["Weddings", "Corporate Events", "Birthdays", "Concerts"];

const eventImages = {
  "Weddings": [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1532712938736-5e153d04fc5a?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
  ],
  "Corporate Events": [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1475721028070-2051152a55fb?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560523159-4a9692d222f9?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?q=80&w=1932&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
  ],
  "Birthdays": [
    "https://images.unsplash.com/photo-1530103862676-de3c9de59f9e?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?q=80&w=2102&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472653431158-6364773b2a56?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1561571994-3f61115de23a?q=80&w=2070&auto=format&fit=crop"
  ],
  "Concerts": [
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540039155732-6761b54f228a?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470229722913-7c092bce8041?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493225457224-fa305cb79c4a?q=80&w=2070&auto=format&fit=crop"
  ]
};

const eventDetails = {
    "Weddings": [
        { name: "Grand Royal Wedding Celebration", desc: "A spectacular royal-themed wedding setup with breathtaking floral decorations, elegant drapery, and premium seating arrangements that promise an unforgettable evening of love and celebration." },
        { name: "Elegant Beachside Matrimony", desc: "Experience the magic of a sunset beach wedding featuring romantic fairy lights, a serene ocean backdrop, and a beautifully arranged aisle right on the pristine sands." },
        { name: "Classic Botanical Garden Wedding", desc: "An outdoor botanical garden wedding that blends natural scenic beauty with rustic elegance, featuring vintage decor and a stunning floral archway." },
        { name: "Luxury Palace Destination Wedding", desc: "A luxurious destination wedding set in a historic palace, offering guests a majestic experience complete with traditional music, exquisite cuisine, and opulent surroundings." },
        { name: "Intimate Vineyard Nuptials", desc: "Celebrate love in a serene vineyard setting with an intimate gathering, featuring wine tasting, farm-to-table dining, and rustic-chic decorations." },
        { name: "Modern City Rooftop Wedding", desc: "A chic and contemporary rooftop wedding offering panoramic city skyline views, modern minimalist decor, and a sophisticated evening reception." },
        { name: "Fairytale Winter Wonderland Wedding", desc: "Step into a magical winter wonderland wedding with ice sculptures, crystal chandeliers, and a snowy aesthetic that brings a fairytale to life." },
        { name: "Tropical Resort Wedding", desc: "A vibrant tropical wedding celebration at a luxury resort, complete with exotic flowers, a live island band, and a relaxing, joyful atmosphere." },
        { name: "Vintage Glamour Wedding Gala", desc: "A glamorous vintage-style wedding inspired by the roaring twenties, featuring classic cars, jazz music, and elegant art deco designs." },
        { name: "Romantic Lakeside Wedding", desc: "A peaceful and romantic lakeside wedding ceremony with a private boat arrival, stunning water reflections, and an unforgettable evening under the stars." }
    ],
    "Corporate Events": [
        { name: "Global Tech Innovators Summit", desc: "An exclusive annual tech conference bringing together industry leaders, featuring inspiring keynote speakers, groundbreaking product launches, and unparalleled networking opportunities." },
        { name: "Annual Business Excellence Gala", desc: "A prestigious corporate award ceremony and formal dinner honoring top executives and outstanding partners for their remarkable achievements." },
        { name: "Future of Marketing Masterclass", desc: "An intensive corporate masterclass focusing on the latest digital marketing trends, strategies, and interactive workshops for forward-thinking professionals." },
        { name: "Executive Leadership Retreat", desc: "A high-level leadership retreat designed for CEOs and executives, focusing on strategic planning, team building, and wellness in a luxurious remote setting." },
        { name: "Startup Pitch & Networking Night", desc: "A dynamic evening where innovative startups pitch their ideas to angel investors and venture capitalists, followed by a vibrant networking mixer." },
        { name: "Corporate Sustainability Conference", desc: "A critical industry conference discussing green business practices, sustainable operations, and the future of corporate environmental responsibility." },
        { name: "International Trade & Investment Expo", desc: "A massive corporate exhibition connecting global manufacturers, suppliers, and investors to foster international trade and business growth." },
        { name: "Women in Business Symposium", desc: "An empowering corporate symposium celebrating female leaders, featuring panel discussions, mentorship sessions, and keynote addresses." },
        { name: "FinTech Innovations Forum", desc: "A premier gathering of financial technology experts exploring the future of banking, cryptocurrency, and digital payment solutions." },
        { name: "Corporate Team Building Extravaganza", desc: "An engaging and interactive corporate team-building event filled with problem-solving challenges, outdoor activities, and collaborative exercises." }
    ],
    "Birthdays": [
        { name: "Sweet 16 Glamour Extravaganza", desc: "A glamorous and unforgettable Sweet 16 birthday party featuring a live DJ, an expansive dance floor, a stunning custom cake, and a VIP photo booth." },
        { name: "Kids Superhero Training Camp", desc: "An action-packed kids birthday party where children meet their favorite superhero mascots, play interactive games, and complete fun training courses." },
        { name: "Milestone 50th Golden Jubilee", desc: "A sophisticated and elegant 50th birthday celebration honoring half a century of memories with fine dining, classic music, and heartfelt speeches." },
        { name: "Enchanted Princess Castle Party", desc: "A magical princess-themed birthday for kids featuring royal decorations, princess character appearances, face painting, and a fairytale cake." },
        { name: "Neon Glow-in-the-Dark Dance Party", desc: "A high-energy neon birthday party with glow sticks, blacklights, upbeat music, and neon body paint for an electrifying night." },
        { name: "Surprise 30th Rooftop Bash", desc: "An epic surprise 30th birthday bash held on a stylish city rooftop, complete with signature cocktails, a live band, and breathtaking views." },
        { name: "Tropical Luau Birthday Fiesta", desc: "A fun-filled tropical luau birthday party featuring Hawaiian dancers, fire performers, exotic fruit displays, and tropical mocktails." },
        { name: "Retro 80s Disco Birthday Night", desc: "Travel back in time with this retro 80s themed birthday party, featuring roller skating, arcade games, and a colorful disco dance floor." },
        { name: "Outdoor Adventure Birthday Carnival", desc: "A massive outdoor birthday carnival with giant inflatables, carnival games, popcorn machines, and cotton candy for a day of pure joy." },
        { name: "Elegant 21st Casino Royale Night", desc: "A sophisticated James Bond inspired 21st birthday party featuring casino tables, black-tie dress code, and an evening of thrilling entertainment." }
    ],
    "Concerts": [
        { name: "Summer Vibes Music Festival", desc: "A massive open-air summer music festival featuring a lineup of top international artists, massive stages, food stalls, and immersive VIP lounges." },
        { name: "Rock the Night Arena Tour", desc: "An intense and electrifying indoor rock concert with spectacular pyrotechnics, massive sound systems, and an unforgettable crowd energy." },
        { name: "Symphony Under the Stars", desc: "A breathtaking classical music concert performed by a full orchestra in an outdoor amphitheater, offering a serene and majestic auditory experience." },
        { name: "Electronic Dance Music (EDM) Blast", desc: "A high-octane EDM concert featuring world-renowned DJs, mind-blowing laser shows, and non-stop dancing in a massive indoor arena." },
        { name: "Jazz & Blues Vintage Night", desc: "An intimate and soulful concert evening featuring legendary jazz and blues musicians performing classic hits in a cozy, acoustically perfect venue." },
        { name: "Hip-Hop & R&B Block Party", desc: "An energetic hip-hop and R&B concert event bringing together chart-topping artists and amazing street dance performances in an urban setting." },
        { name: "Acoustic Unplugged Sessions", desc: "A highly anticipated acoustic concert where famous artists strip down their biggest hits for an intimate, raw, and emotional musical performance." },
        { name: "Global World Music Showcase", desc: "A culturally rich concert experience showcasing traditional and contemporary music from diverse cultures around the globe." },
        { name: "Pop Icons Live in Stadium", desc: "A spectacular stadium concert featuring the biggest pop stars of the decade, complete with intricate choreography and massive LED screens." },
        { name: "Indie Rock Discovery Festival", desc: "A trendy indie music festival dedicated to showcasing the best up-and-coming alternative bands in a vibrant and creative outdoor space." }
    ]
};

const getPlace = (index, cat) => {
    const places = ["Grand Hotel", "City Park", "Downtown Arena", "Convention Center", "Luxury Resort", "Ocean View Hall", "Royal Palace", "Community Center", "Tech Hub", "Exhibition Center"];
    return `${places[index % places.length]} - ${cat}`;
};

const generateEvents = (categoryId, categoryName) => {
    const events = [];
    const images = eventImages[categoryName];
    const details = eventDetails[categoryName];
    
    for (let i = 0; i < 10; i++) {
        events.push({
            name: details[i].name,
            description: details[i].desc,
            image: images[i],
            category: categoryId,
            people: (i % 6 + 1) * 100, // 100, 200, 300, 400, 500, 600
            place: getPlace(i, categoryName)
        });
    }
    return events;
};

const slidesData = [
  {
    title: "Unforgettable Weddings",
    description: "Make your special day truly magical with our premium wedding planning services. We turn dreams into reality.",
    image: eventImages["Weddings"][0]
  },
  {
    title: "Corporate Excellence",
    description: "Professional corporate events that leave a lasting impression on your clients and partners. Redefining business gatherings.",
    image: eventImages["Corporate Events"][0]
  },
  {
    title: "Live Concerts & Shows",
    description: "Experience the energy of live music with our flawless concert setups, massive sound systems, and unforgettable light shows.",
    image: eventImages["Concerts"][0]
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(mongoUri, { bufferCommands: true });
    console.log("✅ MongoDB Connected for Seeding");

    // Clear existing data
    await Category.deleteMany();
    await Event.deleteMany();
    await Slide.deleteMany();
    await User.deleteMany({ email: { $regex: "dummy.*@example.com" } });
    console.log("🗑️  Cleared existing Categories, Events, Slides, and Dummy Users");

    // Seed Categories
    const categoriesToInsert = categoriesList.map(name => ({ name }));
    const categories = await Category.insertMany(categoriesToInsert);
    console.log(`🌱 ${categories.length} Categories Seeded`);

    // Seed Events
    let allEvents = [];
    for (const cat of categories) {
        const eventsForCat = generateEvents(cat._id, cat.name);
        allEvents = [...allEvents, ...eventsForCat];
    }
    await Event.insertMany(allEvents);
    console.log(`🎉 ${allEvents.length} Events Seeded with Detailed Names and Descriptions`);

    // Seed Slides
    await Slide.insertMany(slidesData);
    console.log("🖼️ Slides Seeded");

    // Seed Users
    const hashedPassword = await bcrypt.hash("password123", 10);
    const usersToInsert = Array.from({ length: 5 }).map((_, i) => ({
        name: `Dummy User ${i + 1}`,
        email: `dummy${i + 1}@example.com`,
        password: hashedPassword,
        phone: `+1234567890${i}`,
        role: "user",
        verifyuser: true,
        isActive: true,
        profileImage: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1760&auto=format&fit=crop"
    }));
    await User.insertMany(usersToInsert);
    console.log("👥 Dummy Users Seeded");

    console.log("✅ Database Seeding Completed Successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error with seeding data: ", error);
    process.exit(1);
  }
};

seedData();
