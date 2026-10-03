import { Router } from "express";
import { getHealth } from "../controllers/health.controller.js";

export const healthRoutes = Router();

/**
 * GET /api/v1/health
 *
 * Auth:     none (public)
 * Purpose:  Confirm the API process is running and Postgres is reachable.
 *           Used by deploy checks, load balancers, and the client scaffold page.
 *
 * Response 200:
 *   {
 *     success: true,
 *     data: {
 *       status: "ok",
 *       database: "connected",
 *       timestamp: string   // ISO-8601
 *     }
 *   }
 *
 * Response 500:
 *   { success: false, error: "Internal server error" }   // DB query failed
 */
healthRoutes.get("/health", getHealth);
