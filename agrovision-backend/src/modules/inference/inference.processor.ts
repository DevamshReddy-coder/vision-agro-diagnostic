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

        const { base64Image, mimeType, lat, lon, cropType } = job.data;
        let finalOutput: any = null;
        const apiKey = process.env.GEMINI_API_KEY || '';

        // --- VALIDATE API KEY ---
        if (!apiKey) {
            finalOutput = null;
            await this.reportRepo.update(reportId, { status: DiagnosticStatus.FAILED });
            this.gateway.server.emit('inference_progress', { reportId, status: 'FAILED', error: "AI Engine offline. Missing GEMINI_API_KEY." });
            return;
        }

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

        const cropHint = cropType && cropType !== "Potato" && cropType !== "None" ? `The user suspects or identified this plant as: ${cropType}. Use this as a strong hint, but verify it via the image characteristics.` : `The crop type was not provided. You MUST identify the crop species accurately.`;

        // --- REAL-TIME MULTIMODAL PLANT DISEASE ANALYSIS ENGINE ---
        try {
            this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 30 });
            const ai = new GoogleGenAI({ apiKey });

            const promptString = `You are an advanced AgroVision AI Intelligence Engine designed to power a real-time agricultural diagnostic system. Your role is an expert digital agronomist capable of combining computer vision, environmental data, and agronomy for disease diagnosis.

${weatherContext}
${cropHint}

CRITICAL TASK: Analyze the uploaded plant/leaf image meticulously. 
1. IDENTIFY THE CROP: Determine the plant species. Ignore user hints if the image is clearly a different plant.
2. DETECT DISEASE: Look for lesions, discoloration, pest damage, fungal fuzz, mosaic patterns, necrosis, chlorosis, or any disease vectors. If HEALTHY, explicitly state it.
3. SEVERITY & RISK: Estimate affected area percentage and severity.
4. WEATHER CONTEXT: Synthesize the provided weather data to determine if it exacerbates the condition or predicts spread (e.g. high humidity = fungal growth).
5. RECOMMENDATIONS: Give actionable, crop-specific treatments (both pesticide & organic) and prevention strategies.

JSON FORMAT SCHEMA (STRICTLY RETURN ONLY THIS JSON OBJECT, NO MARKDOWN TAGS, NO OTHER TEXT):
{
  "crop": "Extracted Crop Name",
  "cropScientificName": "Scientific Name of Crop",
  "cropConfidence": 0.95,
  "disease": "Specific Disease Name or 'Healthy'",
  "diseaseScientificName": "Pathogen Scientific Name or 'None'",
  "diseaseType": "Viral/Fungal/Bacterial/Pest/Nutrient/None",
  "diseaseConfidence": 0.92,
  "severity": "Low/Moderate/High/Critical/None",
  "riskLevel": "Low/Elevated/High/Critical/None",
  "affectedAreaPercent": 40,
  "xaiInsight": "Detailed visual cues observed driving this diagnosis. Why did you choose this disease?",
  "message": null,
  "healthScore": 60,
  "recommendations": {
    "pesticides": [
       { "name": "Pesticide Name", "activeIngredient": "Ingredient", "dosage": "Exact Dose", "frequency": "Interval", "safety": "Precautions" }
    ],
    "organic": ["Organic method 1", "Organic method 2"],
    "prevention": ["Prevention 1", "Prevention 2"],
    "preventiveSpraySchedule": ["Schedule 1", "Schedule 2"],
    "smartIrrigationAdvice": "Irrigation advice based on weather and disease."
  },
  "insights": {
    "spreadProbability": "High/Medium/Low based on weather",
    "yieldImpact": "Estimated yield loss %",
    "environmentalFactor": "Explanation of how the current weather affects this disease right now.",
    "next7DayForecast": "What to look out for based on next 3 day rain/temp forecast."
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
                    temperature: 0.1
                }
            });

            const rawJson = response.text;
            if (rawJson) {
                // Remove markdown code block syntax if Gemini wrapped it
                const jsonString = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
                finalOutput = JSON.parse(jsonString);
            }
            this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 95 });

            if (!finalOutput || !finalOutput.disease) {
                throw new Error("Invalid formulation of AI response.");
            }

            // Update DB to Complete with the exact AI JSON payload
            await this.reportRepo.update(reportId, {
                status: DiagnosticStatus.COMPLETED,
                diseasePredictedName: finalOutput.disease,
                confidenceScore: finalOutput.diseaseConfidence,
                fullResult: finalOutput
            });

            console.log(`[AI Worker] Finished inference for ID: ${reportId}. Result: ${finalOutput.disease} on ${finalOutput.crop}`);

            // Final emission over real-time websockets back to the React UI
            this.gateway.server.emit('inference_progress', {
                reportId,
                status: 'COMPLETED',
                result: finalOutput
            });

            return { reportId, outcome: finalOutput };

        } catch (err) {
            console.error("[AI Worker] Gemini Execution Failed:", err);

            // Log Error in DB
            await this.reportRepo.update(reportId, { status: DiagnosticStatus.FAILED });

            // Emit Failure properly to Frontend
            this.gateway.server.emit('inference_progress', {
                reportId,
                status: 'FAILED',
                error: "AI Infrastructure error: " + (err.message || 'Unknown network error. Please ensure GEMINI_API_KEY is robust.')
            });
            return null;
        }
    }
}
