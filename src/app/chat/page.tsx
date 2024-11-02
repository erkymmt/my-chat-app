'use client'
import { useState, useEffect, FormEvent } from 'react'

// 型定義
interface Message {
  id?: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
}

interface Thread {
  id: string
  title: string
  lastMessage?: string
  createdAt: string
}

// チャット履歴の型を拡張
interface ChatMessage {
  id?: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export default function Chat() {
  const [message, setMessage] = useState<string>('')
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [currentThread, setCurrentThread] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // スレッド一覧の取得関数を外に出す
  const fetchThreads = async () => {
    try {
      const response = await fetch('/api/threads');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setThreads(data);  // ここでスレッド一覧を更新
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  // 初回読み込み時にスレッド一覧を取得
  useEffect(() => {
    fetchThreads();
  }, []);

  // メッセージ履歴の取得
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentThread) {
        setChatHistory([]);
        return;
      }

      try {
        const response = await fetch(`/api/messages?threadId=${currentThread}`);
        const data = await response.json();
        setChatHistory(data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.created_at
        })));
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [currentThread]);

  // 新規スレッド作成の修正
  const createNewThread = async () => {
    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '新規スレッド'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create thread');
      }

      // レッド一覧を再取得
      await fetchThreads();
      
      // 新しいスレッドを選択（IDの形式に応じて調整が必要かも）
      if (data.id) {
        setCurrentThread(data.id);
      }

    } catch (error) {
      console.error('Error creating thread:', error);
      alert('スレッドの作成中にエラーが発生しました。');
    }
  };

  // メッセージ送信関数を修正
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !currentThread) return;

    setIsLoading(true);

    try {
      // 直近のN件の履歴を取得（例：最新5件）
      const recentHistory = chatHistory
        .slice(-5)
        .map(msg => ({
          role: msg.sender,
          content: msg.content
        }));

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId: currentThread,
          content: message,
          history: recentHistory  // 履歴を追加
        }),
      });

      // レスポンスの詳細をログ出力
      console.log('API Response status:', response.status);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response data:', result);

      if (result.userMessage && result.aiMessage) {
        setChatHistory(prev => [...prev, 
          {
            ...result.userMessage,
            timestamp: new Date().toISOString()
          },
          {
            ...result.aiMessage,
            timestamp: new Date().toISOString()
          }
        ]);
        setMessage('');
      } else {
        console.error('Invalid API response format:', result);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー：スレッド一覧 */}
      <div className="w-80 bg-white p-4 overflow-y-auto shadow-lg border-r">
        <h2 className="text-xl font-bold mb-4 text-gray-800">チャット履歴</h2>
        <button 
          className="w-full bg-blue-600 text-white py-3 rounded-lg mb-6 
          hover:bg-blue-700 transition-colors shadow-sm font-medium"
          onClick={createNewThread}
        >
          新規チャットを開始
        </button>
        <div className="space-y-3">
          {threads.map((thread) => {
            console.log('Thread data:', thread);  // デバッグ用
            return (
              <div 
                key={thread.id}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentThread === thread.id 
                    ? 'bg-blue-50 border-blue-500 border-2' 
                    : 'hover:bg-gray-50 border border-gray-200'
                }`}
                onClick={() => setCurrentThread(thread.id)}
              >
                <div className="text-xs text-gray-500 mb-1">
                  {thread.created_at ? new Date(thread.created_at).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  }) : '日時不明'}
                </div>
                
                <div className="text-sm text-gray-700 line-clamp-2">
                  {thread.last_message || ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col bg-white">
        {/* チャット履歴 */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {chatHistory.map((chat) => (
            <div 
              key={chat.id}
              className={`mb-4 ${
                chat.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div className={`inline-block max-w-[70%] p-3 rounded-lg ${
                chat.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-800 shadow-md'
              }`}>
                <div className="text-sm">{chat.content}</div>
                <div className={`text-xs mt-1 ${
                  chat.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {new Date(chat.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-center text-gray-600">
              AIが応答を生成中...
            </div>
          )}
        </div>

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
          {!currentThread && (
            <div className="text-red-500 mb-2 text-sm">
              スレッドを選択するか、新規スレッドを作成してください
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                console.log('Input change triggered'); // デバッグ用
                setMessage(e.target.value);
              }}
              placeholder={currentThread ? "メッセージを入力..." : "スレッドを選択てください"}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                text-gray-900 placeholder-gray-500 bg-white border-gray-300"
              // disabled={!currentThread} // 一時的にコメントアウト
            />
            <button 
              type="submit"
              onClick={() => {
                console.log('Current Thread State:', currentThread); // デバッグ用
              }}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 
                transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!message.trim() || isLoading}
            >
              送信
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 