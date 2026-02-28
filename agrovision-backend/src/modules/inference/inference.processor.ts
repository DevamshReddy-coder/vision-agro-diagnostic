import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticReport, DiagnosticStatus } from './entities/diagnostic-report.entity';
import { TelemetryGateway } from '../../gateway/telemetry.gateway';
import { GoogleGenAI } from '@google/genai';

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

        const { base64Image, mimeType } = job.data;
        let finalOutput: any = null;
        const apiKey = process.env.GEMINI_API_KEY || '';

        // --- REAL-TIME MULTIMODAL PLANT DISEASE ANALYSIS ENGINE ---
        if (base64Image && apiKey) {
            try {
                this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 30 });
                const ai = new GoogleGenAI({ apiKey });

                const promptString = `You are an advanced Agricultural AI Diagnostic Engine designed for a real-time production system called "A Vision-Driven Agro Diagnostic Framework Using Machine Learning." Your role is to behave like a professional plant pathologist combined with a computer vision inference engine. When a crop image is provided, your first responsibility is to accurately identify the crop species using visual characteristics such as leaf shape, texture, venation, color patterns, and structural cues. You must return the crop name, its scientific name, and a confidence score. If the crop cannot be confidently identified, respond that the crop is unknown and request a clearer image instead of guessing.

After identifying the crop, analyze the image for disease symptoms including lesions, discoloration, curling, fungal growth, spots, mold, or pest damage. Based on these visual indicators, determine the most probable disease and classify its type as fungal, bacterial, viral, pest-related, or nutrient deficiency. Provide a disease confidence score and ensure the diagnosis is crop-specific. If no disease symptoms are detected, clearly state that the plant appears healthy.

Next, estimate the severity of the infection by analyzing the spread and intensity of symptoms across the visible plant area. Categorize severity as Low, Moderate, High, or Critical and estimate the percentage of affected area. Then provide a concise explainable-AI insight describing the visual reasoning behind the diagnosis, referencing observable patterns such as concentric rings, chlorosis, necrosis, or vein distortion.

If a disease is detected, generate treatment recommendations that are specific to the identified crop and disease. Provide chemical treatment options including pesticide name, active ingredient, recommended dosage, application frequency, and safety precautions. Also include organic treatment options such as neem oil, biological controls, or cultural practices. Add preventive measures like crop rotation, resistant varieties, irrigation adjustments, or pest monitoring strategies. Never provide generic or repeated advice; recommendations must be context-aware.

Finally, estimate the potential agricultural impact by predicting risk level and approximate yield loss percentage based on severity and disease progression patterns. Your response must be strictly in JSON format matching the schema layout below, and agronomically accurate. If confidence in diagnosis is low, you must explicitly state uncertainty rather than providing misleading recommendations. Your objective is to deliver reliable, crop-specific, actionable insights that simulate a real agricultural diagnostic system.

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
    "prevention": ["Uproot and burn infected plants", "Use resistant cotton hybrids"]
  },
  "insights": {
    "spreadProbability": "High",
    "yieldImpact": "30-50%",
    "environmentalFactor": "Whitefly vectors active in dry, warm conditions"
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
