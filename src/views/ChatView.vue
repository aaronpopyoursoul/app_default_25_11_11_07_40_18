<template>
  <div class="chat-view">
    <!-- 動畫背景 -->
    <div class="animated-background">
      <div class="glow-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="orb orb-4"></div>
        <div class="orb orb-5"></div>
        <div class="orb orb-6"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="orb orb-4"></div>
        <div class="orb orb-5"></div>
        <div class="orb orb-6"></div>
      </div>
    </div>

    <!-- 主要內容 -->
    <div class="main-content">
      <div ref="messagesContainer" class="messages-container">
        <transition-group name="message-fade" tag="div">
          <ChatMessage
            v-for="(msg, index) in messages"
            :key="msg.id"
            :message="msg"
          />
        </transition-group>
      </div>
      <ChatInput @send="handleSend" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'
import type { ChatMessage as ChatMessageType, ChatFile } from '@/types/chat'

interface ExtendedChatMessage extends ChatMessageType { avatar?: string }

const messages = ref<ExtendedChatMessage[]>([])
const messagesContainer = ref<HTMLElement | null>(null)

const avatarAI = new URL('../assets/avatar-ai.svg', import.meta.url).href
const avatarUser = 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png'

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(messages, () => { scrollToBottom() })

interface SendPayload { text: string; files: ChatFile[] }
const handleSend = (content: SendPayload) => {
  if (!content.text && !content.files.length) return
  const userMsg: ExtendedChatMessage = {
    id: Date.now() + '-user',
    type: 'user',
    content: { text: content.text, files: content.files || [] },
    timestamp: new Date(),
    avatar: avatarUser
  }
  messages.value.push(userMsg)

  setTimeout(() => {
    const aiMsg: ExtendedChatMessage = {
      id: Date.now() + '-ai',
      type: 'ai',
      content: { text: '這是系統回應，您剛剛說：' + (content.text || '有上傳文件'), files: [] },
      timestamp: new Date(),
      avatar: avatarAI
    }
    messages.value.push(aiMsg)
  }, 1500)
}
</script>

<style scoped>
/* 同原檔樣式（略） */
.chat-view { position: relative; display: flex; flex-direction: column; height: 100%; width: 100%; padding: 20px; gap: 12px; overflow: hidden; }
.animated-background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; overflow: hidden; }
.glow-orbs { position: absolute; width: 100%; height: 100%; top: 0; left: 0; }
.orb { position: absolute; border-radius: 50%; filter: blur(50px); opacity: 0.5; }
.orb-1 { width: 400px; height: 400px; top: 10%; left: 15%; background: radial-gradient(circle, rgba(124, 58, 237, 0.5) 0%, rgba(124, 58, 237, 0.3) 30%, rgba(124, 58, 237, 0.15) 50%, rgba(124, 58, 237, 0.05) 70%, transparent 100%); animation: orbFloat1 9.6s ease-in-out infinite; }
.orb-2 { width: 350px; height: 350px; top: 60%; right: 20%; background: radial-gradient(circle, rgba(147, 51, 234, 0.45) 0%, rgba(147, 51, 234, 0.28) 30%, rgba(147, 51, 234, 0.14) 50%, rgba(147, 51, 234, 0.05) 70%, transparent 100%); animation: orbFloat2 12s ease-in-out infinite; animation-delay: -4s; filter: blur(55px); }
.orb-3 { width: 300px; height: 300px; bottom: 15%; left: 40%; background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.25) 30%, rgba(168, 85, 247, 0.12) 50%, rgba(168, 85, 247, 0.04) 70%, transparent 100%); animation: orbFloat3 8s ease-in-out infinite; animation-delay: -6.4s; filter: blur(60px); }
.orb-4 { width: 280px; height: 280px; top: 35%; left: 60%; background: radial-gradient(circle, rgba(139, 92, 246, 0.38) 0%, rgba(139, 92, 246, 0.22) 30%, rgba(139, 92, 246, 0.11) 50%, rgba(139, 92, 246, 0.04) 70%, transparent 100%); animation: orbFloat1 11.2s ease-in-out infinite; animation-delay: -2.4s; filter: blur(45px); }
.orb-5 { width: 320px; height: 320px; top: 75%; left: 10%; background: radial-gradient(circle, rgba(156, 39, 176, 0.35) 0%, rgba(156, 39, 176, 0.2) 30%, rgba(156, 39, 176, 0.1) 50%, rgba(156, 39, 176, 0.03) 70%, transparent 100%); animation: orbFloat2 10.4s ease-in-out infinite; animation-delay: -8s; filter: blur(52px); }
.orb-6 { width: 260px; height: 260px; top: 45%; right: 15%; background: radial-gradient(circle, rgba(124, 58, 237, 0.32) 0%, rgba(124, 58, 237, 0.18) 30%, rgba(124, 58, 237, 0.09) 50%, rgba(124, 58, 237, 0.03) 70%, transparent 100%); animation: orbFloat3 8.8s ease-in-out infinite; animation-delay: -4.8s; filter: blur(48px); }
@keyframes orbFloat1 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; } 25% { transform: translate(50px, -60px) scale(1.15); opacity: 0.7; } 50% { transform: translate(-40px, 40px) scale(0.85); opacity: 0.4; } 75% { transform: translate(30px, 50px) scale(1.05); opacity: 0.6; } }
@keyframes orbFloat2 { 0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.5; } 33% { transform: translate(-45px, 55px) scale(1.12); opacity: 0.65; } 66% { transform: translate(35px, -45px) scale(0.88); opacity: 0.45; } }
@keyframes orbFloat3 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; } 20% { transform: translate(40px, 30px) scale(1.08); opacity: 0.6; } 40% { transform: translate(-30px, -50px) scale(0.92); opacity: 0.7; } 60% { transform: translate(25px, -35px) scale(1.1); opacity: 0.55; } 80% { transform: translate(-35px, 45px) scale(0.95); opacity: 0.45; } }

.main-content { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; width: 100%; gap: 12px; }
.messages-container { flex-grow: 1; overflow-y: auto; overflow-x: hidden; padding: 10px; border: 1px solid var(--border-color); border-radius: 4px; display: flex; flex-direction: column; }
.message-fade-enter-active, .message-fade-leave-active { transition: opacity 0.5s; }
.message-fade-enter-from, .message-fade-leave-to { opacity: 0; }
</style>
