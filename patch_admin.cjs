const fs = require('fs');
let admin = fs.readFileSync('components/Admin.tsx', 'utf8');

admin = admin.replace(
  /import \{ db \} from '\.\.\/firebase-config';\nimport \{ doc, getDoc, setDoc \} from 'firebase\/firestore';/,
  ''
);

const newEffect = `
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setJsonStr(JSON.stringify(data, null, 2));
        } else {
          setJsonStr('{\\n  "screens": [],\\n  "pillNavItems": []\\n}');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setMessage('加载失败');
        setLoading(false);
      });
  }, []);
`;

admin = admin.replace(
  /useEffect\(\(\) => \{\s*getDoc\(doc\(db, 'app_config', 'master'\)\)[\s\S]*?\}, \[\]\);/,
  newEffect
);

const newSave = `
  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const data = JSON.parse(jsonStr);
      data.updatedAt = new Date().toISOString();
      
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        setMessage('保存成功！前端刷新或直接切换页面即可看到最新内容。');
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Unknown error');
      }
    } catch (err: any) {
      setMessage('保存失败，请检查 JSON 格式是否正确: ' + err.message);
    }
    setSaving(false);
  };
`;

admin = admin.replace(
  /const handleSave = async \(\) => \{[\s\S]*?setSaving\(false\);\s*\};/,
  newSave
);

fs.writeFileSync('components/Admin.tsx', admin);
console.log("Patched Admin.tsx");
