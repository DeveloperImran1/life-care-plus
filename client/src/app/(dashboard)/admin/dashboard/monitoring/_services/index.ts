"use server";

import { serverFetch } from "@/services/http";

export async function getLogs(queryString?: string) {
    try {
        const searchParams = new URLSearchParams(queryString || "");
        const page = searchParams.get("page") || "1";
        const searchTerm = searchParams.get("searchTerm") || "all";
        const level = searchParams.get("level") || "all";
        const method = searchParams.get("method") || "all";
        const statusCode = searchParams.get("statusCode") || "all";

        const response = await serverFetch.get(`/logs${queryString ? `?${queryString}` : ""}`, {
            next: {
                tags: [
                    "logs-list",
                    `logs-page-${page}`,
                    `logs-search-${searchTerm}`,
                    `logs-level-${level}`,
                    `logs-method-${method}`,
                    `logs-status-${statusCode}`,
                ],
                revalidate: 60, // Refresh frequently
            },
        });
        const result = await response.json();

        console.log("dadadada+++++++", response);

        return result;
    } catch (error: any) {
        console.error("Error fetching logs:", error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === "development" ? error.message : "Something went wrong"}`
        };
    }
}

export async function getLogStats() {
    try {
        const response = await serverFetch.get("/logs/stats", {
            next: {
                tags: ["logs-stats"],
                revalidate: 60,
            }
        });
        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error("Error fetching log stats:", error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === "development" ? error.message : "Something went wrong"}`
        };
    }
}
