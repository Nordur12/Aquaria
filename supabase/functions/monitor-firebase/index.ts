import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getDatabase } from "npm:firebase-admin@11.10.1/database";
import { initializeApp, cert } from "npm:firebase-admin@11.10.1/app";
import { ref, onValue, DataSnapshot } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Supabase Setup
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const _supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY); // Prefixed with _ to avoid linting error

// Firebase Setup
const SERVICE_ACCOUNT_JSON = Deno.env.get("FIREBASE_SERVICE_ACCOUNT")!;
const SERVICE_ACCOUNT = JSON.parse(SERVICE_ACCOUNT_JSON);
const firebaseApp = initializeApp({ credential: cert(SERVICE_ACCOUNT) });

// Connect to Firebase Realtime Database
const db = getDatabase(firebaseApp);
const devicesRef = ref(db, "devices"); // Explicit type

// Define the expected structure of your device data
interface DeviceData {
  data?: {
    phlevel?: {
      pHLevel?: number;
    };
  };
  userId?: string;
}

// Listen for changes in all devices' pH levels
onValue(devicesRef, (snapshot: DataSnapshot) => {
  const devices: Record<string, DeviceData> | null = snapshot.val();
  if (!devices) return;

  Object.entries(devices).forEach(async ([deviceId, deviceData]) => {
    if (typeof deviceData !== "object" || !deviceData.data?.phlevel?.pHLevel || !deviceData.userId) return;

    const pHLevel: number = deviceData.data.phlevel.pHLevel;
    const userId: string = deviceData.userId;

    console.log(`📡 Device: ${deviceId} | pH Level: ${pHLevel} | User: ${userId}`);

    // ⚠️ Trigger alert if pH > 8.5
    if (pHLevel > 8.5) {
      console.log("⚠️ High pH detected for user:", userId, "pH:", pHLevel);

      // ✅ Store alert in Firebase Database
      await ref(db, `alerts/${deviceId}`).set({
        userId,
        deviceId,
        pHLevel,
        timestamp: new Date().toISOString(),
        handled: false,
      });

      // 📡 Send Notification via Supabase Function
      const notifyResponse = await fetch(
        "https://lhdhuonairkdxzpaaqpi.supabase.co/functions/v1/notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ userId, deviceId, pHLevel }),
        }
      );

      const notifyResult = await notifyResponse.json();

      if (!notifyResponse.ok) {
        console.error("❌ Notification failed:", notifyResult);
        return;
      }

      console.log("🔔 Notification Sent:", notifyResult);
    }
  });
});

serve(() => new Response("Realtime monitoring active 🚀", { status: 200 }));
