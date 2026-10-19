/* Les écrans métier sont les vues GAB-ORIENT (js/gab-orient/views-*.js),
   montées par js/gab-orient/bridge.js — plus de reconstruction goHead/goTable. */
function goPage(role, page) {
  const fn = (typeof window !== 'undefined' && window.goRenderPage) || (typeof goRenderPage === 'function' ? goRenderPage : null);
  return fn ? fn(role, page) : null;
}
