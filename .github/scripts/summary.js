/**
 * 把 jest 的 JSON 結果轉成 GitHub Actions Job Summary 表格
 * 用法：node .github/scripts/summary.js "標題" jest-result.json
 */
const fs = require('fs');

const title = process.argv[2] || '測試';
const file = process.argv[3] || 'jest-result.json';
const out = process.env.GITHUB_STEP_SUMMARY;

const stripAnsi = (s) => String(s).replace(/\[[0-9;]*m/g, '');

let md = '';

if (!fs.existsSync(file)) {
  md = [
    `## 🛑 ${title}：測試沒有執行`,
    '',
    '請檢查「啟動後端」步驟的記錄，確認服務與資料庫連線狀態。',
    '檢查項目：啟動指令、PORT 設定，以及資料表初始化。',
    '',
  ].join('\n');
} else {
  const r = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rows = [];
  const fails = [];
  for (const suite of r.testResults || []) {
    for (const t of suite.assertionResults || suite.testResults || []) {
      const ok = t.status === 'passed';
      const name = t.fullName || t.title;
      rows.push(`| ${ok ? '✅' : '❌'} | ${name} |`);
      if (t.status === 'failed') fails.push(t);
    }
  }
  const icon = r.numFailedTests === 0 && r.numTotalTests > 0 ? '✅' : '❌';
  md = [
    `## ${icon} ${title}：${r.numPassedTests}/${r.numTotalTests} 通過`,
    '',
    '| 結果 | 行為合約 |',
    '|---|---|',
    ...rows,
    '',
  ].join('\n');

  if (fails.length) {
    md += `\n### 失敗案例（${fails.length}）\n`;
    for (const t of fails) {
      const msg = stripAnsi((t.failureMessages || []).join('\n'))
        .split('\n')
        .slice(0, 25)
        .join('\n');
      md += `\n<details><summary>❌ ${t.fullName || t.title}</summary>\n\n\`\`\`\n${msg}\n\`\`\`\n\n</details>\n`;
    }
    md += '\n> 可使用失敗案例名稱搭配 `npm test -- -t "案例名稱"` 重現，並參考 OpenAPI 規格確認預期回應。\n';
  }
}

fs.appendFileSync(out, md + '\n');
console.log('summary written');
