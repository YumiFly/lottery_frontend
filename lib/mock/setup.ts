import Mock from "mockjs"
// 配置Mock不拦截本地请求
if (typeof window !== 'undefined') {
  import('mockjs').then((Mock) => {
    Mock.default.setup({
      timeout: '200-600',
    });
  });
}

export const Random = Mock.Random
