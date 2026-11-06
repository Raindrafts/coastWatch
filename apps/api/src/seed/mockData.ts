import { Report, SocialPost, Incident, Notification, AuditEvent } from '@coastwatch/contracts';

export const SEED_REPORTS: Report[] = [
  {
    id: "rep-001",
    publicId: "RPT-000001",
    title: "High tidal flooding submerging Marina roadway",
    description: "Water surge and tidal overflow has inundated the main coastal pathway and roadway near Marina beach. Multiple vehicles stranded.",
    hazardType: "coastal_flooding",
    location: {
      longitude: 80.2824,
      latitude: 13.0475,
      placeName: "Marina Beach, Chennai"
    },
    eventTime: "2026-10-14T02:30:00Z",
    createdAt: "2026-10-14T02:45:00Z",
    updatedAt: "2026-10-14T03:00:00Z",
    source: "citizen",
    evidence: ["/uploads/evidence_marina_flood_01.jpg"],
    reportedSeverity: "high",
    status: "verified",
    aiAnalysis: {
      hazardType: "coastal_flooding",
      confidence: 0.94,
      keywords: ["flooding", "surge", "overflow", "tidal"],
      explanation: "Matched strong coastal flooding keywords and extreme tidal surge indicators.",
      needsReview: false,
      analyzedAt: "2026-10-14T02:46:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    },
    review: {
      reviewedBy: "usr-rev-01",
      reviewedAt: "2026-10-14T03:00:00Z",
      reason: "Confirmed against local municipal tide gauge sensor readings.",
      notes: "Traffic redirection dispatched."
    },
    incidentId: "inc-001",
    possibleRelatedReportIds: ["rep-005"]
  },
  {
    id: "rep-002",
    publicId: "RPT-000002",
    title: "Large oil slick spotted near port harbor entrance",
    description: "Dark oily sheen spreading rapidly near the outer harbor navigation channel with strong diesel and chemical odor.",
    hazardType: "oil_spill",
    location: {
      longitude: 80.2985,
      latitude: 13.0827,
      placeName: "Port Outer Harbor Channel"
    },
    eventTime: "2026-10-14T03:15:00Z",
    createdAt: "2026-10-14T03:25:00Z",
    updatedAt: "2026-10-14T03:40:00Z",
    source: "citizen",
    evidence: ["/uploads/oil_slick_harbor.jpg"],
    reportedSeverity: "critical",
    status: "under_review",
    aiAnalysis: {
      hazardType: "oil_spill",
      confidence: 0.89,
      keywords: ["oil slick", "sheen", "diesel", "chemical"],
      explanation: "Detected high-priority petrochemical contamination vocabulary.",
      needsReview: true,
      analyzedAt: "2026-10-14T03:26:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    },
    incidentId: "inc-002",
    possibleRelatedReportIds: ["rep-008"]
  },
  {
    id: "rep-003",
    publicId: "RPT-000003",
    title: "Severe bluff erosion threatening coastal highway barrier",
    description: "Cliff edge collapse after torrential overnight rainfall. Retaining wall foundation is visibly undercut by heavy breakers.",
    hazardType: "coastal_erosion",
    location: {
      longitude: 80.2450,
      latitude: 12.8710,
      placeName: "East Coast Road Cliff Section"
    },
    eventTime: "2026-10-14T01:10:00Z",
    createdAt: "2026-10-14T01:30:00Z",
    updatedAt: "2026-10-14T01:30:00Z",
    source: "citizen",
    evidence: [],
    reportedSeverity: "medium",
    status: "pending_review",
    aiAnalysis: {
      hazardType: "coastal_erosion",
      confidence: 0.82,
      keywords: ["erosion", "cliff edge collapse", "undercut"],
      explanation: "Geo-structural coastal erosion terminology detected.",
      needsReview: true,
      analyzedAt: "2026-10-14T01:31:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    }
  },
  {
    id: "rep-004",
    publicId: "RPT-000004",
    title: "Dangerous rogue waves washing over fishing jetty",
    description: "3 to 4 meter swells breaking over the northern jetty structure. Small fishing catamarans damaged and dragged into surf.",
    hazardType: "high_waves",
    location: {
      longitude: 80.2740,
      latitude: 13.0120,
      placeName: "Besant Nagar North Jetty"
    },
    eventTime: "2026-10-14T04:00:00Z",
    createdAt: "2026-10-14T04:12:00Z",
    updatedAt: "2026-10-14T04:12:00Z",
    source: "citizen",
    evidence: [],
    reportedSeverity: "high",
    status: "pending_review",
    aiAnalysis: {
      hazardType: "high_waves",
      confidence: 0.91,
      keywords: ["waves", "swells", "breaking", "surf"],
      explanation: "High-wave surge hazard identified with high confidence.",
      needsReview: true,
      analyzedAt: "2026-10-14T04:13:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    }
  },
  {
    id: "rep-005",
    publicId: "RPT-000005",
    title: "Saltwater intrusion into residential storm drains",
    description: "Backflow of seawater through city stormwater outlets in low-lying coastal neighborhood.",
    hazardType: "coastal_flooding",
    location: {
      longitude: 80.2810,
      latitude: 13.0390,
      placeName: "Santhome Coastal Drainage Basin"
    },
    eventTime: "2026-10-14T03:00:00Z",
    createdAt: "2026-10-14T03:20:00Z",
    updatedAt: "2026-10-14T03:45:00Z",
    source: "citizen",
    evidence: [],
    reportedSeverity: "medium",
    status: "under_review",
    aiAnalysis: {
      hazardType: "coastal_flooding",
      confidence: 0.79,
      keywords: ["saltwater", "storm drains", "backflow"],
      explanation: "Tidal flooding intrusion detected.",
      needsReview: true,
      analyzedAt: "2026-10-14T03:21:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    },
    incidentId: "inc-001"
  },
  {
    id: "rep-006",
    publicId: "RPT-000006",
    title: "Massive plastic debris field and ghost net entanglement",
    description: "Dense raft of abandoned fishing nets and microplastics washed ashore over 500 meters of turtle nesting beach.",
    hazardType: "marine_debris",
    location: {
      longitude: 80.2600,
      latitude: 12.9850,
      placeName: "Thiruvanmiyur Coastal Stretch"
    },
    eventTime: "2026-10-13T18:00:00Z",
    createdAt: "2026-10-13T19:00:00Z",
    updatedAt: "2026-10-14T00:15:00Z",
    source: "citizen",
    evidence: ["/uploads/ghost_net_beach.jpg"],
    reportedSeverity: "medium",
    status: "verified",
    aiAnalysis: {
      hazardType: "marine_debris",
      confidence: 0.95,
      keywords: ["debris", "fishing nets", "microplastics"],
      explanation: "Marine pollution and environmental debris detected.",
      needsReview: false,
      analyzedAt: "2026-10-13T19:01:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    },
    review: {
      reviewedBy: "usr-rev-02",
      reviewedAt: "2026-10-14T00:15:00Z",
      reason: "Verified by coastal volunteer cleanup coordinator.",
      notes: "Cleanup crew deployed."
    }
  },
  {
    id: "rep-007",
    publicId: "RPT-000007",
    title: "Unconfirmed report of offshore foam discharge",
    description: "Yellowish chemical foam drifting about 2 nautical miles off the coast. Exact origin uncertain.",
    // NOTE: Intentionally missing location coordinates to satisfy test case MAP-02
    hazardType: "other",
    location: null,
    eventTime: "2026-10-13T22:00:00Z",
    createdAt: "2026-10-13T22:30:00Z",
    updatedAt: "2026-10-13T22:30:00Z",
    source: "citizen",
    evidence: [],
    reportedSeverity: "low",
    status: "needs_information",
    aiAnalysis: {
      hazardType: "other",
      confidence: 0.52,
      keywords: ["foam", "discharge"],
      explanation: "Low confidence match, requires additional photographic and coordinate data.",
      needsReview: true,
      analyzedAt: "2026-10-13T22:31:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    }
  },
  {
    id: "rep-008",
    publicId: "RPT-000008",
    title: "Odor of fuel and petroleum residue on beach waterline",
    description: "Black tar-like balls and petroleum film lining the intertidal zone near fishing hamlet.",
    hazardType: "oil_spill",
    location: {
      longitude: 80.3010,
      latitude: 13.0900,
      placeName: "Royapuram Intertidal Zone"
    },
    eventTime: "2026-10-14T03:45:00Z",
    createdAt: "2026-10-14T04:05:00Z",
    updatedAt: "2026-10-14T04:05:00Z",
    source: "citizen",
    evidence: [],
    reportedSeverity: "critical",
    status: "pending_review",
    aiAnalysis: {
      hazardType: "oil_spill",
      confidence: 0.87,
      keywords: ["tar balls", "petroleum", "fuel odor"],
      explanation: "Petrochemical coastal residue detected.",
      needsReview: true,
      analyzedAt: "2026-10-14T04:06:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    },
    incidentId: "inc-002"
  },
  {
    id: "rep-009",
    publicId: "RPT-000009",
    title: "Seawall collapse along promenade",
    description: "Ten-meter concrete block displacement caused by storm surge scouring the embankment base.",
    hazardType: "coastal_erosion",
    location: {
      longitude: 80.2780,
      latitude: 13.0290,
      placeName: "Pattinapakkam Coastal Promenade"
    },
    eventTime: "2026-10-13T16:00:00Z",
    createdAt: "2026-10-13T16:30:00Z",
    updatedAt: "2026-10-13T17:10:00Z",
    source: "news",
    evidence: [],
    reportedSeverity: "high",
    status: "verified",
    aiAnalysis: {
      hazardType: "coastal_erosion",
      confidence: 0.86,
      keywords: ["seawall collapse", "scouring", "displacement"],
      explanation: "Structural coastal failure verified.",
      needsReview: false,
      analyzedAt: "2026-10-13T16:32:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    },
    review: {
      reviewedBy: "usr-rev-01",
      reviewedAt: "2026-10-13T17:10:00Z",
      reason: "Confirmed via Public Works Department coastal patrol report."
    }
  },
  {
    id: "rep-010",
    publicId: "RPT-000010",
    title: "Rip current distress signs and dangerous undertow",
    description: "Strong localized rip currents pulling seaward near sandbar; multiple swimmers required rescue.",
    hazardType: "high_waves",
    location: {
      longitude: 80.2520,
      latitude: 12.9200,
      placeName: "Palavakkam Beach"
    },
    eventTime: "2026-10-14T05:00:00Z",
    createdAt: "2026-10-14T05:15:00Z",
    updatedAt: "2026-10-14T05:15:00Z",
    source: "citizen",
    evidence: [],
    reportedSeverity: "high",
    status: "pending_review",
    aiAnalysis: {
      hazardType: "high_waves",
      confidence: 0.84,
      keywords: ["rip current", "undertow", "swells"],
      explanation: "Hydrodynamic wave hazard detected.",
      needsReview: true,
      analyzedAt: "2026-10-14T05:16:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    }
  },
  {
    id: "rep-011",
    publicId: "RPT-000011",
    title: "Spurious report of submarine volcano",
    description: "Boiling water seen in coastal shallows, claims of volcanic eruptive activity.",
    hazardType: "other",
    location: {
      longitude: 80.2700,
      latitude: 13.0000,
      placeName: "Adyar Estuary Outflow"
    },
    eventTime: "2026-10-13T12:00:00Z",
    createdAt: "2026-10-13T12:15:00Z",
    updatedAt: "2026-10-13T13:00:00Z",
    source: "citizen",
    evidence: [],
    reportedSeverity: "low",
    status: "rejected",
    aiAnalysis: {
      hazardType: "other",
      confidence: 0.35,
      keywords: ["volcano"],
      explanation: "Plausibility check failed; geological conditions non-volcanic.",
      needsReview: true,
      analyzedAt: "2026-10-13T12:16:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    },
    review: {
      reviewedBy: "usr-rev-02",
      reviewedAt: "2026-10-13T13:00:00Z",
      reason: "Confirmed false observation caused by industrial warm-water thermal cooling discharge, no tectonic hazard.",
      notes: "Closed as invalid."
    }
  },
  {
    id: "rep-012",
    publicId: "RPT-000012",
    title: "Sunken barge spilling cargo containers",
    description: "Listing coastal transport vessel half submerged, releasing plastic pellet containers into the surf line.",
    hazardType: "marine_debris",
    location: {
      longitude: 80.3120,
      latitude: 13.1200,
      placeName: "Ennore Creek Bar"
    },
    eventTime: "2026-10-14T01:00:00Z",
    createdAt: "2026-10-14T01:45:00Z",
    updatedAt: "2026-10-14T02:30:00Z",
    source: "citizen",
    evidence: [],
    reportedSeverity: "critical",
    status: "under_review",
    aiAnalysis: {
      hazardType: "marine_debris",
      confidence: 0.93,
      keywords: ["barge", "containers", "plastic pellet", "cargo"],
      explanation: "Containerized marine debris spill.",
      needsReview: false,
      analyzedAt: "2026-10-14T01:46:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    },
    incidentId: "inc-003"
  },
  {
    id: "rep-013",
    publicId: "RPT-000013",
    title: "Sand dune breach during high-spring tide",
    description: "Natural barrier dune breached, ocean waters inundating coastal agriculture plots behind the ridge.",
    hazardType: "coastal_flooding",
    location: {
      longitude: 80.2300,
      latitude: 12.8100,
      placeName: "Kovalam Dune Reserve"
    },
    eventTime: "2026-10-14T04:20:00Z",
    createdAt: "2026-10-14T04:40:00Z",
    updatedAt: "2026-10-14T04:40:00Z",
    source: "citizen",
    evidence: [],
    reportedSeverity: "high",
    status: "pending_review",
    aiAnalysis: {
      hazardType: "coastal_flooding",
      confidence: 0.91,
      keywords: ["dune breach", "spring tide", "inundation"],
      explanation: "High confidence dune breach flooding.",
      needsReview: true,
      analyzedAt: "2026-10-14T04:41:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    }
  },
  {
    id: "rep-014",
    publicId: "RPT-000014",
    title: "Chemical drum washed up on tourist beach",
    description: "Sealed 200L blue barrel with hazmat corrosive diamond emblem stranded at low water line.",
    hazardType: "other",
    location: {
      longitude: 80.2650,
      latitude: 12.9980,
      placeName: "Elliot's Beach Front"
    },
    eventTime: "2026-10-14T05:30:00Z",
    createdAt: "2026-10-14T05:40:00Z",
    updatedAt: "2026-10-14T05:40:00Z",
    source: "citizen",
    evidence: [],
    reportedSeverity: "critical",
    status: "pending_review",
    aiAnalysis: {
      hazardType: "other",
      confidence: 0.88,
      keywords: ["chemical drum", "hazmat", "corrosive"],
      explanation: "Hazardous chemical container requiring emergency hazmat team dispatch.",
      needsReview: true,
      analyzedAt: "2026-10-14T05:41:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    }
  },
  {
    id: "rep-015",
    publicId: "RPT-000015",
    title: "Coastal path undermined by scour hole",
    description: "Two-meter deep sinkhole opened underneath pedestrian boardwalk directly adjacent to seawall.",
    hazardType: "coastal_erosion",
    location: {
      longitude: 80.2800,
      latitude: 13.0420,
      placeName: "Marina Promenade South"
    },
    eventTime: "2026-10-14T03:50:00Z",
    createdAt: "2026-10-14T04:10:00Z",
    updatedAt: "2026-10-14T04:10:00Z",
    source: "citizen",
    evidence: [],
    reportedSeverity: "medium",
    status: "pending_review",
    aiAnalysis: {
      hazardType: "coastal_erosion",
      confidence: 0.83,
      keywords: ["undermined", "scour hole", "sinkhole"],
      explanation: "Coastal infrastructure scouring detected.",
      needsReview: true,
      analyzedAt: "2026-10-14T04:11:00Z",
      modelVersion: "0.1.0-keyword-heuristics"
    }
  }
];

export const SEED_SOCIAL_POSTS: SocialPost[] = [
  {
    id: "soc-001",
    externalId: "tw-18456123498",
    platform: "twitter",
    sourceMode: "imported",
    text: "Water is completely across Marina road right now! Avoid beach drive, waves splashing straight over the concrete barrier #ChennaiFloods #BeachSafety",
    createdAt: "2026-10-14T02:40:00Z",
    importedAt: "2026-10-14T02:50:00Z",
    location: {
      longitude: 80.2820,
      latitude: 13.0470,
      placeName: "Marina Beach Road"
    },
    sourceUrl: "https://twitter.com/chennaicommute/status/18456123498",
    relevant: true,
    predictedHazardType: "coastal_flooding",
    confidence: 0.93,
    sentiment: "urgent",
    modelName: "tfidf-logistic-regression",
    modelVersion: "baseline-v1",
    analysisStatus: "completed",
    possibleIncidentIds: ["inc-001"]
  },
  {
    id: "soc-002",
    externalId: "bsky-3kfm91x8",
    platform: "bluesky",
    sourceMode: "imported",
    text: "Can smell heavy oil or diesel out near the harbor entrance. Fish dying in surf, water looks dark brown. Anyone from coast guard checking? @coastwatch",
    createdAt: "2026-10-14T03:20:00Z",
    importedAt: "2026-10-14T03:30:00Z",
    location: {
      longitude: 80.2980,
      latitude: 13.0820,
      placeName: "Port Outer Approach"
    },
    sourceUrl: "https://bsky.app/profile/marineobserver.bsky.social/post/3kfm91x8",
    relevant: true,
    predictedHazardType: "oil_spill",
    confidence: 0.91,
    sentiment: "urgent",
    modelName: "tfidf-logistic-regression",
    modelVersion: "baseline-v1",
    analysisStatus: "completed",
    possibleIncidentIds: ["inc-002"]
  },
  {
    id: "soc-003",
    externalId: "tw-18456987412",
    platform: "twitter",
    sourceMode: "imported",
    text: "Sunny afternoon for ice cream at Elliot beach! Waves are looking super calm today :)",
    createdAt: "2026-10-14T01:00:00Z",
    importedAt: "2026-10-14T01:10:00Z",
    location: {
      longitude: 80.2650,
      latitude: 12.9980,
      placeName: "Bessie Beach"
    },
    relevant: false,
    predictedHazardType: "other",
    confidence: 0.12,
    sentiment: "positive",
    modelName: "tfidf-logistic-regression",
    modelVersion: "baseline-v1",
    analysisStatus: "completed"
  },
  {
    id: "soc-004",
    externalId: "tw-18457011234",
    platform: "twitter",
    sourceMode: "imported",
    text: "URGENT: Huge swells crashing over North Jetty at Besant Nagar. Stay away from the edge! A catamaran just capsized.",
    createdAt: "2026-10-14T04:05:00Z",
    importedAt: "2026-10-14T04:15:00Z",
    location: {
      longitude: 80.2742,
      latitude: 13.0125,
      placeName: "Besant Nagar Jetty"
    },
    sourceUrl: "https://twitter.com/oceanalert_in/status/18457011234",
    relevant: true,
    predictedHazardType: "high_waves",
    confidence: 0.96,
    sentiment: "urgent",
    modelName: "tfidf-logistic-regression",
    modelVersion: "baseline-v1",
    analysisStatus: "completed"
  },
  {
    id: "soc-005",
    externalId: "tw-18457033456",
    platform: "twitter",
    sourceMode: "imported",
    text: "Beach road cliff section near ECR collapsed during heavy swell. Police barricades are being set up now.",
    createdAt: "2026-10-14T01:25:00Z",
    importedAt: "2026-10-14T01:35:00Z",
    location: {
      longitude: 80.2455,
      latitude: 12.8715,
      placeName: "East Coast Road"
    },
    relevant: true,
    predictedHazardType: "coastal_erosion",
    confidence: 0.88,
    sentiment: "negative",
    modelName: "tfidf-logistic-regression",
    modelVersion: "baseline-v1",
    analysisStatus: "completed"
  },
  {
    id: "soc-006",
    externalId: "news-992140",
    platform: "news",
    sourceMode: "simulated",
    text: "Port Authorities investigate reported chemical sheen and bunker fuel residue near northern channel.",
    createdAt: "2026-10-14T03:50:00Z",
    importedAt: "2026-10-14T04:00:00Z",
    location: {
      longitude: 80.2985,
      latitude: 13.0827,
      placeName: "Chennai Port Trust"
    },
    relevant: true,
    predictedHazardType: "oil_spill",
    confidence: 0.92,
    sentiment: "neutral",
    modelName: "tfidf-logistic-regression",
    modelVersion: "baseline-v1",
    analysisStatus: "completed",
    possibleIncidentIds: ["inc-002"]
  },
  {
    id: "soc-007",
    externalId: "tw-18457100987",
    platform: "twitter",
    sourceMode: "imported",
    text: "Ghost nets everywhere at Thiruvanmiyur beach this morning. We need volunteers with scissors and bags asap!",
    createdAt: "2026-10-13T19:30:00Z",
    importedAt: "2026-10-13T19:40:00Z",
    location: {
      longitude: 80.2605,
      latitude: 12.9855,
      placeName: "Thiruvanmiyur Beach"
    },
    relevant: true,
    predictedHazardType: "marine_debris",
    confidence: 0.94,
    sentiment: "negative",
    modelName: "tfidf-logistic-regression",
    modelVersion: "baseline-v1",
    analysisStatus: "completed"
  },
  {
    id: "soc-008",
    externalId: "bsky-3kfn890a",
    platform: "bluesky",
    sourceMode: "imported",
    text: "Water entering coastal basements near Santhome church. High tide is peaking right now.",
    createdAt: "2026-10-14T03:10:00Z",
    importedAt: "2026-10-14T03:20:00Z",
    location: {
      longitude: 80.2812,
      latitude: 13.0395,
      placeName: "Santhome High Road"
    },
    relevant: true,
    predictedHazardType: "coastal_flooding",
    confidence: 0.89,
    sentiment: "urgent",
    modelName: "tfidf-logistic-regression",
    modelVersion: "baseline-v1",
    analysisStatus: "completed",
    possibleIncidentIds: ["inc-001"]
  },
  {
    id: "soc-009",
    externalId: "tw-18457221345",
    platform: "twitter",
    sourceMode: "imported",
    text: "Just caught a massive fish off the pier today! Best weekend ever.",
    createdAt: "2026-10-13T15:00:00Z",
    importedAt: "2026-10-13T15:15:00Z",
    relevant: false,
    predictedHazardType: "other",
    confidence: 0.05,
    sentiment: "positive",
    modelName: "tfidf-logistic-regression",
    modelVersion: "baseline-v1",
    analysisStatus: "completed"
  },
  {
    id: "soc-010",
    externalId: "tw-18457255678",
    platform: "twitter",
    sourceMode: "imported",
    text: "Cargo containers floating near Ennore channel! Local boats warned to avoid shallow navigation lanes.",
    createdAt: "2026-10-14T01:30:00Z",
    importedAt: "2026-10-14T01:40:00Z",
    location: {
      longitude: 80.3125,
      latitude: 13.1205,
      placeName: "Ennore Coast"
    },
    relevant: true,
    predictedHazardType: "marine_debris",
    confidence: 0.92,
    sentiment: "urgent",
    modelName: "tfidf-logistic-regression",
    modelVersion: "baseline-v1",
    analysisStatus: "completed",
    possibleIncidentIds: ["inc-003"]
  }
];

export const SEED_INCIDENTS: Incident[] = [
  {
    id: "inc-001",
    publicId: "INC-000001",
    title: "Marina Coastal Surge & Tidal Flooding",
    hazardType: "coastal_flooding",
    reportIds: ["rep-001", "rep-005"],
    socialPostIds: ["soc-001", "soc-008"],
    location: {
      longitude: 80.2824,
      latitude: 13.0475,
      placeName: "Marina Beach Coastal Corridor"
    },
    firstObservedAt: "2026-10-14T02:30:00Z",
    lastObservedAt: "2026-10-14T03:20:00Z",
    reviewStatus: "confirmed",
    priorityScore: 92,
    priorityReasons: [
      "Multiple citizen reports with photo evidence",
      "Corroborating urgent social media geo-signals",
      "Direct municipal road flooding reported"
    ],
    createdAt: "2026-10-14T02:50:00Z",
    updatedAt: "2026-10-14T03:45:00Z"
  },
  {
    id: "inc-002",
    publicId: "INC-000002",
    title: "Port Channel Oil Slick & Petroleum Sheen",
    hazardType: "oil_spill",
    reportIds: ["rep-002", "rep-008"],
    socialPostIds: ["soc-002", "soc-006"],
    location: {
      longitude: 80.2985,
      latitude: 13.0827,
      placeName: "Port Outer Harbor Channel"
    },
    firstObservedAt: "2026-10-14T03:15:00Z",
    lastObservedAt: "2026-10-14T04:05:00Z",
    reviewStatus: "investigating",
    priorityScore: 95,
    priorityReasons: [
      "Critical severity level report",
      "Strong chemical and dead marine life odor detected",
      "Expanding radius in high-traffic commercial waterway"
    ],
    createdAt: "2026-10-14T03:30:00Z",
    updatedAt: "2026-10-14T04:10:00Z"
  },
  {
    id: "inc-003",
    publicId: "INC-000003",
    title: "Ennore Containerized Cargo Debris Spill",
    hazardType: "marine_debris",
    reportIds: ["rep-012"],
    socialPostIds: ["soc-010"],
    location: {
      longitude: 80.3120,
      latitude: 13.1200,
      placeName: "Ennore Creek Navigation Barrier"
    },
    firstObservedAt: "2026-10-14T01:00:00Z",
    lastObservedAt: "2026-10-14T01:30:00Z",
    reviewStatus: "investigating",
    priorityScore: 78,
    priorityReasons: [
      "Navigation hazard to artisanal fishing crafts",
      "Potential plastic pellet / microplastic environmental hazard"
    ],
    createdAt: "2026-10-14T01:50:00Z",
    updatedAt: "2026-10-14T02:30:00Z"
  }
];

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    recipientId: "usr-rev-01",
    title: "Critical Oil Spill Reported",
    message: "Report RPT-000002 has been marked critical severity near Port Harbor entrance.",
    read: false,
    createdAt: "2026-10-14T03:26:00Z",
    type: "high_priority",
    link: "/reports/RPT-000002"
  },
  {
    id: "notif-002",
    recipientId: "usr-rev-01",
    title: "Incident INC-000001 Updated",
    message: "New citizen report RPT-000005 linked to Marina Coastal Surge incident.",
    read: true,
    createdAt: "2026-10-14T03:45:00Z",
    type: "link_created",
    link: "/incidents/INC-000001"
  },
  {
    id: "notif-003",
    recipientId: "usr-rev-02",
    title: "Report Status Verified",
    message: "Report RPT-000006 (Ghost net entanglement) has been verified.",
    read: true,
    createdAt: "2026-10-14T00:15:00Z",
    type: "status_change",
    link: "/reports/RPT-000006"
  }
];

export const SEED_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "aud-001",
    timestamp: "2026-10-14T03:00:00Z",
    actorId: "usr-rev-01",
    actorRole: "reviewer",
    action: "STATUS_CHANGE",
    targetType: "report",
    targetId: "rep-001",
    reason: "Confirmed against local municipal tide gauge sensor readings.",
    notes: "Traffic redirection dispatched.",
    metadata: { previousStatus: "under_review", newStatus: "verified" }
  },
  {
    id: "aud-002",
    timestamp: "2026-10-14T03:45:00Z",
    actorId: "usr-rev-01",
    actorRole: "reviewer",
    action: "LINK_REPORT",
    targetType: "incident",
    targetId: "inc-001",
    reason: "Santhome stormwater backflow directly caused by same coastal surge.",
    metadata: { linkedReportId: "rep-005" }
  },
  {
    id: "aud-003",
    timestamp: "2026-10-13T13:00:00Z",
    actorId: "usr-rev-02",
    actorRole: "reviewer",
    action: "STATUS_CHANGE",
    targetType: "report",
    targetId: "rep-011",
    reason: "Confirmed false observation caused by industrial warm-water thermal cooling discharge, no tectonic hazard.",
    notes: "Closed as invalid.",
    metadata: { previousStatus: "pending_review", newStatus: "rejected" }
  }
];
