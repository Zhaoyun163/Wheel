<template>
  <div class="wheel-container">
    <!-- 转盘容器 -->
    <div class="wheel-wrapper" @click="startSpin">
      <!-- 转盘Canvas -->
      <canvas 
        ref="wheelCanvas" 
        width="400" 
        height="400"
        class="wheel-canvas"
      ></canvas>
      
      <!-- 指针 -->
      <div class="pointer"></div>
      
      <!-- 旋转提示 -->
      <div class="spin提示" v-if="!isSpinning">点击开始旋转</div>
    </div>
    
    <!-- 结果显示 -->
    <div class="result" v-if="result">{{ result }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

// Canvas引用
const wheelCanvas = ref(null);
// 转盘状态
const isSpinning = ref(false);
const rotation = ref(0);
const result = ref('');

// 转盘配置
const wheelConfig = {
  sections: ['数学', '英语', '编程', '阅读', '体育', '音乐', '美术', '科学'],
  colors: [
    '#ff6347', '#40e0d0', '#87cefa', '#90ee90',
    '#f0e68c', '#dda0dd', '#ffc0cb', '#98fb98'
  ],
  radius: 0,
  centerX: 0,
  centerY: 0,
  anglePerSection: 0
};

// 初始化转盘
const initWheel = () => {
  const canvas = wheelCanvas.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  
  // 设置转盘基本参数
  wheelConfig.centerX = width / 2;
  wheelConfig.centerY = height / 2;
  wheelConfig.radius = Math.min(width, height) / 2 * 0.9;
  wheelConfig.anglePerSection = (2 * Math.PI) / wheelConfig.sections.length;
  
  // 初始绘制
  drawWheel(ctx);
};

// 绘制转盘
const drawWheel = (ctx) => {
  const { 
    sections, colors, radius, 
    centerX, centerY, anglePerSection 
  } = wheelConfig;
  
  // 清除画布
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // 保存当前状态
  ctx.save();
  
  // 将原点移动到中心并旋转
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation.value);
  
  // 绘制每个扇形区域
  sections.forEach((text, index) => {
    const startAngle = index * anglePerSection;
    const endAngle = startAngle + anglePerSection;
    
    // 绘制扇形
    ctx.beginPath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    
    // 绘制扇形边界
    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.stroke();
    
    // 绘制文字
    ctx.save();
    // 旋转到扇形中间
    ctx.rotate(startAngle + anglePerSection / 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 将文字绘制在扇形中间
    ctx.fillText(text, radius * 0.6, 0);
    ctx.restore();
  });
  
  // 绘制中心圆
  ctx.beginPath();
  ctx.fillStyle = '#fff';
  ctx.arc(0, 0, radius * 0.15, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 恢复状态
  ctx.restore();
  
  // 绘制转盘外框
  ctx.beginPath();
  ctx.strokeStyle = '#eee';
  ctx.lineWidth = 8;
  ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
  ctx.stroke();
};

// 开始旋转
const startSpin = () => {
  if (isSpinning.value) return;
  
  isSpinning.value = true;
  result.value = '';
  
  // 随机旋转角度 (3-6圈之间)
  const targetRotation = rotation.value + Math.random() * 3 * Math.PI * 2 + 6 * Math.PI;
  const duration = 5000; // 旋转持续时间(ms)
  const startTime = Date.now();
  
  // 动画函数
  const animate = () => {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    
    if (elapsed < duration) {
      // 使用缓动函数使动画更自然
      const progress = 1 - Math.pow(1 - elapsed / duration, 3);
      rotation.value = rotation.value + (targetRotation - rotation.value) * progress;
      
      // 重绘
      drawWheel(wheelCanvas.value.getContext('2d'));
      requestAnimationFrame(animate);
    } else {
      // 动画结束
      rotation.value = targetRotation;
      drawWheel(wheelCanvas.value.getContext('2d'));
      isSpinning.value = false;
      
      // 计算结果
      calculateResult();
    }
  };
  
  // 开始动画
  requestAnimationFrame(animate);
};

// 计算旋转结果
const calculateResult = () => {
  // 标准化旋转角度（0到2π之间）
  let normalizedRotation = rotation.value % (2 * Math.PI);
  if (normalizedRotation < 0) {
    normalizedRotation += 2 * Math.PI;
  }
  
  // 计算指针指向的区域
  // 指针在顶部，所以从π/2开始计算
  const pointerAngle = Math.PI / 2;
  let adjustedAngle = pointerAngle - normalizedRotation;
  adjustedAngle = ((adjustedAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
  
  // 确定所在区域
  const sectionIndex = Math.floor(adjustedAngle / wheelConfig.anglePerSection) % wheelConfig.sections.length;
  result.value = `恭喜！您抽到了：${wheelConfig.sections[sectionIndex]}`;
};

// 监听rotation变化，重绘转盘
watch(rotation, () => {
  if (wheelCanvas.value) {
    drawWheel(wheelCanvas.value.getContext('2d'));
  }
});

// 组件挂载时初始化
onMounted(() => {
  initWheel();
});
</script>

<style scoped>
.wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.wheel-wrapper {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.wheel-wrapper:hover {
  transform: scale(1.02);
}

.wheel-canvas {
  border-radius: 50%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.pointer {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 30px solid #ff4d4f;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.spin提示 {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  color: #666;
  font-family: Arial, sans-serif;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.result {
  margin-top: 50px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  font-family: Arial, sans-serif;
  padding: 10px 20px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
