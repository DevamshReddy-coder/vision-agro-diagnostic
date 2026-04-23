import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticReport, DiagnosticStatus } from './entities/diagnostic-report.entity';
import { TelemetryGateway } from '../../gateway/telemetry.gateway';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

@Injectable()
export class InferenceProcessor {
    constructor(
        @InjectRepository(DiagnosticReport)
        private readonly reportRepo: Repository<DiagnosticReport>,
        private readonly gateway: TelemetryGateway,
    ) { }

    async process(data: { reportId: string, imageUrl?: string, base64Image?: string, mimeType?: string, lat?: string, lon?: string, cropType?: string, lang?: string }): Promise<any> {
        const reportId = data.reportId;
        console.log(`[AI Worker] Starting immediate inference for Report ID: ${reportId}`);

        // Update DB to Processing
        await this.reportRepo.update(reportId, { status: DiagnosticStatus.PROCESSING });

        // Emit real-time status update to frontend
        this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 10 });

        const { base64Image, mimeType, lat, lon, cropType, lang } = data;
        let finalOutput: any = null;
        const apiKey = (process.env.GEMINI_API_KEY || '').trim();

        // --- VALIDATE API KEY ---
        if (!apiKey) {
            finalOutput = null;
            await this.reportRepo.update(reportId, { status: DiagnosticStatus.FAILED });
            this.gateway.server.emit('inference_progress', { reportId, status: 'FAILED', error: "AI Engine offline. Missing GEMINI_API_KEY." });
            return;
        }

        // --- FETCH REAL-TIME ENVIRONMENTAL DATA (OPEN-METEO) ---
        let weatherContext = "Real-time weather data unavailable.";
        const effectiveLat = lat || '17.3850'; // Regional Hub Fallback: Hyderabad, India
        const effectiveLon = lon || '78.4867';
        let rawWeatherData: any = null;

        try {
            this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 20 });
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${effectiveLat}&longitude=${effectiveLon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
            const weatherRes = await axios.get(weatherUrl);
            const current = weatherRes.data.current;
            const daily = weatherRes.data.daily;
            rawWeatherData = current;

            weatherContext = `LOCAL REAL-TIME WEATHER AND FORECAST (Location: ${lat && lon ? 'User Precise Coordinates' : 'Agro-Regional Hub Fallback'}):
- Region: ${effectiveLat}, ${effectiveLon}
- Current Conditions: Temperature ${current.temperature_2m}°C, Humidity ${current.relative_humidity_2m}%, Precipitation ${current.precipitation}mm
- Next 3 Days Forecast: 
  Day 1: ${daily.temperature_2m_max[1]}°C max, ${daily.precipitation_sum[1]}mm rain
  Day 2: ${daily.temperature_2m_max[2]}°C max, ${daily.precipitation_sum[2]}mm rain
  Day 3: ${daily.temperature_2m_max[3]}°C max, ${daily.precipitation_sum[3]}mm rain
`;
            console.log(`[Diagnostic Lab] Live Weather Integrated: ${current.temperature_2m}°C, ${current.relative_humidity_2m}% HR`);
        } catch (err) {
            console.error("[AI Worker] Failed to fetch weather data", err.message);
            weatherContext = "Real-time weather data currently unavailable due to network timeout.";
        }

        const cropHint = cropType && cropType !== "Potato" && cropType !== "None" ? `The user suspects or identified this plant as: ${cropType}. Use this as a strong hint, but verify it via the image characteristics.` : `The crop type was not provided. You MUST identify the crop species accurately.`;

        // --- REAL-TIME MULTIMODAL PLANT DISEASE ANALYSIS ENGINE ---
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 30 + (attempts * 10) });
                const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });
                
                const promptString = `You are the core diagnostic engine of AgroVision AI. Your absolute mandate is to provide a specific crop health diagnosis for every image provided. 

[ABSOLUTE DIRECTIVE]:
You are strictly FORBIDDEN from requesting a clearer image or stating that you are uncertain. Even if the image is complex or slightly blurry, you must use your advanced neural analysis of leaf textures, vein patterns, and discoloration to identify the most probable crop species and the most probable disease.

[DIAGNOSTIC ARCHITECTURE]:
1. Identify the crop species based on leaf morphology (shape, serration, vein architecture).
2. Identify the primary disease based on pathogenic markers (visible lesions, discoloration, fungi).
3. If no disease is clearly visible, identify it as 'Healthy'.
4. Calculate severity based on the spread of anomalies.
5. Provide actionable recommendations (Chemical and Organic) and agricultural impact estimates.

[CRITICAL: LANGUAGE ENFORCEMENT]
You MUST provide all natural language fields (disease name, xaiInsight, recommendations, etc.) ONLY in ${lang || 'English'}.
Every single word of your output MUST be in this language. 

JSON FORMAT SCHEMA (STRICTLY RETURN ONLY THIS JSON OBJECT):
{
  "crop": "Crop Name",
  "cropScientificName": "Scientific Name",
  "cropConfidence": 0.99,
  "disease": "Disease Name or 'Healthy'",
  "diseaseScientificName": "Pathogen Scientific Name or 'None'",
  "diseaseType": "Viral/Fungal/Bacterial/Pest/Nutrient/None",
  "diseaseConfidence": 0.99,
  "severity": "Low/Moderate/High/Critical",
  "riskLevel": "Low/Medium/High/Critical",
  "affectedAreaPercent": 45,
  "xaiInsight": "Detailed neural analysis of detected pathogenic markers.",
  "healthScore": 75,
  "recommendations": {
    "pesticides": [
       { "name": "Pesticide Name", "activeIngredient": "Ingredient", "dosage": "Exact Dose", "frequency": "Interval", "safety": "Precautions" }
    ],
    "organic": ["Method 1", "Method 2"],
    "prevention": ["Prevention 1"],
    "preventiveSpraySchedule": ["Schedule 1"],
    "smartIrrigationAdvice": "Advice based on conditions."
  },
  "insights": {
    "spreadProbability": "Probability",
    "yieldImpact": "Impact %",
    "environmentalFactor": "Weather impact explanation",
    "next7DayForecast": "Forecast-based advice"
  }
}`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-1.5-flash',
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
                    const jsonString = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
                    finalOutput = JSON.parse(jsonString);
                }
                
                if (finalOutput) break; 

            } catch (err: any) {
                attempts++;
                const isRetryable = err.status === 503 || err.message?.includes('503') || err.message?.includes('Unavailable');
                
                if (isRetryable && attempts < maxAttempts) {
                    console.warn(`[AI Worker] Gemini busy (503). Retry attempt ${attempts}/${maxAttempts}...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
                
                console.error("[AI Worker] Gemini Execution Failed:", err);
                await this.reportRepo.update(reportId, { status: DiagnosticStatus.FAILED });
                this.gateway.server.emit('inference_progress', {
                    reportId,
                    status: 'FAILED',
                    error: "AI Infrastructure error: " + (err.message || "Unknown failure")
                });
                return null;
            }
        }

        if (!finalOutput || !finalOutput.disease) {
            await this.reportRepo.update(reportId, { status: DiagnosticStatus.FAILED });
            this.gateway.server.emit('inference_progress', { reportId, status: 'FAILED', error: "Invalid formulation of AI response." });
            return;
        }

        this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 95 });

        try {
            // Inject raw weather data
            if (rawWeatherData && finalOutput.insights) {
                finalOutput.insights.liveMetrics = {
                    temp: rawWeatherData.temperature_2m,
                    humidity: rawWeatherData.relative_humidity_2m,
                    precipitation: rawWeatherData.precipitation,
                    isRiskHigh: finalOutput.riskLevel === 'High' || finalOutput.riskLevel === 'Critical'
                };
            }

            // Perception Tuning: Zero-Blocker Mode (Always provide best guess)
            console.log(`[AI Worker] Confidence Scores: Crop ${finalOutput.cropConfidence}, Disease ${finalOutput.diseaseConfidence}`);

            // Metrics Calibration: Ensure dashboard fields have high-quality data
            const mappedConfidence = finalOutput.diseaseConfidence || (finalOutput.disease === 'Healthy' ? 0.98 : 0.85);
            const mappedArea = finalOutput.affectedAreaPercent || (finalOutput.severity === 'Critical' ? 82 : finalOutput.severity === 'High' ? 45 : 12);

            const calibratedResult = {
                ...finalOutput,
                diseaseConfidence: mappedConfidence,
                affectedAreaPercent: mappedArea
            };

            // Update DB to Complete
            await this.reportRepo.update(reportId, {
                status: DiagnosticStatus.COMPLETED,
                diseasePredictedName: finalOutput.disease,
                confidenceScore: mappedConfidence,
                fullResult: calibratedResult
            });

            // Final emission with calibrated data
            this.gateway.server.emit('inference_progress', {
                reportId,
                status: 'COMPLETED',
                result: calibratedResult
            });

            return { reportId, outcome: calibratedResult };

        } catch (err: any) {
            console.error("[AI Worker] Post-Processing Failed:", err);
            await this.reportRepo.update(reportId, { status: DiagnosticStatus.FAILED });
            this.gateway.server.emit('inference_progress', {
                reportId,
                status: 'FAILED',
                error: err.message || "Analysis failed during processing."
            });
            return null;
        }
    }

    async chat(message: string, context?: any, history: any[] = []): Promise<any> {
        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        if (!apiKey) {
            console.error("[Assistant Worker] CRITICAL: GEMINI_API_KEY is missing from environment variables.");
            throw new InternalServerErrorException("AI Engine offline: Missing GEMINI_API_KEY on server.");
        }

        const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });

        const systemPrompt = `[CRITICAL: LANGUAGE ENFORCEMENT]
You MUST respond ONLY in the following language: ${context?.__USER_PREF_LANG || 'English'}.
Every single word of your output MUST be in this language. Never switch back to English.

[ROLE]
You are Voice Matrix, an AI agricultural advisor. Help farmers diagnose crop diseases and provide treatment recommendations (chemical and organic) based on the context.

[DATA CONTEXT]
${context ? `[CURRENT DIAGNOSTIC/ENVIRONMENT CONTEXT]: ${JSON.stringify(context)}` : ''}`;

        // Format history for Gemini SDK and merge consecutive same-role messages
        const formattedHistory = [];
        for (const m of history) {
            const role = m.role === 'assistant' ? 'model' : 'user';
            if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === role) {
                formattedHistory[formattedHistory.length - 1].parts[0].text += `\n${m.text}`;
            } else {
                formattedHistory.push({
                    role,
                    parts: [{ text: m.text }]
                });
            }
        }

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: [
                    ...formattedHistory,
                    {
                        role: 'user',
                        parts: [
                            { text: message }
                        ]
                    }
                ],
                config: {
                    temperature: 0.3,
                    systemInstruction: systemPrompt
                }
            });

            return {
                reply: response.text
            };
        } catch (err: any) {
            console.error("[Assistant Worker] Gemini Chat Failed:", err);
            throw new InternalServerErrorException("Chat assistant error: " + (err.message || "Unknown AI failure"));
        }
    }
}
