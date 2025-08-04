
// 热重载客户端脚本
(function() {
  const socket = new WebSocket('ws://' + location.host + '/hot-reload');
  
  socket.addEventListener('message', function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'reload') {
      console.log('[热重载] 检测到文件变更，正在刷新页面...');
      window.location.reload();
    }
  });

  socket.addEventListener('close', function() {
    console.log('[热重载] 连接已断开，尝试重新连接...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  });

  socket.addEventListener('error', function() {
    console.log('[热重载] 连接错误，将在稍后重试...');
  });

  console.log('[热重载] 已连接到开发服务器');
})();
  