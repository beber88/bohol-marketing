/* eslint-disable @typescript-eslint/no-explicit-any */
import { inngest } from "./client";

// ============================================================
// Inngest v4: createFunction(options, handler) — triggers live inside options
// ============================================================

// ----- DAILY CRON FUNCTIONS -----

export const dailyMorningRoutine = inngest.createFunction(
  { id: "mkt-daily-morning-routine", triggers: [{ cron: "TZ=Asia/Manila 0 8 * * *" }] },
  async ({ step }: any) => {
    const metrics = await step.run("collect-metrics", async () => {
      const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
      const supabase = createSupabaseAdmin();
      if (!supabase) return { error: "Supabase not configured" };
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split("T")[0];
      const { data } = await supabase.from("performance_metrics").select("*").eq("date", dateStr);
      return { date: dateStr, metrics: data || [] };
    });

    const newLeads = await step.run("check-new-leads", async () => {
      const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
      const supabase = createSupabaseAdmin();
      if (!supabase) return { count: 0, leads: [] };
      const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
      const { data } = await supabase.from("leads").select("*").gte("created_at", oneDayAgo).order("lead_score", { ascending: false });
      return { count: data?.length || 0, leads: data || [] };
    });

    await step.run("score-leads", async () => {
      const unscored = newLeads.leads.filter((l: any) => l.lead_score === 0);
      for (const lead of unscored) {
        await inngest.send({ name: "marketing/lead.score", data: { leadId: lead.id } });
      }
      return { scored: unscored.length };
    });

    const brief = await step.run("generate-cmo-brief", async () => {
      try {
        const { cmoOrchestrator } = await import("@/lib/agents/cmo-orchestrator");
        return (await cmoOrchestrator.execute({ trigger: "daily_morning_routine", context: { date: new Date().toISOString().split("T")[0], metrics, newLeads: newLeads.count, type: "daily_brief" } })).data;
      } catch (e) { console.error("CMO brief failed:", e); return null; }
    });

    return { status: "completed", metrics, newLeads: newLeads.count, brief };
  }
);

export const dailyContentPosting = inngest.createFunction(
  { id: "mkt-daily-content-posting", triggers: [{ cron: "TZ=Asia/Manila 0 10 * * *" }] },
  async ({ step }: any) => {
    const scheduled = await step.run("get-scheduled-content", async () => {
      const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
      const supabase = createSupabaseAdmin();
      if (!supabase) return [];
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase.from("content_pieces").select("*").eq("status", "approved").lte("created_at", today + "T23:59:59Z");
      return data || [];
    });

    const results = await step.run("validate-and-publish", async () => {
      const published: string[] = [], failed: string[] = [];
      for (const piece of scheduled) {
        try {
          const { quickValidate } = await import("@/lib/agents/brand-guard");
          const v = quickValidate(piece.body_text || "", piece.language || "en", piece.market || "INTL");
          (v.passed ? published : failed).push(piece.id);
        } catch { failed.push(piece.id); }
      }
      return { published: published.length, failed: failed.length };
    });

    return { status: "completed", results };
  }
);

export const dailyLeadCheck = inngest.createFunction(
  { id: "mkt-daily-lead-check", triggers: [{ cron: "TZ=Asia/Manila 0 13 * * *" }] },
  async ({ step }: any) => {
    const hotLeads = await step.run("find-hot-leads", async () => {
      const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
      const supabase = createSupabaseAdmin();
      if (!supabase) return [];
      const { data } = await supabase.from("leads").select("*").in("lead_status", ["hot", "very_hot"]).is("assigned_to", null);
      return data || [];
    });

    if (hotLeads.length > 0) {
      await step.run("alert-sales-team", async () => {
        console.log(`[ALERT] ${hotLeads.length} unassigned hot leads found!`);
        return { alerted: hotLeads.length };
      });
    }

    return { status: "completed", hotLeads: hotLeads.length };
  }
);

export const dailyOptimization = inngest.createFunction(
  { id: "mkt-daily-optimization", triggers: [{ cron: "TZ=Asia/Manila 0 17 * * *" }] },
  async ({ step }: any) => {
    const recs = await step.run("analyze-campaigns", async () => {
      try {
        const { performanceAds } = await import("@/lib/agents/performance-ads");
        return (await performanceAds.execute({ trigger: "daily_optimization", context: { type: "daily_review" } })).data;
      } catch (e) { console.error("Perf analysis failed:", e); return null; }
    });
    return { status: "completed", recommendations: recs };
  }
);

