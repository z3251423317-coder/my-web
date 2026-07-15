const fs = require('fs');

let adminCode = fs.readFileSync('components/Admin.tsx', 'utf-8');

if (!adminCode.includes('./TopologyCanvas')) {
  adminCode = "import TopologyCanvas from './TopologyCanvas';\n" + adminCode;
}

// In Admin.tsx, find:
//          {/* =================================================================================
//           * ■ TAB 1-9: INDIVIDUAL SCREEN CONTROLLERS (FORM BUILDERS)
//           * ================================================================================= */}
//          {currentScreen && (
//            <div className="max-w-4xl space-y-8">

const injectionPoint = "              {/* SECTION: SCREEN TEXTS & CONTENT */}";
const injectionContent = `              {/* SECTION: SCREEN 8 TOPOLOGY */}
              {currentScreen.id === 8 && (
                <div className="bg-zinc-900/20 border border-amber-500/30 rounded-xl p-5 space-y-4 shadow-xl">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-zinc-850 pb-3 mb-4">
                    <Database className="w-5 h-5 text-amber-400" />
                    第八屏：全屏一体化无限拓扑画布控制台
                  </h3>
                  <div className="w-full h-[600px] border border-zinc-700/50 rounded-xl overflow-hidden bg-zinc-950 shadow-inner relative z-10 pointer-events-auto">
                    <TopologyCanvas isAdmin={true} isMobile={false} />
                  </div>
                  <p className="text-xs text-zinc-400">
                    提示：可以直接按住任意主点/分点并在画布上拖动，点击任意节点或新增节点即可进入专项编辑面板。支持设置、（主点/分点）支持在任意节点（主点与主点、分点与分点，或跨级主分点）之间自由创建关系连线。提供自定义选项，支持连线一键断开管理。虚线样式 (Dashed) 和线条颜色。
                  </p>
                </div>
              )}

              {/* SECTION: SCREEN TEXTS & CONTENT */}`;

adminCode = adminCode.replace(injectionPoint, injectionContent);

fs.writeFileSync('components/Admin.tsx', adminCode);
console.log('Admin patched successfully.');
