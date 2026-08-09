import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { getSocket } from '../../lib/socket';
import api from '../../lib/axios';
import {
  FiSend,
  FiMessageCircle,
  FiCheck,
  FiCheckCircle,
  FiPlus,
  FiSearch,
  FiUsers,
  FiX,
  FiArrowLeft,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { LuLoaderCircle } from "react-icons/lu";
import { IoCheckmarkDoneOutline } from "react-icons/io5";

const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Xabarlarni vaqt oralig‘i bo‘yicha guruhlash (5 daqiqa)
const shouldGroupMessages = (prev, curr) => {
  if (!prev) return false;
  const diff = new Date(curr.createdAt) - new Date(prev.createdAt);
  return diff < 5 * 60 * 1000;
};

// Spinner komponenti (loader)
const Spinner = ({ size = 24, color = '#2AABEE' }) => (
  <svg
    className="animate-spin"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default function Messages() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const messagesEndRef = useRef(null);
  const [selected, setSelected] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('user') || null;
    } catch {
      return null;
    }
  });
  const [text, setText] = useState('');
  const [typingUserId, setTypingUserId] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatUser, setNewChatUser] = useState('');
  const typingTimeoutRef = useRef(null);

  // ---------- Mobil detection ----------
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sidebar ko‘rinishi (mobil uchun)
  const [showSidebar, setShowSidebar] = useState(true);
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(!selected);
    } else {
      setShowSidebar(true);
    }
  }, [selected, isMobile]);

  // ---------- Query'lar ----------
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => (await api.get('/messages/conversations')).data.data,
    refetchInterval: 8000,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selected],
    queryFn: async () => (await api.get(`/messages/${selected}`)).data,
    enabled: !!selected,
  });

  const { data: unread } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => (await api.get('/messages/unread-count')).data.data,
    refetchInterval: 4000,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users-for-chat'],
    queryFn: async () => (await api.get('/users', { params: { limit: 100 } })).data.data,
    enabled: showNewChat,
  });

  const partner = useMemo(() => {
    if (!selected) return null;
    return conversations.find((c) => c.partnerId === selected)?.partner || null;
  }, [conversations, selected]);

  useEffect(() => {
    try {
      const url = new URL(window.location);
      if (selected) {
        url.searchParams.set('user', selected);
      } else {
        url.searchParams.delete('user');
      }
      window.history.replaceState({}, '', url);
    } catch { }
  }, [selected]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      const isRelevant =
        selected &&
        (String(msg.from._id || msg.from) === String(selected) ||
          String(msg.to._id || msg.to) === String(selected));
      if (isRelevant) {
        qc.invalidateQueries({ queryKey: ['messages', selected] });
      }
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    };

    const handleTyping = ({ from, isTyping }) => {
      if (String(from) !== String(selected)) return;
      if (isTyping) {
        setTypingUserId(from);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUserId(null), 3000);
      } else {
        setTypingUserId(null);
        clearTimeout(typingTimeoutRef.current);
      }
    };

    const handleRead = () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:sent', handleNewMessage);
    socket.on('message:typing', handleTyping);
    socket.on('notification:new', handleNewMessage);
    socket.on('message:read', handleRead);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:sent', handleNewMessage);
      socket.off('message:typing', handleTyping);
      socket.off('notification:new', handleNewMessage);
      socket.off('message:read', handleRead);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [selected, qc]);

  useEffect(() => {
    if (!selected || !messagesData?.data?.length) return;
    const unreadMessages = messagesData.data.filter(
      (m) => !m.read && String(m.from._id || m.from) !== String(me.id)
    );
    if (unreadMessages.length === 0) return;

    const markAsRead = async () => {
      try {
        await api.post(`/messages/read/${selected}`);
        const socket = getSocket();
        if (socket) {
          socket.emit('message:read', { to: selected });
        }
        qc.invalidateQueries({ queryKey: ['messages', selected] });
        qc.invalidateQueries({ queryKey: ['conversations'] });
        qc.invalidateQueries({ queryKey: ['unread-count'] });
      } catch (error) {
        console.error('Read status update failed', error);
      }
    };
    markAsRead();
  }, [selected, messagesData, me.id, qc]);

  // ---------- Avtomatik scroll ----------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const sendMessage = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || !selected) return;
    setText('');

    const socket = getSocket();
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      _id: tempId,
      from: { _id: me.id, fullName: me.fullName, avatar: me.avatar },
      to: selected,
      text: trimmed,
      createdAt: new Date().toISOString(),
      read: false,
      pending: true,
    };

    qc.setQueryData(['messages', selected], (old) => {
      if (!old) return { data: [tempMsg] };
      return { ...old, data: [...old.data, tempMsg] };
    });

    if (socket?.connected) {
      socket.emit('message:send', { to: selected, text: trimmed });
    } else {
      try {
        await api.post('/messages', { to: selected, text: trimmed });
        qc.invalidateQueries({ queryKey: ['conversations'] });
        qc.invalidateQueries({ queryKey: ['messages', selected] });
      } catch (error) {
        qc.setQueryData(['messages', selected], (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((m) => m._id !== tempId),
          };
        });
        console.error('Send failed', error);
      }
    }
  }, [text, selected, me, qc]);

  const handleTypingInput = useCallback(
    (value) => {
      setText(value);
      const socket = getSocket();
      if (!socket || !selected) return;
      const isTyping = value.trim().length > 0;
      socket.emit('message:typing', { to: selected, isTyping });
    },
    [selected]
  );

  const startNewChat = () => {
    if (!newChatUser) return;
    setSelected(newChatUser);
    setShowNewChat(false);
    setNewChatUser('');
    if (isMobile) setShowSidebar(false);
  };

  const handleBack = () => {
    setSelected(null);
    setShowSidebar(true);
  };

  return (
    <div className="max-w-[1280px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[12px] bg-[#2AABEE] text-white flex items-center justify-center">
            <FiMessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[20px] font-[750] tracking-[-0.03em] leading-none">
              {t('messages.title')} • Fylo
            </h1>
            <p className="text-[12px] text-muted-foreground mt-1">
              Telegram uslubida • Real-time socket • {unread?.total || 0}{' '}
              {t('messages.unread')}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          leftIcon={<FiPlus className="h-4 w-4" />}
          onClick={() => setShowNewChat(true)}
        >
          {t('messages.newChat')}
        </Button>
      </div>

      {/* Asosiy chat paneli */}
      <div className="h-[calc(100vh-180px)] min-h-[560px] rounded-[16px] border border-border bg-card overflow-hidden flex shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative">
        {/* ---------- Suhbatlar ro‘yxati (sidebar) ---------- */}
        <div
          className={`
            w-full sm:w-[360px] border-r border-border flex flex-col bg-[#f5f7fb] dark:bg-[#0f141f] shrink-0
            transition-all duration-300 ease-in-out
            ${isMobile ? (showSidebar ? 'flex' : 'hidden') : 'flex'}
          `}
        >
          <ConversationList
            conversations={conversations}
            selected={selected}
            onSelect={(id) => {
              setSelected(id);
              if (isMobile) setShowSidebar(false);
            }}
            onNewChat={() => setShowNewChat(true)}
            loading={conversationsLoading}
          />
        </div>

        <div
          className={`
            flex-1 flex flex-col min-w-0 bg-[#e6ebee] dark:bg-[#0e1621] relative
            transition-all duration-300 ease-in-out
            ${isMobile ? (showSidebar ? 'hidden' : 'flex') : 'flex'}
          `}
        >
          {!selected ? (
            <EmptyState onNewChat={() => setShowNewChat(true)} />
          ) : (
            <ChatArea
              partner={partner}
              messagesData={messagesData}
              messagesLoading={messagesLoading}
              me={me}
              text={text}
              onTextChange={handleTypingInput}
              onSend={sendMessage}
              typingUserId={typingUserId}
              messagesEndRef={messagesEndRef}
              onBack={handleBack}
              isMobile={isMobile}
            />
          )}
        </div>
      </div>

      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        users={allUsers}
        currentUserId={me.id}
        selectedUserId={newChatUser}
        onSelectUser={setNewChatUser}
        onStartChat={startNewChat}
        t={t}
      />
    </div>
  );
}


