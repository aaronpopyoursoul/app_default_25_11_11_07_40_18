<template>
  <div v-if="message.type === 'ai'" class="chat-message ai">
    <img :src="aiAvatar" alt="AI" class="avatar" />
    <div class="chat-bubble">
      <div class="content-text" v-if="message.content.text">{{ message.content.text }}</div>
      <div class="content-files" v-if="message.content.files && message.content.files.length">
        <template v-for="file in message.content.files" :key="file.id">
          <img v-if="isImage(file)" :src="file.url" alt="Image file" class="file-preview-image" />
          <div v-else class="file-preview-name" :title="file.name">📄 {{ file.name }}</div>
        </template>
      </div>
      <div class="timestamp">{{ formattedTimestamp }}</div>
    </div>
  </div>
  <div v-else class="chat-message user">
    <div class="chat-bubble">
      <div class="content-text" v-if="message.content.text">{{ message.content.text }}</div>
      <div class="content-files" v-if="message.content.files && message.content.files.length">
        <template v-for="file in message.content.files" :key="file.id">
          <img v-if="isImage(file)" :src="file.url" alt="Image file" class="file-preview-image" />
          <div v-else class="file-preview-name" :title="file.name">📄 {{ file.name }}</div>
        </template>
      </div>
      <div class="timestamp">{{ formattedTimestamp }}</div>
    </div>
    <img :src="userAvatar" alt="User" class="avatar" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import aiAvatar from '@/assets/avatar-ai.svg'
import userAvatar from '@/assets/avatar-chloe.jpg'
import type { ChatMessage as ChatMessageType, ChatFile } from '@/types/chat'

export default defineComponent({
  name: 'ChatMessage',
  props: {
    message: {
      type: Object as () => ChatMessageType,
      required: true
    }
  },
  setup(props){
    const formattedTimestamp = computed(() => {
      if (!props.message.timestamp) return ''
      const date = new Date(props.message.timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    const isImage = (file: ChatFile) => !!file.type && file.type.startsWith('image/')
    return { aiAvatar, userAvatar, formattedTimestamp, isImage }
  }
})
</script>

<style scoped>
/* 同原檔樣式（略） */
.chat-message{ display:flex; align-items:flex-end; gap:8px; margin:10px 0; }
.chat-message.ai{ justify-content:flex-start; }
.chat-message.user{ justify-content:flex-end; }
.avatar{ width:40px; height:40px; border-radius:50%; object-fit:cover; background:var(--card-bg); box-shadow:0 1px 3px rgba(0,0,0,.15); }
.chat-bubble{ position:relative; max-width:65%; min-width:120px; display:inline-block; padding:10px 14px 18px; background:var(--ai-msg-bg); border-radius:16px; box-shadow:0 1px 3px rgba(0,0,0,.12); word-break:break-word; line-height:1.4; animation:bubbleIn .35s ease; }
.chat-message.user .chat-bubble{ background:var(--user-msg-bg); }
.chat-message.ai .chat-bubble:before,.chat-message.user .chat-bubble:before{ content:''; position:absolute; top:14px; width:12px; height:12px; background:currentColor; transform:rotate(45deg); }
.chat-message.ai .chat-bubble{ color:var(--ai-msg-bg); }
.chat-message.user .chat-bubble{ color:var(--user-msg-bg); }
.chat-message.ai .chat-bubble:before{ left:-5px; }
.chat-message.user .chat-bubble:before{ right:-5px; }
.content-text,.file-preview-name{ color:var(--text-color); }
.content-files{ display:flex; flex-wrap:wrap; gap:8px; margin-top:6px; }
.file-preview-image{ width:120px; height:90px; object-fit:cover; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,.18); }
.file-preview-name{ background:rgba(0,0,0,.08); padding:4px 8px; border-radius:6px; font-size:12px; max-width:140px; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; }
.timestamp{ position:absolute; right:10px; bottom:4px; font-size:11px; opacity:.55; color:var(--text-color); user-select:none; }
:global(.dark) .chat-bubble{ box-shadow:0 1px 3px rgba(0,0,0,.6); }
:global(.dark) .file-preview-name{ background:rgba(255,255,255,.12); }
@keyframes bubbleIn{ 0%{ opacity:0; transform: translateY(4px);} 100%{ opacity:1; transform: translateY(0);} }
</style>
