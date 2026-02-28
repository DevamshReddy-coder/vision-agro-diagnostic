import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticReport, DiagnosticStatus } from './entities/diagnostic-report.entity';
import { TelemetryGateway } from '../../gateway/telemetry.gateway';

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

        // Simulate Heavy Neural Net Image Processing (1.5 seconds)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // --- REAL-TIME PLANT DISEASE ANALYSIS ENGINE SIMULATION ---

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

        let finalOutput: any = {
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
