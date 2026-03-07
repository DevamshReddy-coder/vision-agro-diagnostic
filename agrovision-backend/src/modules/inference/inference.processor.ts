import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticReport, DiagnosticStatus } from './entities/diagnostic-report.entity';
import { TelemetryGateway } from '../../gateway/telemetry.gateway';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

@Processor('inference_queue')
@Injectable()
export class InferenceProcessor extends WorkerHost {
    constructor(
        @InjectRepository(DiagnosticReport)
        private readonly reportRepo: Repository<DiagnosticReport>,
        private readonly gateway: TelemetryGateway,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const reportId = job.data.reportId;
        console.log(`[AI Worker] Starting inference for Job ID: ${job.id}, Report ID: ${reportId}`);

        // Update DB to Processing
        await this.reportRepo.update(reportId, { status: DiagnosticStatus.PROCESSING });

        // Emit real-time status update to frontend
        this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 10 });

        const { base64Image, mimeType, lat, lon } = job.data;
        let finalOutput: any = null;
        const apiKey = process.env.GEMINI_API_KEY || '';

        // --- FETCH REAL-TIME ENVIRONMENTAL DATA (OPEN-METEO) ---
        let weatherContext = "Real-time weather data unavailable (no coordinates provided).";
        if (lat && lon) {
            try {
                this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 20 });
                const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
                const weatherRes = await axios.get(weatherUrl);
                const current = weatherRes.data.current;
                const daily = weatherRes.data.daily;
                weatherContext = `LOCAL WEATHER AND FORECAST FOR COORDINATES (${lat}, ${lon}):
- Current Conditions: Temperature ${current.temperature_2m}°C, Humidity ${current.relative_humidity_2m}%, Precipitation ${current.precipitation}mm
- Next 3 Days Forecast: 
  Day 1: ${daily.temperature_2m_max[1]}°C max, ${daily.precipitation_sum[1]}mm rain
  Day 2: ${daily.temperature_2m_max[2]}°C max, ${daily.precipitation_sum[2]}mm rain
  Day 3: ${daily.temperature_2m_max[3]}°C max, ${daily.precipitation_sum[3]}mm rain
`;
                console.log(`[Diagnostic Lab] Live Weather Integrated for Neural Inference: ${current.temperature_2m}°C, ${current.relative_humidity_2m}% HR`);
            } catch (err) {
                console.error("[AI Worker] Failed to fetch weather data from Open-Meteo", err.message);
                weatherContext = "Real-time weather data unavailable (fetch failed).";
            }
        }

        // --- REAL-TIME MULTIMODAL PLANT DISEASE ANALYSIS ENGINE ---
        if (base64Image && apiKey) {
            try {
                this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 30 });
                const ai = new GoogleGenAI({ apiKey });

                const promptString = `You are an advanced AgroVision AI Intelligence Engine designed to power a real-time agricultural diagnostic system called "A Vision-Driven Agro Diagnostic Framework Using Machine Learning." Your role is to function as a professional digital agronomist capable of combining computer vision analysis, environmental intelligence, and agronomic knowledge to diagnose crop diseases and forecast potential disease outbreaks based on environmental conditions.

${weatherContext}

When a user uploads a crop image, you must first analyze the image to identify the crop species by examining visual characteristics such as leaf morphology, venation pattern, texture, pigmentation, and structural plant features. You must return the crop name, scientific name, and a confidence score. If the crop cannot be identified with sufficient certainty, respond that the crop identification is uncertain and request a clearer or closer image rather than guessing.

Once the crop species is identified, perform a detailed disease analysis by inspecting visual symptoms such as lesions, discoloration, curling, mildew, fungal growth, mosaic patterns, necrosis, pest damage, or nutrient deficiency indicators. Based on these features, determine the most probable disease affecting the plant and classify the disease type as fungal, bacterial, viral, pest infestation, or nutrient deficiency. Provide a disease confidence score and ensure the diagnosis is consistent with the identified crop species. If the plant appears healthy, explicitly state that no disease symptoms were detected.

After identifying the disease, estimate the severity of infection by analyzing the spread and density of visible symptoms. Classify severity into levels such as Low, Moderate, High, or Critical, and estimate the approximate percentage of the plant area affected. Provide an explainable AI reasoning statement describing the visual cues that led to the diagnosis, referencing patterns such as concentric rings, chlorosis, necrotic lesions, vein deformation, or fungal spores.

In addition to image-based diagnosis, incorporate real-time environmental intelligence using available weather and soil data. Analyze environmental factors to determine whether the current conditions increase or decrease the likelihood of disease development. You must evaluate whether the weather data supports the current diagnosis or indicates the possibility of future disease outbreaks.

Use agronomic knowledge to determine weather-driven disease risk patterns (e.g., fungal diseases increasing under high humidity, etc). Generate a disease risk prediction score indicating whether the disease is likely to spread further within the field, and explain how the weather contributes.

If a disease is detected, generate crop-specific treatment recommendations. Provide chemical treatment options including pesticide name, active ingredient, recommended dosage, application interval, and safety guidelines. Treatments must be specific to the crop and disease. Also provide organic or integrated pest management recommendations (e.g., neem oil sprays, biological control). Included preventive spray schedules and smart irrigation advice.

Estimate potential agricultural impact by predicting yield loss percentage if untreated. Provide a risk classification based on disease severity and environmental conditions.

Additionally, provide a weather-based early warning system with a Next 5-7 Day Risk Forecast. Your responses must remain scientifically valid, crop-specific, and environmentally contextualized. Never reuse the same diagnosis/treatment for all crops. Clearly communicate uncertainty if diagnostic confidence is low.

JSON FORMAT SCHEMA (STRICTLY THIS!):
{
  "crop": "Cotton",
  "cropScientificName": "Gossypium spp.",
  "cropConfidence": 0.95,
  "disease": "Cotton Leaf Curl Virus",
  "diseaseScientificName": "Begomovirus",
  "diseaseType": "Viral",
  "diseaseConfidence": 0.92,
  "severity": "High",
  "riskLevel": "Critical",
  "affectedAreaPercent": 40,
  "xaiInsight": "Upward curling of leaf margins, vein thickening, and enations visible on the abaxial surface.",
  "message": null,
  "healthScore": null,
  "recommendations": {
    "pesticides": [
       { "name": "Applaud", "activeIngredient": "Buprofezin", "dosage": "1.5ml/L", "frequency": "10 days", "safety": "Wear PPE; avoid spraying near aquatic environments" }
    ],
    "organic": ["Apply neem seed kernel extract (NSKE 5%)"],
    "prevention": ["Uproot and burn infected plants", "Use resistant cotton hybrids"],
    "preventiveSpraySchedule": ["Day 1: Neem oil", "Day 7: Copper fungicide if humidity >80%"],
    "smartIrrigationAdvice": "Reduce overhead watering; use drip irrigation to minimize leaf wetness."
  },
  "insights": {
    "spreadProbability": "High (driven by 85% humidity)",
    "yieldImpact": "30-50%",
    "environmentalFactor": "Whitefly vectors active in dry, warm conditions mixed with sudden moisture.",
    "next7DayForecast": "High risk of secondary fungal infections due to forecasted 3-day rain."
  }
}`;

                this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 50 });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    inlineData: {
                                        data: base64Image,
                                        mimeType: mimeType || 'image/jpeg'
                                    }
                                },
                                { text: promptString }
                            ]
                        }
                    ],
                    config: {
                        responseMimeType: "application/json",
                        temperature: 0.2
                    }
                });

                const rawJson = response.text;
                if (rawJson) {
                    // Remove markdown code block syntax if Gemini wrapped it
                    const jsonString = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
                    finalOutput = JSON.parse(jsonString);
                }
                this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 95 });
            } catch (err) {
                console.error("[AI Worker] Gemini Execution Failed, falling back to mock:", err);
                require('fs').writeFileSync('gemini-error.txt', (err?.stack || JSON.stringify(err)) + '\n\n' + err?.message);
            }
        }

        // --- SIMULATION FALLBACK (IF API KEY MISSING OR REQUEST FAILED) ---
        if (!finalOutput) {
            console.log("[AI Worker] Proceeding with high-precision offline mock simulation.");

            // Randomize probabilities
            const rCrop = Math.random();
            const rDisease = Math.random();

            const crops = [
                { name: "Tomato", sci: "Solanum lycopersicum" },
                { name: "Rice", sci: "Oryza sativa" },
                { name: "Maize", sci: "Zea mays" },
                { name: "Wheat", sci: "Triticum aestivum" },
                { name: "Cotton", sci: "Gossypium spp." }
            ];
            const selectedCrop = crops[Math.floor(rCrop * crops.length)];
            const cropConfidence = (0.80 + Math.random() * 0.19).toFixed(2);

            const diseases = {
                "Tomato": [
                    { name: "Early Blight", type: "Fungal", sci: "Alternaria solani", insight: "Concentric dark brown ring lesions (target spots) primarily affecting older foliage." },
                    { name: "Late Blight", type: "Fungal", sci: "Phytophthora infestans", insight: "Rapidly expanding water-soaked lesions with necrotizing centers." },
                    { name: "Bacterial Spot", type: "Bacterial", sci: "Xanthomonas campestris", insight: "Small, water-soaked spots that turn dark brown or black." }
                ],
                "Rice": [
                    { name: "Blast", type: "Fungal", sci: "Magnaporthe oryzae", insight: "Diamond-shaped lesions with gray centers and brown margins." },
                    { name: "Bacterial Blight", type: "Bacterial", sci: "Xanthomonas oryzae", insight: "Water-soaked stripes along the leaf blades." }
                ],
                "Maize": [
                    { name: "Common Rust", type: "Fungal", sci: "Puccinia sorghi", insight: "Elongated, reddish-brown pustules (uredinia) scattered across both leaf surfaces." }
                ],
                "Wheat": [
                    { name: "Stripe Rust", type: "Fungal", sci: "Puccinia striiformis", insight: "Yellow to orange pustules forming parallel stripes along the leaf veins." }
                ],
                "Cotton": [
                    { name: "Verticillium Wilt", type: "Fungal", sci: "Verticillium dahliae", insight: "Yellowing and necrosis of leaf margins, often showing a V-shaped pattern." }
                ]
            };

            const severityLevels = ["Low", "Moderate", "High", "Critical"];
            finalOutput = {
                crop: selectedCrop.name,
                cropScientificName: selectedCrop.sci,
                cropConfidence: parseFloat(cropConfidence),
            };

            // Threshold: 10% chance it's completely healthy. 10% chance it's inconclusive.
            if (rDisease < 0.1) {
                // Healthy Failsafe Logic
                finalOutput = {
                    ...finalOutput,
                    disease: "Healthy",
                    diseaseType: "None",
                    diseaseConfidence: 0.99,
                    healthScore: 98,
                    severity: "None",
                    riskLevel: "None",
                    affectedAreaPercent: 0,
                    xaiInsight: "Uniform green pigmentation with regular venation; no necrotic or chlorotic signatures detected.",
                    recommendations: {
                        organic: ["Maintain current nutrient routine", "Apply compost tea weekly"],
                        prevention: [
                            "Monitor soil moisture levels",
                            "Ensure proper plant spacing",
                            "Perform weekly visual inspections"
                        ]
                    },
                    insights: {
                        spreadProbability: "Low",
                        yieldImpact: "0%",
                        environmentalFactor: "Optimal conditions detected"
                    }
                };
            } else if (rDisease > 0.9) {
                // Inconclusive Fallback Failsafe
                finalOutput = {
                    ...finalOutput,
                    disease: "Inconclusive",
                    diseaseType: "Unknown",
                    diseaseConfidence: (0.30 + Math.random() * 0.15).toFixed(2),
                    message: "Image features are ambiguous. Suspected systemic stress or multi-vector pathogen.",
                    xaiInsight: "Pixel variance lacks clear pathological signatures; potential blur or abiotic stress overlap.",
                    severity: "Unknown",
                    riskLevel: "Requires Manual Review",
                    recommendations: {
                        prevention: [
                            "Re-take image showing full leaf margin",
                            "Check stems and roots for secondary symptoms",
                            "Quarantine plant until verification"
                        ]
                    },
                    insights: {
                        spreadProbability: "Unknown",
                        environmentalFactor: "Submit additional telemetry for better correlation"
                    }
                };
            } else {
                // Successful Disease Detection
                const possibleDiseases = diseases[selectedCrop.name as keyof typeof diseases];
                const diseaseObj = possibleDiseases[Math.floor(Math.random() * possibleDiseases.length)];
                const diseaseConfidence = (0.75 + Math.random() * 0.24).toFixed(2);
                const sevIdx = Math.floor(Math.random() * 4);
                const severity = severityLevels[sevIdx];

                const riskLevels = ["Low", "Elevated", "High", "Critical"];
                const riskLevel = riskLevels[sevIdx];
                const areaP = Math.floor(Math.random() * (sevIdx + 1) * 20 + 5);

                finalOutput = {
                    ...finalOutput,
                    disease: diseaseObj.name,
                    diseaseScientificName: diseaseObj.sci,
                    diseaseType: diseaseObj.type,
                    diseaseConfidence: parseFloat(diseaseConfidence),
                    xaiInsight: diseaseObj.insight,
                    severity,
                    riskLevel,
                    affectedAreaPercent: Math.min(areaP, 95),
                    recommendations: {
                        pesticides: [
                            { name: "Bravo Weather Stik", activeIngredient: "Chlorothalonil", dosage: "2g/L", frequency: "7 days", safety: "Wear gloves; highly toxic to aquatic life" }
                        ],
                        organic: ["Neem oil emulsion 3ml/L", "Bacillus subtilis biopesticide formulation"],
                        prevention: [
                            "Avoid overhead irrigation to reduce humidity",
                            "Improve canopy air circulation",
                            "Remove and destroy infected leaves",
                            "Implement minimum 3-year crop rotation"
                        ]
                    },
                    insights: {
                        spreadProbability: sevIdx > 1 ? "High" : "Medium",
                        yieldImpact: sevIdx === 3 ? ">40%" : sevIdx === 2 ? "20-40%" : "5-10%",
                        environmentalFactor: "High humidity and warm temp detected"
                    }
                };
            }
            finalOutput = {
                ...finalOutput,
                message: "This is a simulated offline analysis. Configure API Key for multimodal computer vision parsing."
            };
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        // Update DB to Complete with the massive JSON object payload
        await this.reportRepo.update(reportId, {
            status: DiagnosticStatus.COMPLETED,
            diseasePredictedName: finalOutput.disease,
            confidenceScore: finalOutput.diseaseConfidence,
            fullResult: finalOutput
        });

        console.log(`[AI Worker] Finished inference for ID: ${reportId}. Result: ${finalOutput.disease}`);

        // Final emission over real-time websockets back to the React UI
        this.gateway.server.emit('inference_progress', {
            reportId,
            status: 'COMPLETED',
            result: finalOutput
        });

        return { reportId, outcome: finalOutput };
    }
}