function ConversationList({ conversations, selected, onSelect, onNewChat, loading }) {
  const { t } = useTranslation();

  return (
    <>
      <div className="p-3 border-b border-border bg-card">
        <div className="relative">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder={t('common.search')}
            className="h-9 w-full rounded-[10px] border border-border bg-muted/50 pl-8 pr-3 text-[13px] outline-none focus:border-foreground/20 focus:ring-4 focus:ring-foreground/10"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto divide-y divide-border/30">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-11 w-11 rounded-full bg-muted/60" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-muted/60 rounded" />
                  <div className="h-2 w-32 bg-muted/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <EmptyConversations onNewChat={onNewChat} />
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.conversationKey}
              conv={conv}
              isSelected={selected === conv.partnerId}
              onSelect={() => onSelect(conv.partnerId)}
            />
          ))
        )}
      </div>
      <div className="p-2 border-t border-border bg-card text-[11px] text-muted-foreground flex items-center gap-1.5">
        <FiUsers className="h-3.5 w-3.5" /> {conversations.length} ta suhbat • Fylo @FyloRobot
      </div>
    </>
  );
}

/** Bitta suhbat elementi */
function ConversationItem({ conv, isSelected, onSelect }) {
  const { partner, lastMessage, unreadCount } = conv;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 flex gap-3 hover:bg-white dark:hover:bg-white/[0.04] transition-colors relative ${isSelected
        ? 'bg-white dark:bg-[#17212b] border-l-[3px] border-l-[#2AABEE] -ml-[3px] pl-[15px]'
        : ''
        }`}
    >
      <div className="relative shrink-0">
        <img
          src={
            partner?.avatar?.url ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${partner?.fullName}`
          }
          alt=""
          className="h-11 w-11 rounded-full object-cover"
        />
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-[#0f141f] ${partner?.isOnline ? 'bg-emerald-500' : 'bg-zinc-400'
            }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13.5px] font-[600] truncate tracking-[-0.01em]">
            {partner?.fullName}
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {lastMessage ? formatTime(lastMessage.createdAt) : ''}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-[12.5px] text-muted-foreground truncate max-w-[160px]">
            {lastMessage?.text || '...'}
          </span>
          {unreadCount > 0 && (
            <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-[#2AABEE] text-white text-[11px] font-[700] flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/** Bo‘sh suhbatlar holati */
function EmptyConversations({ onNewChat }) {
  const { t } = useTranslation();
  return (
    <div className="p-10 text-center">
      <div className="h-12 w-12 rounded-full bg-[#2AABEE]/10 mx-auto flex items-center justify-center mb-3">
        <FiMessageCircle className="h-6 w-6 text-[#2AABEE]" />
      </div>
      <p className="text-[13px] font-[600]">Hali yozishma yo‘q</p>
      <p className="text-[12px] text-muted-foreground mt-1">
        Yangi chat boshlang — jamoa bilan Fylo orqali yozishing
      </p>
      <Button
        size="sm"
        className="mt-4 bg-[#2AABEE] hover:bg-[#229ED9] text-white"
        onClick={onNewChat}
        leftIcon={<FiPlus className="h-4 w-4" />}
      >
        {t('messages.newChat')}
      </Button>
    </div>
  );
}


function EmptyState({ onNewChat }) {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-4 p-8 text-center">
      <div className="h-20 w-20 rounded-full bg-[#2AABEE] flex items-center justify-center shadow-[0_8px_24px_rgba(42,171,238,0.3)]">
        <FiMessageCircle className="h-10 w-10 text-white" />
      </div>
      <div>
        <p className="text-[16px] font-[700]">Fylo Messages</p>
      </div>
      <Button
        size="sm"
        className="bg-[#2AABEE] hover:bg-[#229ED9] text-white"
        onClick={onNewChat}
        leftIcon={<FiPlus className="h-4 w-4" />}
      >
        {t('messages.newChat')}
      </Button>
    </div>
  );
}

/** Chat maydoni (o‘ng panel) */
function ChatArea({
  partner,
  messagesData,
  messagesLoading,
  me,
  text,
  onTextChange,
  onSend,
  typingUserId,
  messagesEndRef,
  onBack,
  isMobile,
}) {
  const { t } = useTranslation();
  const messages = messagesData?.data || [];

  // Xabarlarni guruhlash
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentGroup = [];
    messages.forEach((msg, index) => {
      const prev = messages[index - 1];
      const isMe = String(msg.from._id || msg.from) === String(me.id);
      if (
        index === 0 ||
        !shouldGroupMessages(prev, msg) ||
        String(prev.from._id || prev.from) !== String(msg.from._id || msg.from)
      ) {
        if (currentGroup.length) groups.push(currentGroup);
        currentGroup = [{ ...msg, isMe }];
      } else {
        currentGroup.push({ ...msg, isMe });
      }
    });
    if (currentGroup.length) groups.push(currentGroup);
    return groups;
  }, [messages, me.id]);

  return (
    <>
      {/* Header */}
      <div className="h-[56px] px-4 border-b border-border bg-white dark:bg-[#17212b] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button onClick={onBack} className="h-8 w-8 flex items-center justify-center">
              <FiArrowLeft className="h-5 w-5" />
            </button>
          )}
          <img
            src={
              partner?.avatar?.url ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${partner?.fullName}`
            }
            alt=""
            className="h-8 w-8 rounded-full"
          />
          <div>
            <div className="text-[13px] font-[650]">
              {partner?.fullName || 'User'}
            </div>
            {partner?.isOnline ? (
              <div className="text-[11px] text-emerald-600 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                online
              </div>
            ) : (
              <div className="text-[11px] text-gray-600 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                offline
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onBack}
          className="h-8 w-8 rounded-[8px] hover:bg-accent flex items-center justify-center sm:hidden"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-1 bg-[url('https://web.telegram.org/k/assets/img/bg-pattern-dark.png')] dark:bg-[url('https://web.telegram.org/k/assets/img/bg-pattern-dark.png')] bg-fixed">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size={36} color="#2AABEE" />
          </div>
        ) : (
          groupedMessages.map((group, idx) => (
            <MessageGroup
              key={idx}
              group={group}
              isMe={group[0].isMe}
              me={me}
            />
          ))
        )}
        {typingUserId && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-[#182533] rounded-[12px] rounded-bl-[4px] px-4 py-2.5 text-[12px] text-muted-foreground flex items-center gap-1">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2AABEE] animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#2AABEE] animate-bounce [animation-delay:0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#2AABEE] animate-bounce [animation-delay:0.3s]" />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white dark:bg-[#17212b] border-t border-border flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={t('messages.typeMessage')}
          rows={1}
          className="flex-1 max-h-[100px] min-h-[42px] resize-none rounded-[5px] border border-border bg-[#f5f5f5] dark:bg-[#0e1621] px-2 py-2 text-[12px] outline-none focus:border-[#2AABEE]/40 focus:ring-4 focus:ring-[#2AABEE]/10"
        />
        <button
          onClick={onSend}
          disabled={!text.trim()}
          className="h-[42px] w-[42px] rounded-full bg-[#2AABEE] hover:bg-[#229ED9] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(42,171,238,0.35)] active:scale-95 transition-transform shrink-0"
        >
          <FiSend className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}

/** Xabarlar guruhi (bir nechta ketma-ket xabar) */
function MessageGroup({ group, isMe, me }) {
  const lastMsg = group[group.length - 1];

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="relative max-w-[72%] sm:max-w-[68%]">
        {!isMe && (
          <div className="text-[11px] font-[700] text-[#2AABEE] mb-0.5 ml-1">
            {group[0].from?.fullName}
          </div>
        )}
        <div className="space-y-0.5">
          {group.map((msg) => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              isMe={isMe}
              showTime={msg === lastMsg}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Bitta xabar qutisi */
function MessageBubble({ msg, isMe, showTime }) {
  return (
    <div
      className={`relative rounded-[12px] px-3.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.08)] ${isMe
        ? 'bg-[#effdde] dark:bg-[#2b5278] rounded-br-[4px]'
        : 'bg-white dark:bg-[#182533] rounded-bl-[4px]'
        }`}
    >
      <div className="text-[14px] leading-[1.35] whitespace-pre-wrap break-words">
        {msg.text}
      </div>
      <div className="flex items-center justify-end gap-1 mt-1">
        <span className="text-[11px] text-[#4fae4e] dark:text-white/50">
          {formatTime(msg.createdAt)}
        </span>
        {isMe && (
          <>
            {msg.pending ? (
              <LuLoaderCircle className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
            ) : msg.read ? (
              <IoCheckmarkDoneOutline className="h-3.5 w-3.5 text-[#4fc3f7]" />
            ) : (
              <FiCheck className="h-3.5 w-3.5 text-[#4fae4e]" />
            )}
          </>
        )}
      </div>
      {/* Tail */}
      <span
        className={`absolute bottom-0 w-3 h-3 ${isMe
          ? '-right-1 bg-[#effdde] dark:bg-[#2b5278] rounded-bl-[8px]'
          : '-left-1 bg-white dark:bg-[#182533] rounded-br-[8px]'
          }`}
        style={{
          clipPath: isMe
            ? 'polygon(0 0, 100% 100%, 0 100%)'
            : 'polygon(100% 0, 100% 100%, 0 100%)',
        }}
      />
    </div>
  );
}

/** Yangi chat modal */
function NewChatModal({
  isOpen,
  onClose,
  users,
  currentUserId,
  selectedUserId,
  onSelectUser,
  onStartChat,
  t,
}) {
  const filteredUsers = useMemo(
    () => users.filter((u) => u._id !== currentUserId),
    [users, currentUserId]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="relative w-full max-w-[400px] rounded-[16px] border border-border bg-card shadow-[0_16px_40px_rgba(0,0,0,0.15)] p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-[700]">
                {t('messages.newChat')} • Fylo
              </h3>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-[8px] bg-muted flex items-center justify-center"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className="text-[12px] font-[600] text-muted-foreground">
                {t('messages.searchUsers')}
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => onSelectUser(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[13px]"
              >
                <option value="">Tanlang...</option>
                {filteredUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.fullName} — {u.phone} {u.isOnline ? '• online' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button
                size="sm"
                disabled={!selectedUserId}
                onClick={onStartChat}
                className="bg-[#2AABEE] hover:bg-[#229ED9] text-white"
              >
                {t('messages.startChat')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}