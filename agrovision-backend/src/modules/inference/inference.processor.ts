import { Injectable } from '@nestjs/common';
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

    async process(data: { reportId: string, imageUrl?: string, base64Image?: string, mimeType?: string, lat?: string, lon?: string, cropType?: string }): Promise<any> {
        const reportId = data.reportId;
        console.log(`[AI Worker] Starting immediate inference for Report ID: ${reportId}`);

        // Update DB to Processing
        await this.reportRepo.update(reportId, { status: DiagnosticStatus.PROCESSING });

        // Emit real-time status update to frontend
        this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 10 });

        const { base64Image, mimeType, lat, lon, cropType } = data;
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

            const promptString = `You are the core intelligence engine of a production agricultural diagnostic platform called “AgroVision AI – A Vision-Driven Agro Diagnostic Framework Using Machine Learning.” Your responsibility is to perform reliable, real-time crop health analysis by combining computer vision results, machine learning predictions, environmental data, and agronomic knowledge. 

When a crop image is uploaded, the system will first receive a crop classification result from the trained vision model. You must strictly use this crop classification output and never guess the crop type on your own. If the crop classification confidence is below 70 percent, you must return a response indicating that the crop identification is uncertain and request a clearer image instead of generating an incorrect diagnosis. 

Once the crop species is confirmed, analyze the plant image for visual disease indicators such as discoloration, lesions, chlorosis, necrotic tissue, fungal patterns, mosaic textures, pest damage, leaf deformation, mildew, or abnormal growth structures. Based on these observable visual symptoms and the crop type detected by the model, determine the most probable disease affecting the plant. 

The disease prediction must always be limited to diseases that are scientifically known to affect the detected crop species, ensuring that cross-crop misclassification is never allowed. For example, if the crop is cotton, only cotton diseases such as cotton leaf curl virus, bacterial blight, or fusarium wilt should be considered. 

After identifying the disease, estimate the severity level by analyzing the percentage of infected plant area detected through image segmentation or visual symptom spread. Classify the severity as low, moderate, high, or critical based on the distribution of lesions and the proportion of infected tissue. Provide a short explainable-AI reasoning that describes why the disease was identified, referencing the visual patterns that support the diagnosis. 

Next, incorporate environmental intelligence by evaluating real-time weather and soil data including temperature, humidity, rainfall, soil moisture, and wind conditions. Use these environmental parameters to determine whether current conditions favor disease development or pathogen spread. If weather conditions are highly favorable for the detected disease, increase the predicted risk level accordingly and provide a short explanation describing how environmental factors influence the disease progression. 

Once the diagnosis and environmental risk are established, generate treatment recommendations that are strictly specific to the crop and the detected disease. Provide chemical treatment options including pesticide name, active ingredient, dosage recommendation, spray interval, and safety precautions. In addition, include organic or integrated pest management practices such as neem oil application, biological control agents, crop rotation, irrigation adjustments, resistant crop varieties, and field sanitation practices. Recommendations must always be agronomically valid and must never repeat generic solutions for unrelated crops or diseases. 

Finally, estimate the potential agricultural impact by predicting the likely yield loss percentage if the disease remains untreated and classify the overall threat level as low, medium, high, or critical. 

Your response must be structured, accurate, crop-specific, and suitable for integration into a real-time agricultural decision support system used by farmers and agronomists. If model confidence is low or visual evidence is insufficient, you must explicitly indicate uncertainty rather than generating a misleading diagnosis. Your objective is to deliver trustworthy, real-time crop disease intelligence that helps prevent crop loss and supports precision agriculture through data-driven analysis.

${weatherContext}
${cropHint}

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
  "riskLevel": "Low/Medium/High/Critical/None",
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
