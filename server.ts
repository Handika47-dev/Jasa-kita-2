import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, query, limit } from "firebase/firestore";
import fs from "fs";

// Load Firebase Config
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Use API key from environment if provided, otherwise from config
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || firebaseConfig.apiKey;
if (process.env.FIREBASE_API_KEY) {
  console.log("[Firebase] Using custom API Key provided in environment.");
}

// Initialize Firebase Client SDK (Works on server too)
const firebaseApp = initializeApp({
  ...firebaseConfig,
  apiKey: FIREBASE_API_KEY
});

// Initialize Firestore
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
console.log(`[Firebase] Client SDK initialized for project: ${firebaseConfig.projectId}`);

// Local file persistence as a reliable fallback
const LOCAL_STORAGE_PATH = path.join(process.cwd(), "providers_backup.json");
console.log(`[Storage] Local backup path: ${LOCAL_STORAGE_PATH}`);

const loadLocalProviders = () => {
  try {
    if (fs.existsSync(LOCAL_STORAGE_PATH)) {
      const data = fs.readFileSync(LOCAL_STORAGE_PATH, "utf8");
      const list = JSON.parse(data);
      console.log(`[Storage] Loaded ${list.length} providers from local backup: ${LOCAL_STORAGE_PATH}`);
      return list;
    } else {
      console.log("[Storage] No local backup found, starting fresh.");
    }
  } catch (e) {
    console.error("[Storage] Failed to load local providers:", e);
  }
  return [];
};

// Startup Test
const testFirestore = async () => {
  try {
    console.log("[Firebase] Running startup connection test...");
    await runFirestoreOp(async (collRef) => {
      await getDocs(query(collRef, limit(1)));
      console.log("[Firebase] Startup connection test: SUCCESS!");
    });
  } catch (e: any) {
    console.error("[Firebase] Startup connection test: FAILED. App will use local backup logic.", e.message);
  }
};
testFirestore();

const saveLocalProvider = (provider: any) => {
  try {
    const providers = loadLocalProviders();
    // Avoid duplicates
    if (!providers.some((p: any) => p.whatsapp === provider.whatsapp)) {
      providers.push(provider);
      fs.writeFileSync(LOCAL_STORAGE_PATH, JSON.stringify(providers, null, 2));
      console.log("[Storage] Provider saved to local backup.");
    } else {
      console.log("[Storage] Provider already exists in local backup, skipping save.");
    }
  } catch (e) {
    console.error("[Storage] Failed to save local provider:", e);
  }
};

// Helper to handle Firestore operations with multiple fallbacks
async function runFirestoreOp(operation: (collRef: any) => Promise<any>) {
  try {
    const collRef = collection(db, "providers");
    return await operation(collRef);
  } catch (err: any) {
    console.warn(`[Firebase] Operation failed (code: ${err.code}, msg: ${err.message})`);
    
    // Fallback: If using a named database, we could try others, 
    // but the Client SDK init is usually project-wide.
    // For now, re-throw to allow local backup logic to take over.
    throw err; 
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Providers store (now using Firestore + Local Fallback)
  app.get("/api/providers", async (req, res) => {
    let providers: any[] = [];
    
    try {
      const snapshot = await runFirestoreOp(collRef => getDocs(collRef));
      providers = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Firestore fetch failed, using local backup + mock data.");
    }

    // Merge with local backup
    const localProviders = loadLocalProviders();
    const mergedProviders = [...providers];
    
    // Avoid duplicates if Firestore partially worked
    localProviders.forEach((lp: any) => {
      if (!mergedProviders.some(mp => mp.name === lp.name && mp.whatsapp === lp.whatsapp)) {
        mergedProviders.push(lp);
      }
    });

    // If completely empty, return initial mock data
    if (mergedProviders.length === 0) {
      return res.json([
        {
          id: '1',
          name: 'Budi Teknisi AC',
          whatsapp: '6281234567890',
          location: { lat: -6.2088, lng: 106.8456, address: 'Jakarta Pusat' },
          serviceType: 'AC & Pendingin',
          rating: 4.8,
          description: 'Melayani cuci AC, tambah freon, dan perbaikan AC mati total.',
          imageUrl: 'https://images.unsplash.com/photo-1540560026466-678f69798362?w=400&h=400&fit=crop'
        },
        {
          id: '2',
          name: 'Siti ART Harian',
          whatsapp: '6281298765432',
          location: { lat: -6.2297, lng: 106.8167, address: 'Jakarta Selatan' },
          serviceType: 'Kebersihan',
          rating: 4.9,
          description: 'Bersih-bersih rumah, setrika, dan masak harian.',
          imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop'
        }
      ]);
    }

    // Sort manually
    mergedProviders.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    res.json(mergedProviders);
  });

  // Proxy route for sending registration email to admin
  app.post("/api/register-provider", async (req, res) => {
    const { name, whatsapp, location, serviceType, description, ktpUrl, selfieUrl, lat, lng } = req.body;
    
    if (!name || !whatsapp || !location || !serviceType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const newProvider = {
        name,
        whatsapp,
        location: { 
          lat: lat || -6.2088, 
          lng: lng || 106.8456, 
          address: location 
        },
        serviceType,
        rating: 5.0,
        description: description || 'Penyedia jasa baru terverifikasi.',
        imageUrl: selfieUrl || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop',
        createdAt: new Date().toISOString()
      };

      // Save to Firestore with fallback
      let savedId = "temp-" + Date.now();
      try {
        const docRef = await runFirestoreOp(collRef => addDoc(collRef, newProvider));
        savedId = docRef.id;
      } catch (err) {
        console.error("Firestore persistence failed, saving only to local backup.");
      }

      // Always save to local backup as well for reliability
      const savedProvider = { id: savedId, ...newProvider };
      saveLocalProvider(savedProvider);

      res.json({ status: "success", message: "Provider registered", provider: savedProvider });
    } catch (error) {
      console.error("Register provider error:", error);
      res.status(500).json({ error: "Failed to register provider" });
    }

    // Background: Try to send email if configured, but don't wait for it
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
          },
        });

        const mailOptions = {
          from: `JasaKita System <${process.env.GMAIL_USER}>`,
          to: "handikadahland@gmail.com",
          subject: `🚨 PENDAFTARAN MITRA BARU: ${name}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
              <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Pendaftaran Mitra Baru JasaKita</h2>
              <p>Data mitra baru telah ditambahkan ke sistem.</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;"><strong>Nama:</strong></td><td>${name}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;"><strong>WhatsApp:</strong></td><td><a href="https://wa.me/${whatsapp}">${whatsapp}</a></td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;"><strong>Kategori:</strong></td><td>${serviceType}</td></tr>
              </table>
            </div>
          `,
        };
        transporter.sendMail(mailOptions).catch(e => console.error("BG Email Error:", e));
      } catch (e) {
        console.error("Transporter setup error:", e);
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
