import { expect, test } from '@playwright/test';

for (const [path, heading] of [['/add','新增知识文档'],['/search','检索文档'],['/ask','智能问答'],['/docs','文档库'],['/wework','企微聊天沉淀'],['/metrics','知识底座健康度']] as const) {
  test(`${path} 可直接访问`, async ({page}) => {
    await page.goto(path);
    await expect(page.getByRole('heading',{name:heading})).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Application error');
  });
}

test('文档列表可以打开文档详情', async ({page}) => {
  await page.goto('/docs');
  const first = page.locator('.hit-main').first();
  await expect(first).toBeVisible();
  await first.click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('描述生成提交沿用旧接口和字段', async ({page}) => {
  let payload: Record<string, unknown> = {};
  await page.route('**/api/add', async route => {
    payload = route.request().postDataJSON();
    await route.fulfill({json:{rel:'guides/mock.md',pushed:false}});
  });
  await page.goto('/add');
  await page.getByPlaceholder('例如：某个业务指标的定义、统计口径和使用边界').fill('测试知识说明');
  await page.getByPlaceholder('维护人或责任角色').first().fill('测试负责人');
  await page.getByRole('button',{name:'生成并发布'}).click();
  await expect(page.locator('#toast')).toContainText('发布成功');
  expect(payload).toMatchObject({description:'测试知识说明',owner:'测试负责人'});
});

test('导航切换后保留未提交表单', async ({page}) => {
  await page.goto('/add');
  const input = page.getByPlaceholder('例如：某个业务指标的定义、统计口径和使用边界');
  await input.fill('尚未提交的知识');
  await page.getByRole('link',{name:'检索'}).click();
  await page.getByRole('link',{name:'新增文档'}).click();
  await expect(input).toHaveValue('尚未提交的知识');
});

test('问答降级事件展示检索引用', async ({page}) => {
  await page.route('**/api/chat', route => route.fulfill({
    status:200,
    contentType:'text/event-stream; charset=utf-8',
    body:'data: {"done":true,"fallback":true,"hits":[{"path":"guides/usage.md","title":"使用说明","type":"Guide"}]}\n\n',
  }));
  await page.goto('/ask');
  await page.getByPlaceholder('输入问题，Enter 发送，Shift+Enter 换行').fill('如何使用？');
  await page.getByRole('button',{name:'发送'}).click();
  await expect(page.getByText('AI 未配置，当前为检索模式，以下是相关文档：')).toBeVisible();
  await expect(page.getByRole('button',{name:'使用说明'})).toBeVisible();
});