export const dailyEveningWrap = inngest.createFunction(
  { id: "mkt-daily-evening-wrap", triggers: [{ cron: "TZ=Asia/Manila 0 21 * * *" }] },
  async ({ step }: any) => {
    await step.run("final-snapshot", async () => ({ snapshot: "completed", ts: new Date().toISOString() }));
    await step.run("update-heartbeat", async () => {
      const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
      const supabase = createSupabaseAdmin();
      if (!supabase) return;
      await supabase.from("agent_runs").insert({ agent_name: "system", trigger: "daily_evening_wrap", input_summary: "EOD wrap", output_summary: "Day completed", run_status: "complete", model_used: "system" });
      return { heartbeat: "ok" };
    });
    return { status: "completed" };
  }
);

export const weeklyStrategyReview = inngest.createFunction(
  { id: "mkt-weekly-strategy-review", triggers: [{ cron: "TZ=Asia/Manila 0 9 * * 1" }] },
  async ({ step }: any) => {
    const report = await step.run("weekly-report", async () => {
      try {
        const { analyticsReporter } = await import("@/lib/agents/analytics-reporter");
        return (await analyticsReporter.execute({ trigger: "weekly_review", context: { period: "last_7_days" } })).data;
      } catch (e) { console.error("Weekly report failed:", e); return null; }
    });

    const strategy = await step.run("council-review", async () => {
      try {
        const { runCouncil } = await import("@/lib/council/council");
        return await runCouncil({
          query: `Review weekly marketing performance for Blue Everest Panglao Prime Villas:\n\n${JSON.stringify(report, null, 2)}\n\nFocus on: budget reallocation, content strategy, channel performance, lead quality.`,
          systemPrompt: "You are a senior marketing strategist reviewing weekly performance for a luxury real estate investment project in the Philippines targeting Israeli and global investors.",
        });
      } catch (e) { console.error("Council review failed:", e); return null; }
    });

    return { status: "completed", report, strategy };
  }
);

export const fxRateUpdate = inngest.createFunction(
  { id: "mkt-fx-rate-update", triggers: [{ cron: "TZ=Asia/Manila 0 6 * * *" }] },
  async ({ step }: any) => {
    await step.run("update-fx", async () => {
      console.log("[FX] Rate update check at", new Date().toISOString());
      return { updated: false, reason: "Using manual rates from config/fx_today.json" };
    });
    return { status: "completed" };
  }
);

// ----- EVENT-DRIVEN FUNCTIONS -----

export const metaWebhookProcess = inngest.createFunction(
  { id: "mkt-meta-webhook-process", triggers: [{ event: "marketing/meta.webhook" }] },
  async ({ event, step }: any) => {
    const { leadData } = event.data;
    const lead = await step.run("create-lead", async () => {
      const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
      const supabase = createSupabaseAdmin();
      if (!supabase) return null;
      const { data } = await supabase.from("leads").insert({ source: "meta_lead_ad", full_name: leadData.fullName, email: leadData.email, phone: leadData.phone, utm_source: "meta", utm_medium: "paid", raw_data: leadData }).select().single();
      return data;
    });

    if (lead) {
      await step.run("score-lead", async () => {
        const { quickScore } = await import("@/lib/agents/crm-lead-scorer");
        const score = quickScore({ fullName: lead.full_name, email: lead.email, phone: lead.phone, nationality: lead.nationality, source: "meta_lead_ad", activities: [{ type: "form_submission", channel: "meta" }] });
        const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
        const supabase = createSupabaseAdmin();
        if (supabase) await supabase.from("leads").update({ lead_score: score.score, lead_status: score.status }).eq("id", lead.id);
        return score;
      });
    }
    return { status: "completed", leadId: lead?.id };
  }
);

