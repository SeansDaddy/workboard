import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Multi-model fallback execution with error recovery
async function generateSummaryWithGemini(prompt: string): Promise<any | null> {
  const ai = getAiClient();
  if (!ai) return null;

  // Candidate models in priority order for high availability and rapid response
  const candidateModels = ['gemini-flash-latest', 'gemini-3.7-flash', 'gemini-3.1-flash-lite'];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text?.trim() || '';
      if (text) {
        try {
          return JSON.parse(text);
        } catch {
          return {
            overview: text.slice(0, 180),
            actions: [
              '优先排查待办工单中的高风险与临期事项',
              '按时执行今日例行巡检作业并录入记录',
              '监控异常电站指标并及时转工单消缺'
            ],
            tip: '保持全域设备安全稳定运行。'
          };
        }
      }
    } catch (err: any) {
      // Gracefully continue to next model on temporary unavailable (503/429) without crashing
      continue;
    }
  }

  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Work Summary API endpoint
  app.post('/api/ai/summary', async (req, res) => {
    try {
      const { user, pendingTickets, unhandledRisks, todayTasks, metrics } = req.body;

      const defaultLocalSummary = {
        overview: `您好，${user?.name || '张工'}。您当前名下有 ${pendingTickets?.length || 2} 单待处理工单（含 ${pendingTickets?.filter((t: any) => t.priority === '高').length || 1} 单高优先级工单），辖区内存在 ${unhandledRisks?.length || 3} 项待处置预警，今日到期作业 ${todayTasks?.length || 2} 项。`,
        actions: [
          '优先处理苏州工业园储能电站 #02 舱簇压差过大工单（SLA 剩余 4.0h）',
          '跟进临港重载站已超期的月度绝缘阻抗巡检作业',
          '核验常州金坛站放电策略执行后的一致性数据'
        ],
        tip: '当前华东全域 484 座电站上云率 99.2%，建议优先消除 1 级告警并完成闭环归档。'
      };

      const prompt = `你是一名储能电站主动运维智能助手。请为当前登录的运维负责人（${user?.name || '张工'}）生成一份极度简练、专业的今日工作总结与行动建议。
当前工作台实时数据：
- 待处理工单: ${JSON.stringify(pendingTickets || [])}
- 待处置风险/预警: ${JSON.stringify(unhandledRisks || [])}
- 今日/超期作业: ${JSON.stringify(todayTasks || [])}
- 辖区资产: 上云率 ${metrics?.cloudRate?.percentage || 99.2}%, 受控电站 ${metrics?.cloudRate?.totalStations || 484} 座

请输出严格的 JSON 格式，不要包含任何 markdown 代码块外部文字：
{
  "overview": "1-2句干练的今日工作态势概括",
  "actions": ["行动建议1（具体指出站名和紧急事项）", "行动建议2", "行动建议3"],
  "tip": "1句运维质量或设备健康管理要点"
}`;

      const aiResult = await generateSummaryWithGemini(prompt);

      if (aiResult && aiResult.overview) {
        return res.json({
          success: true,
          source: 'gemini',
          summary: aiResult
        });
      }

      // If Gemini models are unavailable or unconfigured, return clean fallback
      return res.json({
        success: true,
        source: 'local',
        summary: defaultLocalSummary
      });
    } catch (err: any) {
      console.warn('API /api/ai/summary caught exception:', err?.message || err);
      return res.json({
        success: true,
        source: 'fallback',
        summary: {
          overview: `您好，张工。当前系统已聚合华东区域 484 座储能电站状态，您名下有待办工单与巡检作业需重点跟进。`,
          actions: [
            '优先处置苏州工业园高风险压差异常工单（SLA 临期）',
            '督促执行临港重载站超期巡检任务',
            '对分析诊断出的潜在电芯不一致性风险进行复核'
          ],
          tip: '系统健康度 99.4%，各站点放电计划有序执行中。'
        }
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
