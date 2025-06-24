// import { NextRequest, NextResponse } from "next/server";
// import { StatusCodes } from "http-status-codes";
// import { IdempotentWebhookService } from "@/features/payments/services/idempotent-webhook.service";
// import {
//   getWebhookEventStats,
//   getRetryableWebhookEvents,
// } from "@/features/payments/queries/webhook-events";

// export async function GET(request: NextRequest) {
//   try {
//     const url = new URL(request.url);
//     const action = url.searchParams.get("action");

//     switch (action) {
//       case "stats":
//         return await getStats();
//       case "retryable":
//         return await getRetryableEvents();
//       default:
//         return await getStats();
//     }
//   } catch (error) {
//     console.error("Error in webhook monitor API:", error);
//     return NextResponse.json(
//       { error: "Failed to get webhook statistics" },
//       { status: StatusCodes.INTERNAL_SERVER_ERROR },
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { action, jobId } = body;

//     switch (action) {
//       case "pause":
//         await IdempotentWebhookService.pauseProcessing();
//         return NextResponse.json({
//           success: true,
//           message: "Webhook processing paused",
//         });

//       case "resume":
//         await IdempotentWebhookService.resumeProcessing();
//         return NextResponse.json({
//           success: true,
//           message: "Webhook processing resumed",
//         });

//       case "retry":
//         if (!jobId) {
//           return NextResponse.json(
//             { error: "Job ID is required for retry action" },
//             { status: StatusCodes.BAD_REQUEST },
//           );
//         }
//         const retrySuccess =
//           await IdempotentWebhookService.retryFailedWebhook(jobId);
//         return NextResponse.json({
//           success: retrySuccess,
//           message: retrySuccess
//             ? "Job retried successfully"
//             : "Failed to retry job",
//         });

//       case "maintenance":
//         const maintenanceResult =
//           await IdempotentWebhookService.performMaintenance();
//         return NextResponse.json(maintenanceResult);

//       default:
//         return NextResponse.json(
//           { error: "Invalid action" },
//           { status: StatusCodes.BAD_REQUEST },
//         );
//     }
//   } catch (error) {
//     console.error("Error in webhook monitor POST:", error);
//     return NextResponse.json(
//       { error: "Failed to perform action" },
//       { status: StatusCodes.INTERNAL_SERVER_ERROR },
//     );
//   }
// }

// /**
//  * Get comprehensive webhook statistics
//  */
// async function getStats() {
//   try {
//     const [processingStats, dbStats] = await Promise.all([
//       IdempotentWebhookService.getProcessingStats(),
//       getWebhookEventStats(),
//     ]);

//     return NextResponse.json({
//       success: true,
//       data: {
//         processing: processingStats,
//         database: dbStats.data,
//         timestamp: new Date().toISOString(),
//       },
//     });
//   } catch (error) {
//     console.error("Error getting webhook stats:", error);
//     throw error;
//   }
// }

// /**
//  * Get events that can be retried
//  */
// async function getRetryableEvents() {
//   try {
//     const { data: retryableEvents, error } =
//       await getRetryableWebhookEvents(50);

//     if (error) {
//       throw new Error(`Failed to get retryable events: ${error.message}`);
//     }

//     return NextResponse.json({
//       success: true,
//       data: {
//         retryableEvents: retryableEvents || [],
//         count: retryableEvents?.length || 0,
//         timestamp: new Date().toISOString(),
//       },
//     });
//   } catch (error) {
//     console.error("Error getting retryable events:", error);
//     throw error;
//   }
// }
