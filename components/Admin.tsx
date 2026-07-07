import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Admin() {
  const [jsonStr, setJsonStr] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (data && !data.error) {
              setJsonStr(JSON.stringify(data, null, 2));
              setLoading(false);
              return;
            }
          }
        }
        throw new Error("Proxy API not available or invalid format");
      } catch (err) {
        console.warn("API proxy load failed, falling back to direct Firestore get...", err);
        try {
          const docSnap = await getDoc(doc(db, 'app_config', 'master'));
          if (docSnap.exists()) {
            setJsonStr(JSON.stringify(docSnap.data(), null, 2));
          } else {
            setJsonStr('{\n  "screens": [],\n  "pillNavItems": []\n}');
          }
        } catch (fErr: any) {
          console.error("Direct Firestore load failed:", fErr);
          setMessage('加载失败: ' + (fErr.message || String(fErr)));
        }
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const data = JSON.parse(jsonStr);
      data.updatedAt = new Date().toISOString();
      
      try {
        const res = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (res.ok) {
          setMessage('保存成功！前端刷新或直接切换页面即可看到最新内容。');
          setSaving(false);
          return;
        }
        throw new Error("Proxy API returned error status: " + res.status);
      } catch (proxyErr) {
        console.warn("API proxy save failed, falling back to direct Firestore write...", proxyErr);
        
        try {
          // Fallback to direct Firestore write
          await setDoc(doc(db, 'app_config', 'master'), data);
          setMessage('保存成功！数据已直接同步到云端 Firestore。');
        } catch (fWriteErr: any) {
          console.error("Direct Firestore write failed:", fWriteErr);
          throw new Error("Direct Firestore write failed: " + (fWriteErr.message || String(fWriteErr)));
        }
      }
    } catch (err: any) {
      setMessage('保存失败，请检查 JSON 格式是否正确: ' + err.message);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 text-white bg-zinc-950 h-screen">加载中...</div>;
  }

  return (
    <div className="p-8 bg-zinc-950 min-h-screen text-zinc-300 font-sans flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">网站内容管理后台 (Master Config)</h1>
        <div className="flex gap-4 items-center">
          {message && <span className={message.includes('失败') ? 'text-red-400' : 'text-emerald-400'}>{message}</span>}
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition-all disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存更改 (Save)'}
          </button>
          <a href="/" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-all">
            返回主页 (Back to Home)
          </a>
        </div>
      </div>
      <p className="mb-4 text-zinc-400">在这里直接修改 JSON 数据。修改后点击“保存更改”，主站所有端都会自动实时更新（利用 Firebase 实时同步技术）。</p>
      <textarea
        value={jsonStr}
        onChange={(e) => setJsonStr(e.target.value)}
        className="flex-1 w-full p-4 bg-zinc-900 border border-zinc-800 rounded font-mono text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
        spellCheck={false}
      />
    </div>
  );
}