export const watiWebhookProcess = inngest.createFunction(
  { id: "mkt-wati-webhook-process", triggers: [{ event: "marketing/wati.webhook" }] },
  async ({ event, step }: any) => {
    const { message, from } = event.data;
    const analysis = await step.run("analyze-message", async () => {
      try {
        const { whatsappAgent } = await import("@/lib/agents/whatsapp-agent");
        return (await whatsappAgent.execute({ trigger: "inbound_message", context: { action: "process_inbound", from, message } })).data;
      } catch (e) { console.error("WA analysis failed:", e); return null; }
    });

    await step.run("log-activity", async () => {
      const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
      const supabase = createSupabaseAdmin();
      if (!supabase) return;
      const { data: lead } = await supabase.from("leads").select("id").or(`phone.eq.${from},whatsapp.eq.${from}`).single();
      if (lead) await supabase.from("lead_activities").insert({ lead_id: lead.id, activity_type: "whatsapp_received", description: message, channel: "whatsapp", metadata: { analysis } });
    });

    return { status: "completed", analysis };
  }
);

export const contentGenerate = inngest.createFunction(
  { id: "mkt-content-generate", triggers: [{ event: "marketing/content.generate" }] },
  async ({ event, step }: any) => {
    const { briefId, contentType, platform, language, market, pillar, awarenessLevel, funnelStage } = event.data;
    const content = await step.run("generate", async () => {
      try {
        const { copywriter } = await import("@/lib/agents/copywriter");
        return await copywriter.execute({ briefId, context: { contentType, platform, language, market, pillar, awarenessLevel, funnelStage } });
      } catch (e) { console.error("Content gen failed:", e); return null; }
    });

    if (content?.success && content.data) {
      await step.run("store", async () => {
        const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
        const supabase = createSupabaseAdmin();
        if (!supabase) return;
        const d = content.data as any;
        await supabase.from("content_pieces").insert({ content_type: contentType, language, headline: d.headline, body_text: d.body, cta_text: d.cta, status: "review", brand_guard_passed: d.brandGuardResult?.passed ?? false, brand_guard_result: d.brandGuardResult, metadata: { market, pillar, awarenessLevel, funnelStage, platform } });
      });
    }
    return { status: "completed", content: content?.data };
  }
);

export const brandGuardCheck = inngest.createFunction(
  { id: "mkt-brand-guard-check", triggers: [{ event: "marketing/brand.check" }] },
  async ({ event, step }: any) => {
    const { contentId, content, language, market } = event.data;
    const result = await step.run("validate", async () => {
      const { quickValidate } = await import("@/lib/agents/brand-guard");
      return quickValidate(content, language, market);
    });

    if (contentId) {
      await step.run("update-status", async () => {
        const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
        const supabase = createSupabaseAdmin();
        if (supabase) await supabase.from("content_pieces").update({ brand_guard_passed: result.passed, brand_guard_result: result, status: result.passed ? "approved" : "review" }).eq("id", contentId);
      });
    }
    return { status: "completed", result };
  }
);

export const leadScore = inngest.createFunction(
  { id: "mkt-lead-score", triggers: [{ event: "marketing/lead.score" }] },
  async ({ event, step }: any) => {
    const { leadId } = event.data;
    const score = await step.run("score", async () => {
      const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
      const supabase = createSupabaseAdmin();
      if (!supabase) return null;
      const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).single();
      if (!lead) return null;
      const { data: activities } = await supabase.from("lead_activities").select("*").eq("lead_id", leadId);
      const { quickScore } = await import("@/lib/agents/crm-lead-scorer");
      const result = quickScore({ fullName: lead.full_name, email: lead.email, phone: lead.phone, whatsapp: lead.whatsapp, nationality: lead.nationality, source: lead.source, purpose: lead.purpose, budgetConfirmed: lead.budget_confirmed, villaInterest: lead.villa_interest, activities: (activities || []).map((a: any) => ({ type: a.activity_type, channel: a.channel, timestamp: a.created_at })) });
      await supabase.from("leads").update({ lead_score: result.score, lead_status: result.status }).eq("id", leadId);
      return result;
    });
    return { status: "completed", score };
  }
);

export const marketingFunctions = [
  dailyMorningRoutine, dailyContentPosting, dailyLeadCheck, dailyOptimization,
  dailyEveningWrap, weeklyStrategyReview, fxRateUpdate,
  metaWebhookProcess, watiWebhookProcess, contentGenerate, brandGuardCheck, leadScore,
];
