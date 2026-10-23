import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "10mb" }));

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY trong Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper: Replace variable placeholders in prompt templates
function interpolateVariables(
  template: string,
  contextData: {
    inputs?: Record<string, any>;
    nodeOutputs?: Record<string, { outputText: string; jsonOutput?: any }>;
    globals?: Record<string, any>;
  }
): string {
  if (!template) return "";

  let result = template;

  // Replace {{input.varName}} or {{inputs.varName}}
  if (contextData.inputs) {
    Object.entries(contextData.inputs).forEach(([key, val]) => {
      const regex1 = new RegExp(`{{\\s*input\\.${key}\\s*}}`, "g");
      const regex2 = new RegExp(`{{\\s*inputs\\.${key}\\s*}}`, "g");
      const strVal = typeof val === "object" ? JSON.stringify(val, null, 2) : String(val ?? "");
      result = result.replace(regex1, strVal).replace(regex2, strVal);
    });
  }

  // Replace {{global.varName}} or {{globals.varName}}
  if (contextData.globals) {
    Object.entries(contextData.globals).forEach(([key, val]) => {
      const regex = new RegExp(`{{\\s*global(s)?\\.${key}\\s*}}`, "g");
      const strVal = typeof val === "object" ? JSON.stringify(val, null, 2) : String(val ?? "");
      result = result.replace(regex, strVal);
    });
  }

  // Replace {{nodes.node_id.output}} or {{nodes.node_id.text}} or {{node_id.output}}
  if (contextData.nodeOutputs) {
    Object.entries(contextData.nodeOutputs).forEach(([nodeId, outputData]) => {
      const regexNodeOutput = new RegExp(`{{\\s*nodes\\.${nodeId}\\.output\\s*}}`, "g");
      const regexNodeText = new RegExp(`{{\\s*nodes\\.${nodeId}\\.text\\s*}}`, "g");
      const regexShortOutput = new RegExp(`{{\\s*node_${nodeId}\\.output\\s*}}`, "g");
      const strVal = outputData.outputText || "";
      result = result
        .replace(regexNodeOutput, strVal)
        .replace(regexNodeText, strVal)
        .replace(regexShortOutput, strVal);

      // If json output exists, allow {{nodes.node_id.json.field}}
      if (outputData.jsonOutput && typeof outputData.jsonOutput === "object") {
        Object.entries(outputData.jsonOutput).forEach(([jKey, jVal]) => {
          const jRegex = new RegExp(`{{\\s*nodes\\.${nodeId}\\.json\\.${jKey}\\s*}}`, "g");
          const jStr = typeof jVal === "object" ? JSON.stringify(jVal) : String(jVal ?? "");
          result = result.replace(jRegex, jStr);
        });
      }
    });
  }

  return result;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Single node runner API
app.post("/api/workflow/run-node", async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      nodeId,
      model = "gemini-3.6-flash",
      systemInstruction = "",
      contextPrompt = "",
      temperature = 0.7,
      topP = 0.95,
      maxTokens = 2048,
      tools = [],
      inputs = {},
      nodeOutputs = {},
      globals = {},
      thinkingLevel,
    } = req.body;

    const interpolatedPrompt = interpolateVariables(contextPrompt, {
      inputs,
      nodeOutputs,
      globals,
    });

    const ai = getGenAI();

    // Prepare config object
    const config: any = {
      temperature: Math.min(Math.max(Number(temperature) || 0.7, 0), 2),
      topP: Math.min(Math.max(Number(topP) || 0.95, 0), 1),
    };

    if (systemInstruction && systemInstruction.trim()) {
      config.systemInstruction = interpolateVariables(systemInstruction, {
        inputs,
        nodeOutputs,
        globals,
      });
    }

    // Configure tools
    const toolList: any[] = [];
    if (Array.isArray(tools)) {
      if (tools.includes("googleSearch")) {
        toolList.push({ googleSearch: {} });
      }
      if (tools.includes("codeExecution")) {
        toolList.push({ codeExecution: {} });
      }
    }
    if (toolList.length > 0) {
      config.tools = toolList;
    }

    // Configure JSON output if requested
    if (Array.isArray(tools) && tools.includes("jsonOutput")) {
      config.responseMimeType = "application/json";
    }

    // Thinking level for Gemini 3 series
    if (thinkingLevel && ["LOW", "HIGH", "MINIMAL"].includes(thinkingLevel)) {
      config.thinkingConfig = { thinkingLevel };
    }

    // Select valid model name
    let selectedModel = model;
    if (!selectedModel || selectedModel === "gemini-flash") {
      selectedModel = "gemini-3.6-flash";
    } else if (selectedModel === "gemini-pro") {
      selectedModel = "gemini-3.1-pro-preview";
    }

    // Handle image model vs text model
    if (selectedModel === "gemini-3.1-flash-image") {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: {
          parts: [{ text: interpolatedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K",
          },
        },
      });

      let outputText = "";
      let imageUrl = "";

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          } else if (part.text) {
            outputText += part.text + "\n";
          }
        }
      }

      const executionTimeMs = Date.now() - startTime;
      return res.json({
        success: true,
        nodeId,
        outputText: imageUrl ? `![Generated Image](${imageUrl})\n\n${outputText}`.trim() : outputText,
        imageUrl,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
        executionTimeMs,
        promptSent: interpolatedPrompt,
      });
    }

    // Standard Gemini text/multimodal generation
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: interpolatedPrompt || "Vui lòng xử lý yêu cầu và trả về kết quả.",
      config,
    });

    const outputText = response.text || "";
    let jsonOutput = null;

    if (config.responseMimeType === "application/json") {
      try {
        jsonOutput = JSON.parse(outputText);
      } catch (e) {
        console.warn("Failed to parse response as JSON:", e);
      }
    }

    // Extract grounding chunks if Google Search was used
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Nguồn tìm kiếm",
      uri: chunk.web?.uri || "",
    }));

    const executionTimeMs = Date.now() - startTime;
    const tokensUsed = response.usageMetadata?.totalTokenCount || Math.round((interpolatedPrompt.length + outputText.length) / 4);

    return res.json({
      success: true,
      nodeId,
      outputText,
      jsonOutput,
      groundingChunks,
      tokensUsed,
      executionTimeMs,
      promptSent: interpolatedPrompt,
    });
  } catch (error: any) {
    console.error("Error executing Gemini node:", error);
    const executionTimeMs = Date.now() - startTime;
    return res.status(500).json({
      success: false,
      error: error.message || "Lỗi khi thực thi AI node.",
      executionTimeMs,
    });
  }
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
