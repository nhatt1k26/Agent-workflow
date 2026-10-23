import { Workflow } from '../types';
import { DEFAULT_AGENT_PERSONAS } from './personas';

const getPersona = (id: string) => DEFAULT_AGENT_PERSONAS.find(p => p.id === id) || DEFAULT_AGENT_PERSONAS[0];

export const WORKFLOW_TEMPLATES: Workflow[] = [
  {
    id: 'tpl_content_creation',
    name: 'Quy trình Sáng tạo Content & Fact-Check Multi-Agent',
    description: 'Quy trình 4 bước: Nghiên cứu thị trường trên Web -> Viết bản thảo bài viết -> Fact-check & Đánh giá chất lượng -> Hoàn thiện Báo cáo.',
    version: '1.2.0',
    category: 'Content Marketing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    globalVariables: {
      companyName: 'AgentFlow Inc',
      brandTone: 'Chuyên nghiệp, truyền cảm hứng và giàu thông tin',
    },
    nodes: [
      {
        id: 'trigger_node',
        type: 'trigger',
        position: { x: 50, y: 200 },
        data: {
          label: 'Đầu vào Yêu cầu Content',
          type: 'trigger',
          description: 'Cung cấp chủ đề và đối tượng mục tiêu',
          model: 'gemini-3.6-flash',
          systemInstruction: '',
          contextPrompt: '',
          temperature: 0.7,
          tools: [],
          inputSchema: [
            { key: 'topic', label: 'Chủ đề bài viết', type: 'string', defaultValue: 'Ứng dụng AI Agent tự động hóa quy trình làm việc doanh nghiệp năm 2026' },
            { key: 'target_audience', label: 'Đối tượng độc giả', type: 'string', defaultValue: 'Giám đốc Công nghệ (CTO), PM và Nhà quản lý doanh nghiệp' },
            { key: 'word_count', label: 'Độ dài dự kiến', type: 'string', defaultValue: '800 từ' }
          ],
          triggerInputs: {
            topic: 'Ứng dụng AI Agent tự động hóa quy trình làm việc doanh nghiệp năm 2026',
            target_audience: 'Giám đốc Công nghệ (CTO), PM và Nhà quản lý doanh nghiệp',
            word_count: '800 từ'
          }
        },
      },
      {
        id: 'node_research',
        type: 'agent',
        position: { x: 380, y: 100 },
        data: {
          label: 'Agent 1: Nghiên cứu Web',
          type: 'agent',
          agentId: 'agent_researcher',
          agentPersona: getPersona('agent_researcher'),
          model: 'gemini-3.6-flash',
          systemInstruction: getPersona('agent_researcher').systemInstruction,
          contextPrompt: `Hãy tìm kiếm và thu thập thông tin mới nhất về chủ đề: "{{input.topic}}".
Đối tượng độc giả: {{input.target_audience}}.

Hãy tổng hợp:
1. 3 Xu hướng công nghệ AI Agent nổi bật nhất hiện nay.
2. Dữ liệu hoặc ví dụ thực tế về việc áp dụng AI Agent trong doanh nghiệp.
3. Các thách thức chính và giải pháp.`,
          temperature: 0.3,
          tools: ['googleSearch'],
        },
      },
      {
        id: 'node_writer',
        type: 'agent',
        position: { x: 720, y: 100 },
        data: {
          label: 'Agent 2: Biên tập Content',
          type: 'agent',
          agentId: 'agent_writer',
          agentPersona: getPersona('agent_writer'),
          model: 'gemini-3.6-flash',
          systemInstruction: getPersona('agent_writer').systemInstruction,
          contextPrompt: `Dựa vào dữ liệu nghiên cứu dưới đây từ Agent 1:
---
{{nodes.node_research.output}}
---

Hãy viết bài viết hoàn chỉnh về chủ đề "{{input.topic}}" dành cho {{input.target_audience}}.
Độ dài khoảng {{input.word_count}}.
Giọng văn: {{global.brandTone}}.

Cấu trúc bài viết:
- Tiêu đề giật gân, cuốn hút.
- Lời mở đầu gây tò mò.
- Các phần nội dung chính với sub-heading rõ ràng.
- Lời kết và Call-to-Action cho thương hiệu {{global.companyName}}.`,
          temperature: 0.7,
          tools: [],
        },
      },
      {
        id: 'node_factcheck',
        type: 'agent',
        position: { x: 1060, y: 100 },
        data: {
          label: 'Agent 3: Fact-Check & Evaluator',
          type: 'agent',
          agentId: 'agent_evaluator',
          agentPersona: getPersona('agent_evaluator'),
          model: 'gemini-3.6-flash',
          systemInstruction: getPersona('agent_evaluator').systemInstruction,
          contextPrompt: `Hãy đánh giá bài viết dưới đây do Agent 2 soạn thảo:
---
{{nodes.node_writer.output}}
---

Hãy rà soát các tiêu chí:
1. Tính nhất quán logic và độ chính xác thông tin.
2. Độ hấp dẫn và phù hợp với độc giả {{input.target_audience}}.
3. Cho điểm chất lượng trên thang 10 kèm các nhận xét chi tiết và 3 gợi ý chỉnh sửa cụ thể.`,
          temperature: 0.2,
          tools: ['jsonOutput'],
        },
      },
      {
        id: 'node_output_summary',
        type: 'output',
        position: { x: 1400, y: 200 },
        data: {
          label: 'Đầu ra Hoàn chỉnh',
          type: 'output',
          description: 'Giao bản thảo bài viết kèm báo cáo đánh giá chất lượng',
          model: 'gemini-3.6-flash',
          systemInstruction: 'Bạn là Agent đóng gói sản phẩm cuối cùng. Hãy trình bày bản thảo bài viết cùng kết quả fact-check một cách chuyên nghiệp.',
          contextPrompt: `# 🚀 Bài Viết Hoàn Chỉnh: {{input.topic}}

## 📄 Nội Dung Bản Thảo (Đã Biên Tập)
{{nodes.node_writer.output}}

---

## 🔍 Báo Cáo Kiểm Định Chất Lượng Fact-Check
{{nodes.node_factcheck.output}}`,
          temperature: 0.3,
          tools: [],
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger_node', target: 'node_research', animated: true },
      { id: 'e2', source: 'node_research', target: 'node_writer', animated: true },
      { id: 'e3', source: 'node_writer', target: 'node_factcheck', animated: true },
      { id: 'e4', source: 'node_factcheck', target: 'node_output_summary', animated: true },
    ],
  },
  {
    id: 'tpl_code_review',
    name: 'Quy trình Refactor Code & Kiểm định Security AI',
    description: 'Quy trình kiểm thử mã nguồn 3 bước: Phân tích Clean Code -> Tối ưu thuật toán & Security Inspection -> Đóng gói bản Refactored.',
    version: '1.0.0',
    category: 'Software Engineering',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    globalVariables: {
      targetLanguage: 'TypeScript / React',
    },
    nodes: [
      {
        id: 'trigger_code',
        type: 'trigger',
        position: { x: 50, y: 200 },
        data: {
          label: 'Đầu vào Code Snippet',
          type: 'trigger',
          description: 'Mã nguồn cần phân tích và tối ưu',
          model: 'gemini-3.6-flash',
          systemInstruction: '',
          contextPrompt: '',
          temperature: 0.2,
          tools: [],
          inputSchema: [
            { key: 'code_snippet', label: 'Đoạn mã nguồn', type: 'code', defaultValue: `async function fetchUserData(userIds) {
  let results = [];
  for (let i = 0; i < userIds.length; i++) {
    let res = await fetch('/api/users/' + userIds[i]);
    let data = await res.json();
    results.push(data);
  }
  return results;
}` },
            { key: 'language', label: 'Ngôn ngữ lập trình', type: 'string', defaultValue: 'JavaScript / TypeScript' },
          ],
          triggerInputs: {
            code_snippet: `async function fetchUserData(userIds) {
  let results = [];
  for (let i = 0; i < userIds.length; i++) {
    let res = await fetch('/api/users/' + userIds[i]);
    let data = await res.json();
    results.push(data);
  }
  return results;
}`,
            language: 'JavaScript / TypeScript',
          }
        },
      },
      {
        id: 'node_coder_agent',
        type: 'agent',
        position: { x: 400, y: 150 },
        data: {
          label: 'Senior Engineer Agent',
          type: 'agent',
          agentId: 'agent_coder',
          agentPersona: getPersona('agent_coder'),
          model: 'gemini-3.1-pro-preview',
          systemInstruction: getPersona('agent_coder').systemInstruction,
          contextPrompt: `Phân tích đoạn mã {{input.language}} dưới đây:
\`\`\`{{input.language}}
{{input.code_snippet}}
\`\`\`

Nhiệm vụ:
1. Chỉ ra các vấn đề về hiệu năng (Performance Bottlenecks), ví dụ: N+1 async loop, memory leak.
2. Viết lại đoạn mã (Refactored Code) tối ưu hơn gấp nhiều lần (dùng Promise.all, error handling, strict types).
3. Bổ sung JSDoc / Type Annotations chuẩn.`,
          temperature: 0.2,
          tools: ['codeExecution'],
        },
      },
      {
        id: 'node_security_agent',
        type: 'agent',
        position: { x: 780, y: 150 },
        data: {
          label: 'Security & Quality Agent',
          type: 'agent',
          agentId: 'agent_evaluator',
          agentPersona: getPersona('agent_evaluator'),
          model: 'gemini-3.6-flash',
          systemInstruction: getPersona('agent_evaluator').systemInstruction,
          contextPrompt: `Hãy đánh giá đoạn mã refactored do Senior Engineer tạo ra bên dưới:
---
{{nodes.node_coder_agent.output}}
---

Kiểm tra:
- Có nguy cơ bảo mật nào không (input validation, rate limit, unhandled promise rejections)?
- Đánh giá khả năng mở rộng (Scalability) và Maintainability.`,
          temperature: 0.2,
          tools: [],
        },
      },
      {
        id: 'node_code_output',
        type: 'output',
        position: { x: 1150, y: 200 },
        data: {
          label: 'Kết quả Code Review',
          type: 'output',
          description: 'Mã nguồn tối ưu kèm báo cáo phân tích chi tiết',
          model: 'gemini-3.6-flash',
          systemInstruction: '',
          contextPrompt: `# 🛠️ Báo Cáo Refactor & Performance Review Code

## ⚡ Bản Mã Nguồn Tối Ưu
{{nodes.node_coder_agent.output}}

---

## 🛡️ Đánh Giá Security & Code Quality
{{nodes.node_security_agent.output}}`,
          temperature: 0.2,
          tools: [],
        },
      },
    ],
    edges: [
      { id: 'ce1', source: 'trigger_code', target: 'node_coder_agent', animated: true },
      { id: 'ce2', source: 'node_coder_agent', target: 'node_security_agent', animated: true },
      { id: 'ce3', source: 'node_security_agent', target: 'node_code_output', animated: true },
    ],
  },
  {
    id: 'tpl_customer_router',
    name: 'Quy trình Phân loại Yêu cầu & Phản hồi Khách hàng Tự động',
    description: 'Tự động nhận diện Intent email khách hàng -> Định tuyến bộ phận xử lý -> Soạn phản hồi cá nhân hóa -> Kiểm duyệt trước khi gửi.',
    version: '1.1.0',
    category: 'Customer Experience',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    globalVariables: {
      supportEmail: 'support@agentflow.io',
      refundPolicy: 'Hoàn tiền 100% trong vòng 7 ngày nếu lỗi hệ thống',
    },
    nodes: [
      {
        id: 'trigger_inquiry',
        type: 'trigger',
        position: { x: 50, y: 200 },
        data: {
          label: 'Email Yêu cầu Khách hàng',
          type: 'trigger',
          description: 'Nội dung phản hồi hoặc khiếu nại từ khách hàng',
          model: 'gemini-3.6-flash',
          systemInstruction: '',
          contextPrompt: '',
          temperature: 0.5,
          tools: [],
          inputSchema: [
            { key: 'customer_name', label: 'Tên khách hàng', type: 'string', defaultValue: 'Lê Hoàng Nam' },
            { key: 'customer_email', label: 'Email khách hàng', type: 'string', defaultValue: 'nam.le@example.com' },
            { key: 'inquiry_text', label: 'Nội dung khiếu nại/thắc mắc', type: 'string', defaultValue: 'Chào bộ phận hỗ trợ, tài khoản của tôi vừa bị trừ phí gia hạn gói Pro 49$ ngày hôm qua nhưng trong ứng dụng vẫn báo chưa kích hoạt được tính năng nâng cao. Yêu cầu kiểm tra gấp giúp tôi!' }
          ],
          triggerInputs: {
            customer_name: 'Lê Hoàng Nam',
            customer_email: 'nam.le@example.com',
            inquiry_text: 'Chào bộ phận hỗ trợ, tài khoản của tôi vừa bị trừ phí gia hạn gói Pro 49$ ngày hôm qua nhưng trong ứng dụng vẫn báo chưa kích hoạt được tính năng nâng cao. Yêu cầu kiểm tra gấp giúp tôi!'
          }
        },
      },
      {
        id: 'node_classifier',
        type: 'agent',
        position: { x: 400, y: 150 },
        data: {
          label: 'Intent Classifier Agent',
          type: 'agent',
          agentId: 'agent_classifier',
          agentPersona: getPersona('agent_classifier'),
          model: 'gemini-3.1-flash-lite',
          systemInstruction: getPersona('agent_classifier').systemInstruction,
          contextPrompt: `Phân tích yêu cầu khách hàng:
Tên: {{input.customer_name}}
Nội dung: "{{input.inquiry_text}}"

Hãy trích xuất dạng JSON:
1. category: (Billing / Technical / FeatureRequest / Complaint)
2. priority: (P1_CRITICAL / P2_HIGH / P3_MEDIUM / P4_LOW)
3. key_issues: danh sách vấn đề cốt lõi.
4. sentiment: (Angry / Anxious / Neutral / Happy)`,
          temperature: 0.0,
          tools: ['jsonOutput'],
        },
      },
      {
        id: 'node_support_writer',
        type: 'agent',
        position: { x: 780, y: 150 },
        data: {
          label: 'Support Response Writer',
          type: 'agent',
          agentId: 'agent_writer',
          agentPersona: getPersona('agent_writer'),
          model: 'gemini-3.6-flash',
          systemInstruction: 'Bạn là Chuyên viên Chăm sóc Khách hàng điềm tĩnh, lịch sự, luôn đồng cảm và giải quyết vấn đề triệt để.',
          contextPrompt: `Khách hàng: {{input.customer_name}} (Email: {{input.customer_email}})
Yêu cầu ban đầu: "{{input.inquiry_text}}"

Phân tích Intent từ Agent Classifier:
---
{{nodes.node_classifier.output}}
---

Chính sách hỗ trợ chung: {{global.refundPolicy}} (Email liên hệ: {{global.supportEmail}}).

Hãy viết Email trả lời khách hàng chuyên nghiệp:
- Bày tỏ sự xin lỗi về sự bất tiện.
- Xác nhận đã tiếp nhận sự cố.
- Đưa ra giải pháp xử lý ngay lập tức (xác minh giao dịch, kích hoạt thủ công hoặc refund).
- Hướng dẫn các bước tiếp theo rõ ràng.`,
          temperature: 0.6,
          tools: [],
        },
      },
      {
        id: 'node_final_email',
        type: 'output',
        position: { x: 1150, y: 200 },
        data: {
          label: 'Dự thảo Email Gửi Khách hàng',
          type: 'output',
          description: 'Bản thảo Email đã phân loại và duyệt sẵn',
          model: 'gemini-3.6-flash',
          systemInstruction: '',
          contextPrompt: `# 📧 Bản Thảo Email Phản Hồi Khách Hàng

**Người nhận:** {{input.customer_name}} <{{input.customer_email}}>  
**Phân loại Intent:**
{{nodes.node_classifier.output}}

---

### 📩 Nội dung Email:
{{nodes.node_support_writer.output}}`,
          temperature: 0.3,
          tools: [],
        },
      },
    ],
    edges: [
      { id: 'cur1', source: 'trigger_inquiry', target: 'node_classifier', animated: true },
      { id: 'cur2', source: 'node_classifier', target: 'node_support_writer', animated: true },
      { id: 'cur3', source: 'node_support_writer', target: 'node_final_email', animated: true },
    ],
  },
];
