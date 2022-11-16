const Ir=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerpolicy&&(r.referrerPolicy=i.referrerpolicy),i.crossorigin==="use-credentials"?r.credentials="include":i.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}};Ir();const q={};function Tr(o){q.context=o}const Br=(o,e)=>o===e,Me=Symbol("solid-proxy"),co={equals:Br};let yi=Si;const ct={},qe=1,ao=2,xi={owned:null,cleanups:null,context:null,owner:null};var M=null;let jt=null,L=null,Tt=null,J=null,me=null,cn=0;function no(o,e){const t=L,n=M,i=o.length===0?xi:{owned:null,cleanups:null,context:null,owner:e||n};M=i,L=null;try{return dn(()=>o(()=>un(i)),!0)}finally{L=t,M=n}}function Ue(o,e){e=e?Object.assign({},co,e):co;const t={value:o,observers:null,observerSlots:null,pending:ct,comparator:e.equals||void 0},n=i=>(typeof i=="function"&&(i=i(t.pending!==ct?t.pending:t.value)),an(t,i));return[Ci.bind(t),n]}function Ce(o,e,t){const n=ln(o,e,!1,qe);qt(n)}function Ge(o,e,t){yi=Or;const n=ln(o,e,!1,qe),i=An&&Bi(M,An.id);i&&(n.suspense=i),n.user=!0,me?me.push(n):queueMicrotask(()=>qt(n))}function Ft(o,e,t){t=t?Object.assign({},co,t):co;const n=ln(o,e,!0,0);return n.pending=ct,n.observers=null,n.observerSlots=null,n.comparator=t.equals||void 0,qt(n),Ci.bind(n)}function wi(o){if(Tt)return o();let e;const t=Tt=[];try{e=o()}finally{Tt=null}return dn(()=>{for(let n=0;n<t.length;n+=1){const i=t[n];if(i.pending!==ct){const r=i.pending;i.pending=ct,an(i,r)}}},!1),e}function We(o){let e,t=L;return L=null,e=o(),L=t,e}function ke(o){Ge(()=>We(o))}function ki(o){return M===null||(M.cleanups===null?M.cleanups=[o]:M.cleanups.push(o)),o}function $i(){return L}function v(){return M}let An;function Ci(){const o=jt;if(this.sources&&(this.state||o)){const e=J;J=null,this.state===qe||o?qt(this):lo(this),J=e}if(L){const e=this.observers?this.observers.length:0;L.sources?(L.sources.push(this),L.sourceSlots.push(e)):(L.sources=[this],L.sourceSlots=[e]),this.observers?(this.observers.push(L),this.observerSlots.push(L.sources.length-1)):(this.observers=[L],this.observerSlots=[L.sources.length-1])}return this.value}function an(o,e,t){if(Tt)return o.pending===ct&&Tt.push(o),o.pending=e,e;if(o.comparator&&o.comparator(o.value,e))return e;let n=!1;return o.value=e,o.observers&&o.observers.length&&dn(()=>{for(let i=0;i<o.observers.length;i+=1){const r=o.observers[i];n&&jt.disposed.has(r),(n&&!r.tState||!n&&!r.state)&&(r.pure?J.push(r):me.push(r),r.observers&&Ii(r)),n||(r.state=qe)}if(J.length>1e6)throw J=[],new Error},!1),e}function qt(o){if(!o.fn)return;un(o);const e=M,t=L,n=cn;L=M=o,Ar(o,o.value,n),L=t,M=e}function Ar(o,e,t){let n;try{n=o.fn(e)}catch(i){Ti(i)}(!o.updatedAt||o.updatedAt<=t)&&(o.observers&&o.observers.length?an(o,n):o.value=n,o.updatedAt=t)}function ln(o,e,t,n=qe,i){const r={fn:o,state:n,updatedAt:null,owned:null,sources:null,sourceSlots:null,cleanups:null,value:e,owner:M,context:null,pure:t};return M===null||M!==xi&&(M.owned?M.owned.push(r):M.owned=[r]),r}function Bt(o){const e=jt;if(o.state===0||e)return;if(o.state===ao||e)return lo(o);if(o.suspense&&We(o.suspense.inFallback))return o.suspense.effects.push(o);const t=[o];for(;(o=o.owner)&&(!o.updatedAt||o.updatedAt<cn);)(o.state||e)&&t.push(o);for(let n=t.length-1;n>=0;n--)if(o=t[n],o.state===qe||e)qt(o);else if(o.state===ao||e){const i=J;J=null,lo(o,t[0]),J=i}}function dn(o,e){if(J)return o();let t=!1;e||(J=[]),me?t=!0:me=[],cn++;try{return o()}catch(n){Ti(n)}finally{Rr(t)}}function Rr(o){J&&(Si(J),J=null),!o&&(me.length?wi(()=>{yi(me),me=null}):me=null)}function Si(o){for(let e=0;e<o.length;e++)Bt(o[e])}function Or(o){let e,t=0;for(e=0;e<o.length;e++){const i=o[e];i.user?o[t++]=i:Bt(i)}q.context&&Tr();const n=o.length;for(e=0;e<t;e++)Bt(o[e]);for(e=n;e<o.length;e++)Bt(o[e])}function lo(o,e){const t=jt;o.state=0;for(let n=0;n<o.sources.length;n+=1){const i=o.sources[n];i.sources&&(i.state===qe||t?i!==e&&Bt(i):(i.state===ao||t)&&lo(i,e))}}function Ii(o){const e=jt;for(let t=0;t<o.observers.length;t+=1){const n=o.observers[t];(!n.state||e)&&(n.state=ao,n.pure?J.push(n):me.push(n),n.observers&&Ii(n))}}function un(o){let e;if(o.sources)for(;o.sources.length;){const t=o.sources.pop(),n=o.sourceSlots.pop(),i=t.observers;if(i&&i.length){const r=i.pop(),s=t.observerSlots.pop();n<i.length&&(r.sourceSlots[s]=n,i[n]=r,t.observerSlots[n]=s)}}if(o.owned){for(e=0;e<o.owned.length;e++)un(o.owned[e]);o.owned=null}if(o.cleanups){for(e=0;e<o.cleanups.length;e++)o.cleanups[e]();o.cleanups=null}o.state=0,o.context=null}function Ti(o){throw o}function Bi(o,e){return o?o.context&&o.context[e]!==void 0?o.context[e]:Bi(o.owner,e):void 0}const _r=Symbol("fallback");function Rn(o){for(let e=0;e<o.length;e++)o[e]()}function Fr(o,e,t={}){let n=[],i=[],r=[],s=0,c=e.length>1?[]:null;return ki(()=>Rn(r)),()=>{let a=o()||[],l,d;return We(()=>{let b=a.length,m,k,A,N,ge,U,ce,ue,Te;if(b===0)s!==0&&(Rn(r),r=[],n=[],i=[],s=0,c&&(c=[])),t.fallback&&(n=[_r],i[0]=no(Ro=>(r[0]=Ro,t.fallback())),s=1);else if(s===0){for(i=new Array(b),d=0;d<b;d++)n[d]=a[d],i[d]=no(u);s=b}else{for(A=new Array(b),N=new Array(b),c&&(ge=new Array(b)),U=0,ce=Math.min(s,b);U<ce&&n[U]===a[U];U++);for(ce=s-1,ue=b-1;ce>=U&&ue>=U&&n[ce]===a[ue];ce--,ue--)A[ue]=i[ce],N[ue]=r[ce],c&&(ge[ue]=c[ce]);for(m=new Map,k=new Array(ue+1),d=ue;d>=U;d--)Te=a[d],l=m.get(Te),k[d]=l===void 0?-1:l,m.set(Te,d);for(l=U;l<=ce;l++)Te=n[l],d=m.get(Te),d!==void 0&&d!==-1?(A[d]=i[l],N[d]=r[l],c&&(ge[d]=c[l]),d=k[d],m.set(Te,d)):r[l]();for(d=U;d<b;d++)d in A?(i[d]=A[d],r[d]=N[d],c&&(c[d]=ge[d],c[d](d))):i[d]=no(u);i=i.slice(0,s=b),n=a.slice(0)}return i});function u(b){if(r[d]=b,c){const[m,k]=Ue(d);return c[d]=k,e(a[d],m)}return e(a[d])}}}function w(o,e){return We(()=>o(e))}function Xt(){return!0}const Ai={get(o,e,t){return e===Me?t:o.get(e)},has(o,e){return o.has(e)},set:Xt,deleteProperty:Xt,getOwnPropertyDescriptor(o,e){return{configurable:!0,enumerable:!0,get(){return o.get(e)},set:Xt,deleteProperty:Xt}},ownKeys(o){return o.keys()}};function Oo(o){return typeof o=="function"?o():o}function Er(...o){return new Proxy({get(e){for(let t=o.length-1;t>=0;t--){const n=Oo(o[t])[e];if(n!==void 0)return n}},has(e){for(let t=o.length-1;t>=0;t--)if(e in Oo(o[t]))return!0;return!1},keys(){const e=[];for(let t=0;t<o.length;t++)e.push(...Object.keys(Oo(o[t])));return[...new Set(e)]}},Ai)}function Dr(o,...e){const t=new Set(e.flat()),n=Object.getOwnPropertyDescriptors(o),i=e.map(r=>{const s={};for(let c=0;c<r.length;c++){const a=r[c];Object.defineProperty(s,a,n[a]?n[a]:{get(){return o[a]},set(){return!0}})}return s});return i.push(new Proxy({get(r){return t.has(r)?void 0:o[r]},has(r){return t.has(r)?!1:r in o},keys(){return Object.keys(o).filter(r=>!t.has(r))}},Ai)),i}function Et(o){const e="fallback"in o&&{fallback:()=>o.fallback};return Ft(Fr(()=>o.each,o.children,e||void 0))}function re(o){let e=!1;const t=Ft(()=>o.when,void 0,{equals:(n,i)=>e?n===i:!n==!i});return Ft(()=>{const n=t();if(n){const i=o.children;return(e=typeof i=="function"&&i.length>0)?We(()=>i(n)):i}return o.fallback})}const Pr=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","disabled","formnovalidate","hidden","indeterminate","ismap","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","seamless","selected"],Lr=new Set(["className","value","readOnly","formNoValidate","isMap","noModule","playsInline",...Pr]),Hr=new Set(["innerHTML","textContent","innerText","children"]),Nr={className:"class",htmlFor:"for"},On={class:"className",formnovalidate:"formNoValidate",ismap:"isMap",nomodule:"noModule",playsinline:"playsInline",readonly:"readOnly"},Vr=new Set(["beforeinput","click","dblclick","contextmenu","focusin","focusout","input","keydown","keyup","mousedown","mousemove","mouseout","mouseover","mouseup","pointerdown","pointermove","pointerout","pointerover","pointerup","touchend","touchmove","touchstart"]),Mr=new Set(["altGlyph","altGlyphDef","altGlyphItem","animate","animateColor","animateMotion","animateTransform","circle","clipPath","color-profile","cursor","defs","desc","ellipse","feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence","filter","font","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignObject","g","glyph","glyphRef","hkern","image","line","linearGradient","marker","mask","metadata","missing-glyph","mpath","path","pattern","polygon","polyline","radialGradient","rect","set","stop","svg","switch","symbol","text","textPath","tref","tspan","use","view","vkern"]),zr={xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace"};function jr(o,e){return Ft(o,void 0,e?void 0:{equals:e})}function qr(o,e,t){let n=t.length,i=e.length,r=n,s=0,c=0,a=e[i-1].nextSibling,l=null;for(;s<i||c<r;){if(e[s]===t[c]){s++,c++;continue}for(;e[i-1]===t[r-1];)i--,r--;if(i===s){const d=r<n?c?t[c-1].nextSibling:t[r-c]:a;for(;c<r;)o.insertBefore(t[c++],d)}else if(r===c)for(;s<i;)(!l||!l.has(e[s]))&&e[s].remove(),s++;else if(e[s]===t[r-1]&&t[c]===e[i-1]){const d=e[--i].nextSibling;o.insertBefore(t[c++],e[s++].nextSibling),o.insertBefore(t[--r],d),e[i]=t[r]}else{if(!l){l=new Map;let u=c;for(;u<r;)l.set(t[u],u++)}const d=l.get(e[s]);if(d!=null)if(c<d&&d<r){let u=s,b=1,m;for(;++u<i&&u<r&&!((m=l.get(e[u]))==null||m!==d+b);)b++;if(b>d-c){const k=e[s];for(;c<d;)o.insertBefore(t[c++],k)}else o.replaceChild(t[c++],e[s++])}else s++;else e[s++].remove()}}}const _n="_$DX_DELEGATE";function Ur(o,e,t){let n;return no(i=>{n=i,e===document?o():y(e,o(),e.firstChild?null:void 0,t)}),()=>{n(),e.textContent=""}}function C(o,e,t){const n=document.createElement("template");n.innerHTML=o;let i=n.content.firstChild;return t&&(i=i.firstChild),i}function wo(o,e=window.document){const t=e[_n]||(e[_n]=new Set);for(let n=0,i=o.length;n<i;n++){const r=o[n];t.has(r)||(t.add(r),e.addEventListener(r,ts))}}function Gr(o,e,t){t==null?o.removeAttribute(e):o.setAttribute(e,t)}function Wr(o,e,t,n){n==null?o.removeAttributeNS(e,t):o.setAttributeNS(e,t,n)}function Qr(o,e,t,n){n?Array.isArray(t)?(o[`$$${e}`]=t[0],o[`$$${e}Data`]=t[1]):o[`$$${e}`]=t:Array.isArray(t)?o.addEventListener(e,i=>t[0](t[1],i)):o.addEventListener(e,t)}function Xr(o,e,t={}){const n=Object.keys(e||{}),i=Object.keys(t);let r,s;for(r=0,s=i.length;r<s;r++){const c=i[r];!c||c==="undefined"||e[c]||(Fn(o,c,!1),delete t[c])}for(r=0,s=n.length;r<s;r++){const c=n[r],a=!!e[c];!c||c==="undefined"||t[c]===a||!a||(Fn(o,c,!0),t[c]=a)}return t}function Yr(o,e,t={}){const n=o.style,i=typeof t=="string";if(e==null&&i||typeof e=="string")return n.cssText=e;i&&(n.cssText=void 0,t={}),e||(e={});let r,s;for(s in t)e[s]==null&&n.removeProperty(s),delete t[s];for(s in e)r=e[s],r!==t[s]&&(n.setProperty(s,r),t[s]=r);return t}function Jr(o,e,t,n){typeof e=="function"?Ce(i=>Dn(o,e(),i,t,n)):Dn(o,e,void 0,t,n)}function y(o,e,t,n){if(t!==void 0&&!n&&(n=[]),typeof e!="function")return at(o,e,n,t);Ce(i=>at(o,e(),i,t),n)}function Zr(o,e,t,n,i={},r=!1){e||(e={});for(const s in i)if(!(s in e)){if(s==="children")continue;En(o,s,null,i[s],t,r)}for(const s in e){if(s==="children"){n||at(o,e.children);continue}const c=e[s];i[s]=En(o,s,c,i[s],t,r)}}function Kr(o){let e,t;return!q.context||!(e=q.registry.get(t=os()))?o.cloneNode(!0):(q.completed&&q.completed.add(e),q.registry.delete(t),e)}function es(o){return o.toLowerCase().replace(/-([a-z])/g,(e,t)=>t.toUpperCase())}function Fn(o,e,t){const n=e.trim().split(/\s+/);for(let i=0,r=n.length;i<r;i++)o.classList.toggle(n[i],t)}function En(o,e,t,n,i,r){let s,c,a;if(e==="style")return Yr(o,t,n);if(e==="classList")return Xr(o,t,n);if(t===n)return n;if(e==="ref")r||t(o);else if(e.slice(0,3)==="on:")o.addEventListener(e.slice(3),t);else if(e.slice(0,10)==="oncapture:")o.addEventListener(e.slice(10),t,!0);else if(e.slice(0,2)==="on"){const l=e.slice(2).toLowerCase(),d=Vr.has(l);Qr(o,l,t,d),d&&wo([l])}else if((a=Hr.has(e))||!i&&(On[e]||(c=Lr.has(e)))||(s=o.nodeName.includes("-")))s&&!c&&!a?o[es(e)]=t:o[On[e]||e]=t;else{const l=i&&e.indexOf(":")>-1&&zr[e.split(":")[0]];l?Wr(o,l,e,t):Gr(o,Nr[e]||e,t)}return t}function ts(o){const e=`$$${o.type}`;let t=o.composedPath&&o.composedPath()[0]||o.target;for(o.target!==t&&Object.defineProperty(o,"target",{configurable:!0,value:t}),Object.defineProperty(o,"currentTarget",{configurable:!0,get(){return t||document}}),q.registry&&!q.done&&(q.done=!0,document.querySelectorAll("[id^=pl-]").forEach(n=>n.remove()));t!==null;){const n=t[e];if(n&&!t.disabled){const i=t[`${e}Data`];if(i!==void 0?n(i,o):n(o),o.cancelBubble)return}t=t.host&&t.host!==t&&t.host instanceof Node?t.host:t.parentNode}}function Dn(o,e,t={},n,i){return e||(e={}),!i&&"children"in e&&Ce(()=>t.children=at(o,e.children,t.children)),e.ref&&e.ref(o),Ce(()=>Zr(o,e,n,!0,t,!0)),t}function at(o,e,t,n,i){for(q.context&&!t&&(t=[...o.childNodes]);typeof t=="function";)t=t();if(e===t)return t;const r=typeof e,s=n!==void 0;if(o=s&&t[0]&&t[0].parentNode||o,r==="string"||r==="number"){if(q.context)return t;if(r==="number"&&(e=e.toString()),s){let c=t[0];c&&c.nodeType===3?c.data=e:c=document.createTextNode(e),t=Je(o,t,n,c)}else t!==""&&typeof t=="string"?t=o.firstChild.data=e:t=o.textContent=e}else if(e==null||r==="boolean"){if(q.context)return t;t=Je(o,t,n)}else{if(r==="function")return Ce(()=>{let c=e();for(;typeof c=="function";)c=c();t=at(o,c,t,n)}),()=>t;if(Array.isArray(e)){const c=[];if(Zo(c,e,i))return Ce(()=>t=at(o,c,t,n,!0)),()=>t;if(q.context){for(let a=0;a<c.length;a++)if(c[a].parentNode)return t=c}if(c.length===0){if(t=Je(o,t,n),s)return t}else Array.isArray(t)?t.length===0?Pn(o,c,n):qr(o,t,c):(t&&Je(o),Pn(o,c));t=c}else if(e instanceof Node){if(q.context&&e.parentNode)return t=s?[e]:e;if(Array.isArray(t)){if(s)return t=Je(o,t,n,e);Je(o,t,null,e)}else t==null||t===""||!o.firstChild?o.appendChild(e):o.replaceChild(e,o.firstChild);t=e}}return t}function Zo(o,e,t){let n=!1;for(let i=0,r=e.length;i<r;i++){let s=e[i],c;if(s instanceof Node)o.push(s);else if(!(s==null||s===!0||s===!1))if(Array.isArray(s))n=Zo(o,s)||n;else if((c=typeof s)=="string")o.push(document.createTextNode(s));else if(c==="function")if(t){for(;typeof s=="function";)s=s();n=Zo(o,Array.isArray(s)?s:[s])||n}else o.push(s),n=!0;else o.push(document.createTextNode(s.toString()))}return n}function Pn(o,e,t){for(let n=0,i=e.length;n<i;n++)o.insertBefore(e[n],t)}function Je(o,e,t,n){if(t===void 0)return o.textContent="";const i=n||document.createTextNode("");if(e.length){let r=!1;for(let s=e.length-1;s>=0;s--){const c=e[s];if(i!==c){const a=c.parentNode===o;!r&&!s?a?o.replaceChild(i,c):o.insertBefore(i,t):a&&c.remove()}else r=!0}}else o.insertBefore(i,t);return[i]}function os(){const o=q.context;return`${o.id}${o.count++}`}const ns="http://www.w3.org/2000/svg";function is(o,e=!1){return e?document.createElementNS(ns,o):document.createElement(o)}function rs(o){const[e,t]=Dr(o,["component"]);return Ft(()=>{const n=e.component;switch(typeof n){case"function":return We(()=>n(t));case"string":const i=Mr.has(n),r=q.context?Kr():is(n,i);return Jr(r,t,i),r}})}const Ae=function(){if(typeof globalThis<"u")return globalThis;if(typeof global<"u")return global;if(typeof self<"u")return self;if(typeof window<"u")return window;try{return new Function("return this")()}catch{return{}}}();Ae.trustedTypes===void 0&&(Ae.trustedTypes={createPolicy:(o,e)=>e});const Ri={configurable:!1,enumerable:!1,writable:!1};Ae.FAST===void 0&&Reflect.defineProperty(Ae,"FAST",Object.assign({value:Object.create(null)},Ri));const Dt=Ae.FAST;if(Dt.getById===void 0){const o=Object.create(null);Reflect.defineProperty(Dt,"getById",Object.assign({value(e,t){let n=o[e];return n===void 0&&(n=t?o[e]=t():null),n}},Ri))}const He=Object.freeze([]),_o=Ae.FAST.getById(1,()=>{const o=[],e=[];function t(){if(e.length)throw e.shift()}function n(s){try{s.call()}catch(c){e.push(c),setTimeout(t,0)}}function i(){let c=0;for(;c<o.length;)if(n(o[c]),c++,c>1024){for(let a=0,l=o.length-c;a<l;a++)o[a]=o[a+c];o.length-=c,c=0}o.length=0}function r(s){o.length<1&&Ae.requestAnimationFrame(i),o.push(s)}return Object.freeze({enqueue:r,process:i})}),Oi=Ae.trustedTypes.createPolicy("fast-html",{createHTML:o=>o});let Fo=Oi;const At=`fast-${Math.random().toString(36).substring(2,8)}`,_i=`${At}{`,hn=`}${At}`,I=Object.freeze({supportsAdoptedStyleSheets:Array.isArray(document.adoptedStyleSheets)&&"replace"in CSSStyleSheet.prototype,setHTMLPolicy(o){if(Fo!==Oi)throw new Error("The HTML policy can only be set once.");Fo=o},createHTML(o){return Fo.createHTML(o)},isMarker(o){return o&&o.nodeType===8&&o.data.startsWith(At)},extractDirectiveIndexFromMarker(o){return parseInt(o.data.replace(`${At}:`,""))},createInterpolationPlaceholder(o){return`${_i}${o}${hn}`},createCustomAttributePlaceholder(o,e){return`${o}="${this.createInterpolationPlaceholder(e)}"`},createBlockPlaceholder(o){return`<!--${At}:${o}-->`},queueUpdate:_o.enqueue,processUpdates:_o.process,nextUpdate(){return new Promise(_o.enqueue)},setAttribute(o,e,t){t==null?o.removeAttribute(e):o.setAttribute(e,t)},setBooleanAttribute(o,e,t){t?o.setAttribute(e,""):o.removeAttribute(e)},removeChildNodes(o){for(let e=o.firstChild;e!==null;e=o.firstChild)o.removeChild(e)},createTemplateWalker(o){return document.createTreeWalker(o,133,null,!1)}});function ss(o){const e=this.spillover;e.indexOf(o)===-1&&e.push(o)}function cs(o){const e=this.spillover,t=e.indexOf(o);t!==-1&&e.splice(t,1)}function as(o){const e=this.spillover,t=this.source;for(let n=0,i=e.length;n<i;++n)e[n].handleChange(t,o)}function ls(o){return this.spillover.indexOf(o)!==-1}class uo{constructor(e,t){this.sub1=void 0,this.sub2=void 0,this.spillover=void 0,this.source=e,this.sub1=t}has(e){return this.sub1===e||this.sub2===e}subscribe(e){if(!this.has(e)){if(this.sub1===void 0){this.sub1=e;return}if(this.sub2===void 0){this.sub2=e;return}this.spillover=[this.sub1,this.sub2,e],this.subscribe=ss,this.unsubscribe=cs,this.notify=as,this.has=ls,this.sub1=void 0,this.sub2=void 0}}unsubscribe(e){this.sub1===e?this.sub1=void 0:this.sub2===e&&(this.sub2=void 0)}notify(e){const t=this.sub1,n=this.sub2,i=this.source;t!==void 0&&t.handleChange(i,e),n!==void 0&&n.handleChange(i,e)}}class Fi{constructor(e){this.subscribers={},this.sourceSubscribers=null,this.source=e}notify(e){var t;const n=this.subscribers[e];n!==void 0&&n.notify(e),(t=this.sourceSubscribers)===null||t===void 0||t.notify(e)}subscribe(e,t){var n;if(t){let i=this.subscribers[t];i===void 0&&(this.subscribers[t]=i=new uo(this.source)),i.subscribe(e)}else this.sourceSubscribers=(n=this.sourceSubscribers)!==null&&n!==void 0?n:new uo(this.source),this.sourceSubscribers.subscribe(e)}unsubscribe(e,t){var n;if(t){const i=this.subscribers[t];i!==void 0&&i.unsubscribe(e)}else(n=this.sourceSubscribers)===null||n===void 0||n.unsubscribe(e)}}const S=Dt.getById(2,()=>{const o=/(:|&&|\|\||if)/,e=new WeakMap,t=new WeakMap,n=I.queueUpdate;let i,r=d=>{throw new Error("Must call enableArrayObservation before observing arrays.")};function s(d){let u=d.$fastController||e.get(d);return u===void 0&&(Array.isArray(d)?u=r(d):e.set(d,u=new Fi(d))),u}function c(d){let u=t.get(d);if(u===void 0){let b=Reflect.getPrototypeOf(d);for(;u===void 0&&b!==null;)u=t.get(b),b=Reflect.getPrototypeOf(b);u===void 0?u=[]:u=u.slice(0),t.set(d,u)}return u}class a{constructor(u){this.name=u,this.field=`_${u}`,this.callback=`${u}Changed`}getValue(u){return i!==void 0&&i.watch(u,this.name),u[this.field]}setValue(u,b){const m=this.field,k=u[m];if(k!==b){u[m]=b;const A=u[this.callback];typeof A=="function"&&A.call(u,k,b),s(u).notify(this.name)}}}class l extends uo{constructor(u,b,m=!1){super(u,b),this.binding=u,this.isVolatileBinding=m,this.needsRefresh=!0,this.needsQueue=!0,this.first=this,this.last=null,this.propertySource=void 0,this.propertyName=void 0,this.notifier=void 0,this.next=void 0}observe(u,b){this.needsRefresh&&this.last!==null&&this.disconnect();const m=i;i=this.needsRefresh?this:void 0,this.needsRefresh=this.isVolatileBinding;const k=this.binding(u,b);return i=m,k}disconnect(){if(this.last!==null){let u=this.first;for(;u!==void 0;)u.notifier.unsubscribe(this,u.propertyName),u=u.next;this.last=null,this.needsRefresh=this.needsQueue=!0}}watch(u,b){const m=this.last,k=s(u),A=m===null?this.first:{};if(A.propertySource=u,A.propertyName=b,A.notifier=k,k.subscribe(this,b),m!==null){if(!this.needsRefresh){let N;i=void 0,N=m.propertySource[m.propertyName],i=this,u===N&&(this.needsRefresh=!0)}m.next=A}this.last=A}handleChange(){this.needsQueue&&(this.needsQueue=!1,n(this))}call(){this.last!==null&&(this.needsQueue=!0,this.notify(this))}records(){let u=this.first;return{next:()=>{const b=u;return b===void 0?{value:void 0,done:!0}:(u=u.next,{value:b,done:!1})},[Symbol.iterator]:function(){return this}}}}return Object.freeze({setArrayObserverFactory(d){r=d},getNotifier:s,track(d,u){i!==void 0&&i.watch(d,u)},trackVolatile(){i!==void 0&&(i.needsRefresh=!0)},notify(d,u){s(d).notify(u)},defineProperty(d,u){typeof u=="string"&&(u=new a(u)),c(d).push(u),Reflect.defineProperty(d,u.name,{enumerable:!0,get:function(){return u.getValue(this)},set:function(b){u.setValue(this,b)}})},getAccessors:c,binding(d,u,b=this.isVolatileBinding(d)){return new l(d,u,b)},isVolatileBinding(d){return o.test(d.toString())}})});function g(o,e){S.defineProperty(o,e)}function ds(o,e,t){return Object.assign({},t,{get:function(){return S.trackVolatile(),t.get.apply(this)}})}const Ln=Dt.getById(3,()=>{let o=null;return{get(){return o},set(e){o=e}}});class Pt{constructor(){this.index=0,this.length=0,this.parent=null,this.parentContext=null}get event(){return Ln.get()}get isEven(){return this.index%2===0}get isOdd(){return this.index%2!==0}get isFirst(){return this.index===0}get isInMiddle(){return!this.isFirst&&!this.isLast}get isLast(){return this.index===this.length-1}static setEvent(e){Ln.set(e)}}S.defineProperty(Pt.prototype,"index");S.defineProperty(Pt.prototype,"length");const Rt=Object.seal(new Pt);class ko{constructor(){this.targetIndex=0}}class Ei extends ko{constructor(){super(...arguments),this.createPlaceholder=I.createInterpolationPlaceholder}}class fn extends ko{constructor(e,t,n){super(),this.name=e,this.behavior=t,this.options=n}createPlaceholder(e){return I.createCustomAttributePlaceholder(this.name,e)}createBehavior(e){return new this.behavior(e,this.options)}}function us(o,e){this.source=o,this.context=e,this.bindingObserver===null&&(this.bindingObserver=S.binding(this.binding,this,this.isBindingVolatile)),this.updateTarget(this.bindingObserver.observe(o,e))}function hs(o,e){this.source=o,this.context=e,this.target.addEventListener(this.targetName,this)}function fs(){this.bindingObserver.disconnect(),this.source=null,this.context=null}function bs(){this.bindingObserver.disconnect(),this.source=null,this.context=null;const o=this.target.$fastView;o!==void 0&&o.isComposed&&(o.unbind(),o.needsBindOnly=!0)}function ps(){this.target.removeEventListener(this.targetName,this),this.source=null,this.context=null}function gs(o){I.setAttribute(this.target,this.targetName,o)}function vs(o){I.setBooleanAttribute(this.target,this.targetName,o)}function ms(o){if(o==null&&(o=""),o.create){this.target.textContent="";let e=this.target.$fastView;e===void 0?e=o.create():this.target.$fastTemplate!==o&&(e.isComposed&&(e.remove(),e.unbind()),e=o.create()),e.isComposed?e.needsBindOnly&&(e.needsBindOnly=!1,e.bind(this.source,this.context)):(e.isComposed=!0,e.bind(this.source,this.context),e.insertBefore(this.target),this.target.$fastView=e,this.target.$fastTemplate=o)}else{const e=this.target.$fastView;e!==void 0&&e.isComposed&&(e.isComposed=!1,e.remove(),e.needsBindOnly?e.needsBindOnly=!1:e.unbind()),this.target.textContent=o}}function ys(o){this.target[this.targetName]=o}function xs(o){const e=this.classVersions||Object.create(null),t=this.target;let n=this.version||0;if(o!=null&&o.length){const i=o.split(/\s+/);for(let r=0,s=i.length;r<s;++r){const c=i[r];c!==""&&(e[c]=n,t.classList.add(c))}}if(this.classVersions=e,this.version=n+1,n!==0){n-=1;for(const i in e)e[i]===n&&t.classList.remove(i)}}class bn extends Ei{constructor(e){super(),this.binding=e,this.bind=us,this.unbind=fs,this.updateTarget=gs,this.isBindingVolatile=S.isVolatileBinding(this.binding)}get targetName(){return this.originalTargetName}set targetName(e){if(this.originalTargetName=e,e!==void 0)switch(e[0]){case":":if(this.cleanedTargetName=e.substr(1),this.updateTarget=ys,this.cleanedTargetName==="innerHTML"){const t=this.binding;this.binding=(n,i)=>I.createHTML(t(n,i))}break;case"?":this.cleanedTargetName=e.substr(1),this.updateTarget=vs;break;case"@":this.cleanedTargetName=e.substr(1),this.bind=hs,this.unbind=ps;break;default:this.cleanedTargetName=e,e==="class"&&(this.updateTarget=xs);break}}targetAtContent(){this.updateTarget=ms,this.unbind=bs}createBehavior(e){return new ws(e,this.binding,this.isBindingVolatile,this.bind,this.unbind,this.updateTarget,this.cleanedTargetName)}}class ws{constructor(e,t,n,i,r,s,c){this.source=null,this.context=null,this.bindingObserver=null,this.target=e,this.binding=t,this.isBindingVolatile=n,this.bind=i,this.unbind=r,this.updateTarget=s,this.targetName=c}handleChange(){this.updateTarget(this.bindingObserver.observe(this.source,this.context))}handleEvent(e){Pt.setEvent(e);const t=this.binding(this.source,this.context);Pt.setEvent(null),t!==!0&&e.preventDefault()}}let Eo=null;class pn{addFactory(e){e.targetIndex=this.targetIndex,this.behaviorFactories.push(e)}captureContentBinding(e){e.targetAtContent(),this.addFactory(e)}reset(){this.behaviorFactories=[],this.targetIndex=-1}release(){Eo=this}static borrow(e){const t=Eo||new pn;return t.directives=e,t.reset(),Eo=null,t}}function ks(o){if(o.length===1)return o[0];let e;const t=o.length,n=o.map(s=>typeof s=="string"?()=>s:(e=s.targetName||e,s.binding)),i=(s,c)=>{let a="";for(let l=0;l<t;++l)a+=n[l](s,c);return a},r=new bn(i);return r.targetName=e,r}const $s=hn.length;function Di(o,e){const t=e.split(_i);if(t.length===1)return null;const n=[];for(let i=0,r=t.length;i<r;++i){const s=t[i],c=s.indexOf(hn);let a;if(c===-1)a=s;else{const l=parseInt(s.substring(0,c));n.push(o.directives[l]),a=s.substring(c+$s)}a!==""&&n.push(a)}return n}function Hn(o,e,t=!1){const n=e.attributes;for(let i=0,r=n.length;i<r;++i){const s=n[i],c=s.value,a=Di(o,c);let l=null;a===null?t&&(l=new bn(()=>c),l.targetName=s.name):l=ks(a),l!==null&&(e.removeAttributeNode(s),i--,r--,o.addFactory(l))}}function Cs(o,e,t){const n=Di(o,e.textContent);if(n!==null){let i=e;for(let r=0,s=n.length;r<s;++r){const c=n[r],a=r===0?e:i.parentNode.insertBefore(document.createTextNode(""),i.nextSibling);typeof c=="string"?a.textContent=c:(a.textContent=" ",o.captureContentBinding(c)),i=a,o.targetIndex++,a!==e&&t.nextNode()}o.targetIndex--}}function Ss(o,e){const t=o.content;document.adoptNode(t);const n=pn.borrow(e);Hn(n,o,!0);const i=n.behaviorFactories;n.reset();const r=I.createTemplateWalker(t);let s;for(;s=r.nextNode();)switch(n.targetIndex++,s.nodeType){case 1:Hn(n,s);break;case 3:Cs(n,s,r);break;case 8:I.isMarker(s)&&n.addFactory(e[I.extractDirectiveIndexFromMarker(s)])}let c=0;(I.isMarker(t.firstChild)||t.childNodes.length===1&&e.length)&&(t.insertBefore(document.createComment(""),t.firstChild),c=-1);const a=n.behaviorFactories;return n.release(),{fragment:t,viewBehaviorFactories:a,hostBehaviorFactories:i,targetOffset:c}}const Do=document.createRange();class Pi{constructor(e,t){this.fragment=e,this.behaviors=t,this.source=null,this.context=null,this.firstChild=e.firstChild,this.lastChild=e.lastChild}appendTo(e){e.appendChild(this.fragment)}insertBefore(e){if(this.fragment.hasChildNodes())e.parentNode.insertBefore(this.fragment,e);else{const t=e.parentNode,n=this.lastChild;let i=this.firstChild,r;for(;i!==n;)r=i.nextSibling,t.insertBefore(i,e),i=r;t.insertBefore(n,e)}}remove(){const e=this.fragment,t=this.lastChild;let n=this.firstChild,i;for(;n!==t;)i=n.nextSibling,e.appendChild(n),n=i;e.appendChild(t)}dispose(){const e=this.firstChild.parentNode,t=this.lastChild;let n=this.firstChild,i;for(;n!==t;)i=n.nextSibling,e.removeChild(n),n=i;e.removeChild(t);const r=this.behaviors,s=this.source;for(let c=0,a=r.length;c<a;++c)r[c].unbind(s)}bind(e,t){const n=this.behaviors;if(this.source!==e)if(this.source!==null){const i=this.source;this.source=e,this.context=t;for(let r=0,s=n.length;r<s;++r){const c=n[r];c.unbind(i),c.bind(e,t)}}else{this.source=e,this.context=t;for(let i=0,r=n.length;i<r;++i)n[i].bind(e,t)}}unbind(){if(this.source===null)return;const e=this.behaviors,t=this.source;for(let n=0,i=e.length;n<i;++n)e[n].unbind(t);this.source=null}static disposeContiguousBatch(e){if(e.length!==0){Do.setStartBefore(e[0].firstChild),Do.setEndAfter(e[e.length-1].lastChild),Do.deleteContents();for(let t=0,n=e.length;t<n;++t){const i=e[t],r=i.behaviors,s=i.source;for(let c=0,a=r.length;c<a;++c)r[c].unbind(s)}}}}class Nn{constructor(e,t){this.behaviorCount=0,this.hasHostBehaviors=!1,this.fragment=null,this.targetOffset=0,this.viewBehaviorFactories=null,this.hostBehaviorFactories=null,this.html=e,this.directives=t}create(e){if(this.fragment===null){let l;const d=this.html;if(typeof d=="string"){l=document.createElement("template"),l.innerHTML=I.createHTML(d);const b=l.content.firstElementChild;b!==null&&b.tagName==="TEMPLATE"&&(l=b)}else l=d;const u=Ss(l,this.directives);this.fragment=u.fragment,this.viewBehaviorFactories=u.viewBehaviorFactories,this.hostBehaviorFactories=u.hostBehaviorFactories,this.targetOffset=u.targetOffset,this.behaviorCount=this.viewBehaviorFactories.length+this.hostBehaviorFactories.length,this.hasHostBehaviors=this.hostBehaviorFactories.length>0}const t=this.fragment.cloneNode(!0),n=this.viewBehaviorFactories,i=new Array(this.behaviorCount),r=I.createTemplateWalker(t);let s=0,c=this.targetOffset,a=r.nextNode();for(let l=n.length;s<l;++s){const d=n[s],u=d.targetIndex;for(;a!==null;)if(c===u){i[s]=d.createBehavior(a);break}else a=r.nextNode(),c++}if(this.hasHostBehaviors){const l=this.hostBehaviorFactories;for(let d=0,u=l.length;d<u;++d,++s)i[s]=l[d].createBehavior(e)}return new Pi(t,i)}render(e,t,n){typeof t=="string"&&(t=document.getElementById(t)),n===void 0&&(n=t);const i=this.create(n);return i.bind(e,Rt),i.appendTo(t),i}}const Is=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;function B(o,...e){const t=[];let n="";for(let i=0,r=o.length-1;i<r;++i){const s=o[i];let c=e[i];if(n+=s,c instanceof Nn){const a=c;c=()=>a}if(typeof c=="function"&&(c=new bn(c)),c instanceof Ei){const a=Is.exec(s);a!==null&&(c.targetName=a[2])}c instanceof ko?(n+=c.createPlaceholder(t.length),t.push(c)):n+=c}return n+=o[o.length-1],new Nn(n,t)}class oe{constructor(){this.targets=new WeakSet}addStylesTo(e){this.targets.add(e)}removeStylesFrom(e){this.targets.delete(e)}isAttachedTo(e){return this.targets.has(e)}withBehaviors(...e){return this.behaviors=this.behaviors===null?e:this.behaviors.concat(e),this}}oe.create=(()=>{if(I.supportsAdoptedStyleSheets){const o=new Map;return e=>new Ts(e,o)}return o=>new Rs(o)})();function gn(o){return o.map(e=>e instanceof oe?gn(e.styles):[e]).reduce((e,t)=>e.concat(t),[])}function Li(o){return o.map(e=>e instanceof oe?e.behaviors:null).reduce((e,t)=>t===null?e:(e===null&&(e=[]),e.concat(t)),null)}class Ts extends oe{constructor(e,t){super(),this.styles=e,this.styleSheetCache=t,this._styleSheets=void 0,this.behaviors=Li(e)}get styleSheets(){if(this._styleSheets===void 0){const e=this.styles,t=this.styleSheetCache;this._styleSheets=gn(e).map(n=>{if(n instanceof CSSStyleSheet)return n;let i=t.get(n);return i===void 0&&(i=new CSSStyleSheet,i.replaceSync(n),t.set(n,i)),i})}return this._styleSheets}addStylesTo(e){e.adoptedStyleSheets=[...e.adoptedStyleSheets,...this.styleSheets],super.addStylesTo(e)}removeStylesFrom(e){const t=this.styleSheets;e.adoptedStyleSheets=e.adoptedStyleSheets.filter(n=>t.indexOf(n)===-1),super.removeStylesFrom(e)}}let Bs=0;function As(){return`fast-style-class-${++Bs}`}class Rs extends oe{constructor(e){super(),this.styles=e,this.behaviors=null,this.behaviors=Li(e),this.styleSheets=gn(e),this.styleClass=As()}addStylesTo(e){const t=this.styleSheets,n=this.styleClass;e=this.normalizeTarget(e);for(let i=0;i<t.length;i++){const r=document.createElement("style");r.innerHTML=t[i],r.className=n,e.append(r)}super.addStylesTo(e)}removeStylesFrom(e){e=this.normalizeTarget(e);const t=e.querySelectorAll(`.${this.styleClass}`);for(let n=0,i=t.length;n<i;++n)e.removeChild(t[n]);super.removeStylesFrom(e)}isAttachedTo(e){return super.isAttachedTo(this.normalizeTarget(e))}normalizeTarget(e){return e===document?document.body:e}}const Hi={toView(o){return o?"true":"false"},fromView(o){return!(o==null||o==="false"||o===!1||o===0)}},fe={toView(o){if(o==null)return null;const e=o*1;return isNaN(e)?null:e.toString()},fromView(o){if(o==null)return null;const e=o*1;return isNaN(e)?null:e}};class ho{constructor(e,t,n=t.toLowerCase(),i="reflect",r){this.guards=new Set,this.Owner=e,this.name=t,this.attribute=n,this.mode=i,this.converter=r,this.fieldName=`_${t}`,this.callbackName=`${t}Changed`,this.hasCallback=this.callbackName in e.prototype,i==="boolean"&&r===void 0&&(this.converter=Hi)}setValue(e,t){const n=e[this.fieldName],i=this.converter;i!==void 0&&(t=i.fromView(t)),n!==t&&(e[this.fieldName]=t,this.tryReflectToAttribute(e),this.hasCallback&&e[this.callbackName](n,t),e.$fastController.notify(this.name))}getValue(e){return S.track(e,this.name),e[this.fieldName]}onAttributeChangedCallback(e,t){this.guards.has(e)||(this.guards.add(e),this.setValue(e,t),this.guards.delete(e))}tryReflectToAttribute(e){const t=this.mode,n=this.guards;n.has(e)||t==="fromView"||I.queueUpdate(()=>{n.add(e);const i=e[this.fieldName];switch(t){case"reflect":const r=this.converter;I.setAttribute(e,this.attribute,r!==void 0?r.toView(i):i);break;case"boolean":I.setBooleanAttribute(e,this.attribute,i);break}n.delete(e)})}static collect(e,...t){const n=[];t.push(e.attributes);for(let i=0,r=t.length;i<r;++i){const s=t[i];if(s!==void 0)for(let c=0,a=s.length;c<a;++c){const l=s[c];typeof l=="string"?n.push(new ho(e,l)):n.push(new ho(e,l.property,l.attribute,l.mode,l.converter))}}return n}}function f(o,e){let t;function n(i,r){arguments.length>1&&(t.property=r),(i.constructor.attributes||(i.constructor.attributes=[])).push(t)}if(arguments.length>1){t={},n(o,e);return}return t=o===void 0?{}:o,n}const Vn={mode:"open"},Mn={},Ko=Dt.getById(4,()=>{const o=new Map;return Object.freeze({register(e){return o.has(e.type)?!1:(o.set(e.type,e),!0)},getByType(e){return o.get(e)}})});class $o{constructor(e,t=e.definition){typeof t=="string"&&(t={name:t}),this.type=e,this.name=t.name,this.template=t.template;const n=ho.collect(e,t.attributes),i=new Array(n.length),r={},s={};for(let c=0,a=n.length;c<a;++c){const l=n[c];i[c]=l.attribute,r[l.name]=l,s[l.attribute]=l}this.attributes=n,this.observedAttributes=i,this.propertyLookup=r,this.attributeLookup=s,this.shadowOptions=t.shadowOptions===void 0?Vn:t.shadowOptions===null?void 0:Object.assign(Object.assign({},Vn),t.shadowOptions),this.elementOptions=t.elementOptions===void 0?Mn:Object.assign(Object.assign({},Mn),t.elementOptions),this.styles=t.styles===void 0?void 0:Array.isArray(t.styles)?oe.create(t.styles):t.styles instanceof oe?t.styles:oe.create([t.styles])}get isDefined(){return!!Ko.getByType(this.type)}define(e=customElements){const t=this.type;if(Ko.register(this)){const n=this.attributes,i=t.prototype;for(let r=0,s=n.length;r<s;++r)S.defineProperty(i,n[r]);Reflect.defineProperty(t,"observedAttributes",{value:this.observedAttributes,enumerable:!0})}return e.get(this.name)||e.define(this.name,t,this.elementOptions),this}}$o.forType=Ko.getByType;const Ni=new WeakMap,Os={bubbles:!0,composed:!0,cancelable:!0};function Po(o){return o.shadowRoot||Ni.get(o)||null}class vn extends Fi{constructor(e,t){super(e),this.boundObservables=null,this.behaviors=null,this.needsInitialization=!0,this._template=null,this._styles=null,this._isConnected=!1,this.$fastController=this,this.view=null,this.element=e,this.definition=t;const n=t.shadowOptions;if(n!==void 0){const r=e.attachShadow(n);n.mode==="closed"&&Ni.set(e,r)}const i=S.getAccessors(e);if(i.length>0){const r=this.boundObservables=Object.create(null);for(let s=0,c=i.length;s<c;++s){const a=i[s].name,l=e[a];l!==void 0&&(delete e[a],r[a]=l)}}}get isConnected(){return S.track(this,"isConnected"),this._isConnected}setIsConnected(e){this._isConnected=e,S.notify(this,"isConnected")}get template(){return this._template}set template(e){this._template!==e&&(this._template=e,this.needsInitialization||this.renderTemplate(e))}get styles(){return this._styles}set styles(e){this._styles!==e&&(this._styles!==null&&this.removeStyles(this._styles),this._styles=e,!this.needsInitialization&&e!==null&&this.addStyles(e))}addStyles(e){const t=Po(this.element)||this.element.getRootNode();if(e instanceof HTMLStyleElement)t.append(e);else if(!e.isAttachedTo(t)){const n=e.behaviors;e.addStylesTo(t),n!==null&&this.addBehaviors(n)}}removeStyles(e){const t=Po(this.element)||this.element.getRootNode();if(e instanceof HTMLStyleElement)t.removeChild(e);else if(e.isAttachedTo(t)){const n=e.behaviors;e.removeStylesFrom(t),n!==null&&this.removeBehaviors(n)}}addBehaviors(e){const t=this.behaviors||(this.behaviors=new Map),n=e.length,i=[];for(let r=0;r<n;++r){const s=e[r];t.has(s)?t.set(s,t.get(s)+1):(t.set(s,1),i.push(s))}if(this._isConnected){const r=this.element;for(let s=0;s<i.length;++s)i[s].bind(r,Rt)}}removeBehaviors(e,t=!1){const n=this.behaviors;if(n===null)return;const i=e.length,r=[];for(let s=0;s<i;++s){const c=e[s];if(n.has(c)){const a=n.get(c)-1;a===0||t?n.delete(c)&&r.push(c):n.set(c,a)}}if(this._isConnected){const s=this.element;for(let c=0;c<r.length;++c)r[c].unbind(s)}}onConnectedCallback(){if(this._isConnected)return;const e=this.element;this.needsInitialization?this.finishInitialization():this.view!==null&&this.view.bind(e,Rt);const t=this.behaviors;if(t!==null)for(const[n]of t)n.bind(e,Rt);this.setIsConnected(!0)}onDisconnectedCallback(){if(!this._isConnected)return;this.setIsConnected(!1);const e=this.view;e!==null&&e.unbind();const t=this.behaviors;if(t!==null){const n=this.element;for(const[i]of t)i.unbind(n)}}onAttributeChangedCallback(e,t,n){const i=this.definition.attributeLookup[e];i!==void 0&&i.onAttributeChangedCallback(this.element,n)}emit(e,t,n){return this._isConnected?this.element.dispatchEvent(new CustomEvent(e,Object.assign(Object.assign({detail:t},Os),n))):!1}finishInitialization(){const e=this.element,t=this.boundObservables;if(t!==null){const i=Object.keys(t);for(let r=0,s=i.length;r<s;++r){const c=i[r];e[c]=t[c]}this.boundObservables=null}const n=this.definition;this._template===null&&(this.element.resolveTemplate?this._template=this.element.resolveTemplate():n.template&&(this._template=n.template||null)),this._template!==null&&this.renderTemplate(this._template),this._styles===null&&(this.element.resolveStyles?this._styles=this.element.resolveStyles():n.styles&&(this._styles=n.styles||null)),this._styles!==null&&this.addStyles(this._styles),this.needsInitialization=!1}renderTemplate(e){const t=this.element,n=Po(t)||t;this.view!==null?(this.view.dispose(),this.view=null):this.needsInitialization||I.removeChildNodes(n),e&&(this.view=e.render(t,n,t))}static forCustomElement(e){const t=e.$fastController;if(t!==void 0)return t;const n=$o.forType(e.constructor);if(n===void 0)throw new Error("Missing FASTElement definition.");return e.$fastController=new vn(e,n)}}function zn(o){return class extends o{constructor(){super(),vn.forCustomElement(this)}$emit(e,t,n){return this.$fastController.emit(e,t,n)}connectedCallback(){this.$fastController.onConnectedCallback()}disconnectedCallback(){this.$fastController.onDisconnectedCallback()}attributeChangedCallback(e,t,n){this.$fastController.onAttributeChangedCallback(e,t,n)}}}const Co=Object.assign(zn(HTMLElement),{from(o){return zn(o)},define(o,e){return new $o(o,e).define().type}});class Vi{createCSS(){return""}createBehavior(){}}function _s(o,e){const t=[];let n="";const i=[];for(let r=0,s=o.length-1;r<s;++r){n+=o[r];let c=e[r];if(c instanceof Vi){const a=c.createBehavior();c=c.createCSS(),a&&i.push(a)}c instanceof oe||c instanceof CSSStyleSheet?(n.trim()!==""&&(t.push(n),n=""),t.push(c)):n+=c}return n+=o[o.length-1],n.trim()!==""&&t.push(n),{styles:t,behaviors:i}}function D(o,...e){const{styles:t,behaviors:n}=_s(o,e),i=oe.create(t);return n.length&&i.withBehaviors(...n),i}function he(o,e,t){return{index:o,removed:e,addedCount:t}}const Mi=0,zi=1,en=2,tn=3;function Fs(o,e,t,n,i,r){const s=r-i+1,c=t-e+1,a=new Array(s);let l,d;for(let u=0;u<s;++u)a[u]=new Array(c),a[u][0]=u;for(let u=0;u<c;++u)a[0][u]=u;for(let u=1;u<s;++u)for(let b=1;b<c;++b)o[e+b-1]===n[i+u-1]?a[u][b]=a[u-1][b-1]:(l=a[u-1][b]+1,d=a[u][b-1]+1,a[u][b]=l<d?l:d);return a}function Es(o){let e=o.length-1,t=o[0].length-1,n=o[e][t];const i=[];for(;e>0||t>0;){if(e===0){i.push(en),t--;continue}if(t===0){i.push(tn),e--;continue}const r=o[e-1][t-1],s=o[e-1][t],c=o[e][t-1];let a;s<c?a=s<r?s:r:a=c<r?c:r,a===r?(r===n?i.push(Mi):(i.push(zi),n=r),e--,t--):a===s?(i.push(tn),e--,n=s):(i.push(en),t--,n=c)}return i.reverse(),i}function Ds(o,e,t){for(let n=0;n<t;++n)if(o[n]!==e[n])return n;return t}function Ps(o,e,t){let n=o.length,i=e.length,r=0;for(;r<t&&o[--n]===e[--i];)r++;return r}function Ls(o,e,t,n){return e<t||n<o?-1:e===t||n===o?0:o<t?e<n?e-t:n-t:n<e?n-o:e-o}function ji(o,e,t,n,i,r){let s=0,c=0;const a=Math.min(t-e,r-i);if(e===0&&i===0&&(s=Ds(o,n,a)),t===o.length&&r===n.length&&(c=Ps(o,n,a-s)),e+=s,i+=s,t-=c,r-=c,t-e===0&&r-i===0)return He;if(e===t){const k=he(e,[],0);for(;i<r;)k.removed.push(n[i++]);return[k]}else if(i===r)return[he(e,[],t-e)];const l=Es(Fs(o,e,t,n,i,r)),d=[];let u,b=e,m=i;for(let k=0;k<l.length;++k)switch(l[k]){case Mi:u!==void 0&&(d.push(u),u=void 0),b++,m++;break;case zi:u===void 0&&(u=he(b,[],0)),u.addedCount++,b++,u.removed.push(n[m]),m++;break;case en:u===void 0&&(u=he(b,[],0)),u.addedCount++,b++;break;case tn:u===void 0&&(u=he(b,[],0)),u.removed.push(n[m]),m++;break}return u!==void 0&&d.push(u),d}const jn=Array.prototype.push;function Hs(o,e,t,n){const i=he(e,t,n);let r=!1,s=0;for(let c=0;c<o.length;c++){const a=o[c];if(a.index+=s,r)continue;const l=Ls(i.index,i.index+i.removed.length,a.index,a.index+a.addedCount);if(l>=0){o.splice(c,1),c--,s-=a.addedCount-a.removed.length,i.addedCount+=a.addedCount-l;const d=i.removed.length+a.removed.length-l;if(!i.addedCount&&!d)r=!0;else{let u=a.removed;if(i.index<a.index){const b=i.removed.slice(0,a.index-i.index);jn.apply(b,u),u=b}if(i.index+i.removed.length>a.index+a.addedCount){const b=i.removed.slice(a.index+a.addedCount-i.index);jn.apply(u,b)}i.removed=u,a.index<i.index&&(i.index=a.index)}}else if(i.index<a.index){r=!0,o.splice(c,0,i),c++;const d=i.addedCount-i.removed.length;a.index+=d,s+=d}}r||o.push(i)}function Ns(o){const e=[];for(let t=0,n=o.length;t<n;t++){const i=o[t];Hs(e,i.index,i.removed,i.addedCount)}return e}function Vs(o,e){let t=[];const n=Ns(e);for(let i=0,r=n.length;i<r;++i){const s=n[i];if(s.addedCount===1&&s.removed.length===1){s.removed[0]!==o[s.index]&&t.push(s);continue}t=t.concat(ji(o,s.index,s.index+s.addedCount,s.removed,0,s.removed.length))}return t}let qn=!1;function Lo(o,e){let t=o.index;const n=e.length;return t>n?t=n-o.addedCount:t<0&&(t=n+o.removed.length+t-o.addedCount),t<0&&(t=0),o.index=t,o}class Ms extends uo{constructor(e){super(e),this.oldCollection=void 0,this.splices=void 0,this.needsQueue=!0,this.call=this.flush,Reflect.defineProperty(e,"$fastController",{value:this,enumerable:!1})}addSplice(e){this.splices===void 0?this.splices=[e]:this.splices.push(e),this.needsQueue&&(this.needsQueue=!1,I.queueUpdate(this))}reset(e){this.oldCollection=e,this.needsQueue&&(this.needsQueue=!1,I.queueUpdate(this))}flush(){const e=this.splices,t=this.oldCollection;if(e===void 0&&t===void 0)return;this.needsQueue=!0,this.splices=void 0,this.oldCollection=void 0;const n=t===void 0?Vs(this.source,e):ji(this.source,0,this.source.length,t,0,t.length);this.notify(n)}}function zs(){if(qn)return;qn=!0,S.setArrayObserverFactory(a=>new Ms(a));const o=Array.prototype;if(o.$fastPatch)return;Reflect.defineProperty(o,"$fastPatch",{value:1,enumerable:!1});const e=o.pop,t=o.push,n=o.reverse,i=o.shift,r=o.sort,s=o.splice,c=o.unshift;o.pop=function(){const a=this.length>0,l=e.apply(this,arguments),d=this.$fastController;return d!==void 0&&a&&d.addSplice(he(this.length,[l],0)),l},o.push=function(){const a=t.apply(this,arguments),l=this.$fastController;return l!==void 0&&l.addSplice(Lo(he(this.length-arguments.length,[],arguments.length),this)),a},o.reverse=function(){let a;const l=this.$fastController;l!==void 0&&(l.flush(),a=this.slice());const d=n.apply(this,arguments);return l!==void 0&&l.reset(a),d},o.shift=function(){const a=this.length>0,l=i.apply(this,arguments),d=this.$fastController;return d!==void 0&&a&&d.addSplice(he(0,[l],0)),l},o.sort=function(){let a;const l=this.$fastController;l!==void 0&&(l.flush(),a=this.slice());const d=r.apply(this,arguments);return l!==void 0&&l.reset(a),d},o.splice=function(){const a=s.apply(this,arguments),l=this.$fastController;return l!==void 0&&l.addSplice(Lo(he(+arguments[0],a,arguments.length>2?arguments.length-2:0),this)),a},o.unshift=function(){const a=c.apply(this,arguments),l=this.$fastController;return l!==void 0&&l.addSplice(Lo(he(0,[],arguments.length),this)),a}}class js{constructor(e,t){this.target=e,this.propertyName=t}bind(e){e[this.propertyName]=this.target}unbind(){}}function K(o){return new fn("fast-ref",js,o)}function fo(o,e){const t=typeof e=="function"?e:()=>e;return(n,i)=>o(n,i)?t(n,i):null}Object.freeze({positioning:!1,recycle:!0});function qs(o,e,t,n){o.bind(e[t],n)}function Us(o,e,t,n){const i=Object.create(n);i.index=t,i.length=e.length,o.bind(e[t],i)}class Gs{constructor(e,t,n,i,r,s){this.location=e,this.itemsBinding=t,this.templateBinding=i,this.options=s,this.source=null,this.views=[],this.items=null,this.itemsObserver=null,this.originalContext=void 0,this.childContext=void 0,this.bindView=qs,this.itemsBindingObserver=S.binding(t,this,n),this.templateBindingObserver=S.binding(i,this,r),s.positioning&&(this.bindView=Us)}bind(e,t){this.source=e,this.originalContext=t,this.childContext=Object.create(t),this.childContext.parent=e,this.childContext.parentContext=this.originalContext,this.items=this.itemsBindingObserver.observe(e,this.originalContext),this.template=this.templateBindingObserver.observe(e,this.originalContext),this.observeItems(!0),this.refreshAllViews()}unbind(){this.source=null,this.items=null,this.itemsObserver!==null&&this.itemsObserver.unsubscribe(this),this.unbindAllViews(),this.itemsBindingObserver.disconnect(),this.templateBindingObserver.disconnect()}handleChange(e,t){e===this.itemsBinding?(this.items=this.itemsBindingObserver.observe(this.source,this.originalContext),this.observeItems(),this.refreshAllViews()):e===this.templateBinding?(this.template=this.templateBindingObserver.observe(this.source,this.originalContext),this.refreshAllViews(!0)):this.updateViews(t)}observeItems(e=!1){if(!this.items){this.items=He;return}const t=this.itemsObserver,n=this.itemsObserver=S.getNotifier(this.items),i=t!==n;i&&t!==null&&t.unsubscribe(this),(i||e)&&n.subscribe(this)}updateViews(e){const t=this.childContext,n=this.views,i=[],r=this.bindView;let s=0;for(let l=0,d=e.length;l<d;++l){const u=e[l],b=u.removed;i.push(...n.splice(u.index+s,b.length)),s-=u.addedCount}const c=this.items,a=this.template;for(let l=0,d=e.length;l<d;++l){const u=e[l];let b=u.index;const m=b+u.addedCount;for(;b<m;++b){const k=n[b],A=k?k.firstChild:this.location,N=this.options.recycle&&i.length>0?i.shift():a.create();n.splice(b,0,N),r(N,c,b,t),N.insertBefore(A)}}for(let l=0,d=i.length;l<d;++l)i[l].dispose();if(this.options.positioning)for(let l=0,d=n.length;l<d;++l){const u=n[l].context;u.length=d,u.index=l}}refreshAllViews(e=!1){const t=this.items,n=this.childContext,i=this.template,r=this.location,s=this.bindView;let c=t.length,a=this.views,l=a.length;if((c===0||e)&&(Pi.disposeContiguousBatch(a),l=0),l===0){this.views=a=new Array(c);for(let d=0;d<c;++d){const u=i.create();s(u,t,d,n),a[d]=u,u.insertBefore(r)}}else{let d=0;for(;d<c;++d)if(d<l){const b=a[d];s(b,t,d,n)}else{const b=i.create();s(b,t,d,n),a.push(b),b.insertBefore(r)}const u=a.splice(d,l-d);for(d=0,c=u.length;d<c;++d)u[d].dispose()}}unbindAllViews(){const e=this.views;for(let t=0,n=e.length;t<n;++t)e[t].unbind()}}class qi extends ko{constructor(e,t,n){super(),this.itemsBinding=e,this.templateBinding=t,this.options=n,this.createPlaceholder=I.createBlockPlaceholder,zs(),this.isItemsBindingVolatile=S.isVolatileBinding(e),this.isTemplateBindingVolatile=S.isVolatileBinding(t)}createBehavior(e){return new Gs(e,this.itemsBinding,this.isItemsBindingVolatile,this.templateBinding,this.isTemplateBindingVolatile,this.options)}}function mn(o){return o?function(e,t,n){return e.nodeType===1&&e.matches(o)}:function(e,t,n){return e.nodeType===1}}class Ui{constructor(e,t){this.target=e,this.options=t,this.source=null}bind(e){const t=this.options.property;this.shouldUpdate=S.getAccessors(e).some(n=>n.name===t),this.source=e,this.updateTarget(this.computeNodes()),this.shouldUpdate&&this.observe()}unbind(){this.updateTarget(He),this.source=null,this.shouldUpdate&&this.disconnect()}handleEvent(){this.updateTarget(this.computeNodes())}computeNodes(){let e=this.getNodes();return this.options.filter!==void 0&&(e=e.filter(this.options.filter)),e}updateTarget(e){this.source[this.options.property]=e}}class Ws extends Ui{constructor(e,t){super(e,t)}observe(){this.target.addEventListener("slotchange",this)}disconnect(){this.target.removeEventListener("slotchange",this)}getNodes(){return this.target.assignedNodes(this.options)}}function le(o){return typeof o=="string"&&(o={property:o}),new fn("fast-slotted",Ws,o)}class Qs extends Ui{constructor(e,t){super(e,t),this.observer=null,t.childList=!0}observe(){this.observer===null&&(this.observer=new MutationObserver(this.handleEvent.bind(this))),this.observer.observe(this.target,this.options)}disconnect(){this.observer.disconnect()}getNodes(){return"subtree"in this.options?Array.from(this.target.querySelectorAll(this.options.selector)):Array.from(this.target.childNodes)}}function Gi(o){return typeof o=="string"&&(o={property:o}),new fn("fast-children",Qs,o)}class ht{handleStartContentChange(){this.startContainer.classList.toggle("start",this.start.assignedNodes().length>0)}handleEndContentChange(){this.endContainer.classList.toggle("end",this.end.assignedNodes().length>0)}}const ft=(o,e)=>B`
    <span
        part="end"
        ${K("endContainer")}
        class=${t=>e.end?"end":void 0}
    >
        <slot name="end" ${K("end")} @slotchange="${t=>t.handleEndContentChange()}">
            ${e.end||""}
        </slot>
    </span>
`,bt=(o,e)=>B`
    <span
        part="start"
        ${K("startContainer")}
        class="${t=>e.start?"start":void 0}"
    >
        <slot
            name="start"
            ${K("start")}
            @slotchange="${t=>t.handleStartContentChange()}"
        >
            ${e.start||""}
        </slot>
    </span>
`;B`
    <span part="end" ${K("endContainer")}>
        <slot
            name="end"
            ${K("end")}
            @slotchange="${o=>o.handleEndContentChange()}"
        ></slot>
    </span>
`;B`
    <span part="start" ${K("startContainer")}>
        <slot
            name="start"
            ${K("start")}
            @slotchange="${o=>o.handleStartContentChange()}"
        ></slot>
    </span>
`;/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */function h(o,e,t,n){var i=arguments.length,r=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(o,e,t,n);else for(var c=o.length-1;c>=0;c--)(s=o[c])&&(r=(i<3?s(r):i>3?s(e,t,r):s(e,t))||r);return i>3&&r&&Object.defineProperty(e,t,r),r}const Ho=new Map;"metadata"in Reflect||(Reflect.metadata=function(o,e){return function(t){Reflect.defineMetadata(o,e,t)}},Reflect.defineMetadata=function(o,e,t){let n=Ho.get(t);n===void 0&&Ho.set(t,n=new Map),n.set(o,e)},Reflect.getOwnMetadata=function(o,e){const t=Ho.get(e);if(t!==void 0)return t.get(o)});class Xs{constructor(e,t){this.container=e,this.key=t}instance(e){return this.registerResolver(0,e)}singleton(e){return this.registerResolver(1,e)}transient(e){return this.registerResolver(2,e)}callback(e){return this.registerResolver(3,e)}cachedCallback(e){return this.registerResolver(3,Qi(e))}aliasTo(e){return this.registerResolver(5,e)}registerResolver(e,t){const{container:n,key:i}=this;return this.container=this.key=void 0,n.registerResolver(i,new ae(i,e,t))}}function wt(o){const e=o.slice(),t=Object.keys(o),n=t.length;let i;for(let r=0;r<n;++r)i=t[r],Xi(i)||(e[i]=o[i]);return e}const Ys=Object.freeze({none(o){throw Error(`${o.toString()} not registered, did you forget to add @singleton()?`)},singleton(o){return new ae(o,1,o)},transient(o){return new ae(o,2,o)}}),No=Object.freeze({default:Object.freeze({parentLocator:()=>null,responsibleForOwnerRequests:!1,defaultResolver:Ys.singleton})}),Un=new Map;function Gn(o){return e=>Reflect.getOwnMetadata(o,e)}let Wn=null;const E=Object.freeze({createContainer(o){return new Ot(null,Object.assign({},No.default,o))},findResponsibleContainer(o){const e=o.$$container$$;return e&&e.responsibleForOwnerRequests?e:E.findParentContainer(o)},findParentContainer(o){const e=new CustomEvent(Wi,{bubbles:!0,composed:!0,cancelable:!0,detail:{container:void 0}});return o.dispatchEvent(e),e.detail.container||E.getOrCreateDOMContainer()},getOrCreateDOMContainer(o,e){return o?o.$$container$$||new Ot(o,Object.assign({},No.default,e,{parentLocator:E.findParentContainer})):Wn||(Wn=new Ot(null,Object.assign({},No.default,e,{parentLocator:()=>null})))},getDesignParamtypes:Gn("design:paramtypes"),getAnnotationParamtypes:Gn("di:paramtypes"),getOrCreateAnnotationParamTypes(o){let e=this.getAnnotationParamtypes(o);return e===void 0&&Reflect.defineMetadata("di:paramtypes",e=[],o),e},getDependencies(o){let e=Un.get(o);if(e===void 0){const t=o.inject;if(t===void 0){const n=E.getDesignParamtypes(o),i=E.getAnnotationParamtypes(o);if(n===void 0)if(i===void 0){const r=Object.getPrototypeOf(o);typeof r=="function"&&r!==Function.prototype?e=wt(E.getDependencies(r)):e=[]}else e=wt(i);else if(i===void 0)e=wt(n);else{e=wt(n);let r=i.length,s;for(let l=0;l<r;++l)s=i[l],s!==void 0&&(e[l]=s);const c=Object.keys(i);r=c.length;let a;for(let l=0;l<r;++l)a=c[l],Xi(a)||(e[a]=i[a])}}else e=wt(t);Un.set(o,e)}return e},defineProperty(o,e,t,n=!1){const i=`$di_${e}`;Reflect.defineProperty(o,e,{get:function(){let r=this[i];if(r===void 0&&(r=(this instanceof HTMLElement?E.findResponsibleContainer(this):E.getOrCreateDOMContainer()).get(t),this[i]=r,n&&this instanceof Co)){const c=this.$fastController,a=()=>{const d=E.findResponsibleContainer(this).get(t),u=this[i];d!==u&&(this[i]=r,c.notify(e))};c.subscribe({handleChange:a},"isConnected")}return r}})},createInterface(o,e){const t=typeof o=="function"?o:e,n=typeof o=="string"?o:o&&"friendlyName"in o&&o.friendlyName||Jn,i=typeof o=="string"?!1:o&&"respectConnection"in o&&o.respectConnection||!1,r=function(s,c,a){if(s==null||new.target!==void 0)throw new Error(`No registration for interface: '${r.friendlyName}'`);if(c)E.defineProperty(s,c,r,i);else{const l=E.getOrCreateAnnotationParamTypes(s);l[a]=r}};return r.$isInterface=!0,r.friendlyName=n??"(anonymous)",t!=null&&(r.register=function(s,c){return t(new Xs(s,c??r))}),r.toString=function(){return`InterfaceSymbol<${r.friendlyName}>`},r},inject(...o){return function(e,t,n){if(typeof n=="number"){const i=E.getOrCreateAnnotationParamTypes(e),r=o[0];r!==void 0&&(i[n]=r)}else if(t)E.defineProperty(e,t,o[0]);else{const i=n?E.getOrCreateAnnotationParamTypes(n.value):E.getOrCreateAnnotationParamTypes(e);let r;for(let s=0;s<o.length;++s)r=o[s],r!==void 0&&(i[s]=r)}}},transient(o){return o.register=function(t){return Lt.transient(o,o).register(t)},o.registerInRequestor=!1,o},singleton(o,e=Zs){return o.register=function(n){return Lt.singleton(o,o).register(n)},o.registerInRequestor=e.scoped,o}}),Js=E.createInterface("Container");E.inject;const Zs={scoped:!1};class ae{constructor(e,t,n){this.key=e,this.strategy=t,this.state=n,this.resolving=!1}get $isResolver(){return!0}register(e){return e.registerResolver(this.key,this)}resolve(e,t){switch(this.strategy){case 0:return this.state;case 1:{if(this.resolving)throw new Error(`Cyclic dependency found: ${this.state.name}`);return this.resolving=!0,this.state=e.getFactory(this.state).construct(t),this.strategy=0,this.resolving=!1,this.state}case 2:{const n=e.getFactory(this.state);if(n===null)throw new Error(`Resolver for ${String(this.key)} returned a null factory`);return n.construct(t)}case 3:return this.state(e,t,this);case 4:return this.state[0].resolve(e,t);case 5:return t.get(this.state);default:throw new Error(`Invalid resolver strategy specified: ${this.strategy}.`)}}getFactory(e){var t,n,i;switch(this.strategy){case 1:case 2:return e.getFactory(this.state);case 5:return(i=(n=(t=e.getResolver(this.state))===null||t===void 0?void 0:t.getFactory)===null||n===void 0?void 0:n.call(t,e))!==null&&i!==void 0?i:null;default:return null}}}function Qn(o){return this.get(o)}function Ks(o,e){return e(o)}class ec{constructor(e,t){this.Type=e,this.dependencies=t,this.transformers=null}construct(e,t){let n;return t===void 0?n=new this.Type(...this.dependencies.map(Qn,e)):n=new this.Type(...this.dependencies.map(Qn,e),...t),this.transformers==null?n:this.transformers.reduce(Ks,n)}registerTransformer(e){(this.transformers||(this.transformers=[])).push(e)}}const tc={$isResolver:!0,resolve(o,e){return e}};function io(o){return typeof o.register=="function"}function oc(o){return io(o)&&typeof o.registerInRequestor=="boolean"}function Xn(o){return oc(o)&&o.registerInRequestor}function nc(o){return o.prototype!==void 0}const ic=new Set(["Array","ArrayBuffer","Boolean","DataView","Date","Error","EvalError","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Map","Number","Object","Promise","RangeError","ReferenceError","RegExp","Set","SharedArrayBuffer","String","SyntaxError","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","URIError","WeakMap","WeakSet"]),Wi="__DI_LOCATE_PARENT__",Vo=new Map;class Ot{constructor(e,t){this.owner=e,this.config=t,this._parent=void 0,this.registerDepth=0,this.context=null,e!==null&&(e.$$container$$=this),this.resolvers=new Map,this.resolvers.set(Js,tc),e instanceof Node&&e.addEventListener(Wi,n=>{n.composedPath()[0]!==this.owner&&(n.detail.container=this,n.stopImmediatePropagation())})}get parent(){return this._parent===void 0&&(this._parent=this.config.parentLocator(this.owner)),this._parent}get depth(){return this.parent===null?0:this.parent.depth+1}get responsibleForOwnerRequests(){return this.config.responsibleForOwnerRequests}registerWithContext(e,...t){return this.context=e,this.register(...t),this.context=null,this}register(...e){if(++this.registerDepth===100)throw new Error("Unable to autoregister dependency");let t,n,i,r,s;const c=this.context;for(let a=0,l=e.length;a<l;++a)if(t=e[a],!!Zn(t))if(io(t))t.register(this,c);else if(nc(t))Lt.singleton(t,t).register(this);else for(n=Object.keys(t),r=0,s=n.length;r<s;++r)i=t[n[r]],Zn(i)&&(io(i)?i.register(this,c):this.register(i));return--this.registerDepth,this}registerResolver(e,t){Yt(e);const n=this.resolvers,i=n.get(e);return i==null?n.set(e,t):i instanceof ae&&i.strategy===4?i.state.push(t):n.set(e,new ae(e,4,[i,t])),t}registerTransformer(e,t){const n=this.getResolver(e);if(n==null)return!1;if(n.getFactory){const i=n.getFactory(this);return i==null?!1:(i.registerTransformer(t),!0)}return!1}getResolver(e,t=!0){if(Yt(e),e.resolve!==void 0)return e;let n=this,i;for(;n!=null;)if(i=n.resolvers.get(e),i==null){if(n.parent==null){const r=Xn(e)?this:n;return t?this.jitRegister(e,r):null}n=n.parent}else return i;return null}has(e,t=!1){return this.resolvers.has(e)?!0:t&&this.parent!=null?this.parent.has(e,!0):!1}get(e){if(Yt(e),e.$isResolver)return e.resolve(this,this);let t=this,n;for(;t!=null;)if(n=t.resolvers.get(e),n==null){if(t.parent==null){const i=Xn(e)?this:t;return n=this.jitRegister(e,i),n.resolve(t,this)}t=t.parent}else return n.resolve(t,this);throw new Error(`Unable to resolve key: ${e}`)}getAll(e,t=!1){Yt(e);const n=this;let i=n,r;if(t){let s=He;for(;i!=null;)r=i.resolvers.get(e),r!=null&&(s=s.concat(Yn(r,i,n))),i=i.parent;return s}else for(;i!=null;)if(r=i.resolvers.get(e),r==null){if(i=i.parent,i==null)return He}else return Yn(r,i,n);return He}getFactory(e){let t=Vo.get(e);if(t===void 0){if(rc(e))throw new Error(`${e.name} is a native function and therefore cannot be safely constructed by DI. If this is intentional, please use a callback or cachedCallback resolver.`);Vo.set(e,t=new ec(e,E.getDependencies(e)))}return t}registerFactory(e,t){Vo.set(e,t)}createChild(e){return new Ot(null,Object.assign({},this.config,e,{parentLocator:()=>this}))}jitRegister(e,t){if(typeof e!="function")throw new Error(`Attempted to jitRegister something that is not a constructor: '${e}'. Did you forget to register this dependency?`);if(ic.has(e.name))throw new Error(`Attempted to jitRegister an intrinsic type: ${e.name}. Did you forget to add @inject(Key)`);if(io(e)){const n=e.register(t);if(!(n instanceof Object)||n.resolve==null){const i=t.resolvers.get(e);if(i!=null)return i;throw new Error("A valid resolver was not returned from the static register method")}return n}else{if(e.$isInterface)throw new Error(`Attempted to jitRegister an interface: ${e.friendlyName}`);{const n=this.config.defaultResolver(e,t);return t.resolvers.set(e,n),n}}}}const Mo=new WeakMap;function Qi(o){return function(e,t,n){if(Mo.has(n))return Mo.get(n);const i=o(e,t,n);return Mo.set(n,i),i}}const Lt=Object.freeze({instance(o,e){return new ae(o,0,e)},singleton(o,e){return new ae(o,1,e)},transient(o,e){return new ae(o,2,e)},callback(o,e){return new ae(o,3,e)},cachedCallback(o,e){return new ae(o,3,Qi(e))},aliasTo(o,e){return new ae(e,5,o)}});function Yt(o){if(o==null)throw new Error("key/value cannot be null or undefined. Are you trying to inject/register something that doesn't exist with DI?")}function Yn(o,e,t){if(o instanceof ae&&o.strategy===4){const n=o.state;let i=n.length;const r=new Array(i);for(;i--;)r[i]=n[i].resolve(e,t);return r}return[o.resolve(e,t)]}const Jn="(anonymous)";function Zn(o){return typeof o=="object"&&o!==null||typeof o=="function"}const rc=function(){const o=new WeakMap;let e=!1,t="",n=0;return function(i){return e=o.get(i),e===void 0&&(t=i.toString(),n=t.length,e=n>=29&&n<=100&&t.charCodeAt(n-1)===125&&t.charCodeAt(n-2)<=32&&t.charCodeAt(n-3)===93&&t.charCodeAt(n-4)===101&&t.charCodeAt(n-5)===100&&t.charCodeAt(n-6)===111&&t.charCodeAt(n-7)===99&&t.charCodeAt(n-8)===32&&t.charCodeAt(n-9)===101&&t.charCodeAt(n-10)===118&&t.charCodeAt(n-11)===105&&t.charCodeAt(n-12)===116&&t.charCodeAt(n-13)===97&&t.charCodeAt(n-14)===110&&t.charCodeAt(n-15)===88,o.set(i,e)),e}}(),Jt={};function Xi(o){switch(typeof o){case"number":return o>=0&&(o|0)===o;case"string":{const e=Jt[o];if(e!==void 0)return e;const t=o.length;if(t===0)return Jt[o]=!1;let n=0;for(let i=0;i<t;++i)if(n=o.charCodeAt(i),i===0&&n===48&&t>1||n<48||n>57)return Jt[o]=!1;return Jt[o]=!0}default:return!1}}function Kn(o){return`${o.toLowerCase()}:presentation`}const Zt=new Map,Yi=Object.freeze({define(o,e,t){const n=Kn(o);Zt.get(n)===void 0?Zt.set(n,e):Zt.set(n,!1),t.register(Lt.instance(n,e))},forTag(o,e){const t=Kn(o),n=Zt.get(t);return n===!1?E.findResponsibleContainer(e).get(t):n||null}});class sc{constructor(e,t){this.template=e||null,this.styles=t===void 0?null:Array.isArray(t)?oe.create(t):t instanceof oe?t:oe.create([t])}applyTo(e){const t=e.$fastController;t.template===null&&(t.template=this.template),t.styles===null&&(t.styles=this.styles)}}class _ extends Co{constructor(){super(...arguments),this._presentation=void 0}get $presentation(){return this._presentation===void 0&&(this._presentation=Yi.forTag(this.tagName,this)),this._presentation}templateChanged(){this.template!==void 0&&(this.$fastController.template=this.template)}stylesChanged(){this.styles!==void 0&&(this.$fastController.styles=this.styles)}connectedCallback(){this.$presentation!==null&&this.$presentation.applyTo(this),super.connectedCallback()}static compose(e){return(t={})=>new cc(this===_?class extends _{}:this,e,t)}}h([g],_.prototype,"template",void 0);h([g],_.prototype,"styles",void 0);function kt(o,e,t){return typeof o=="function"?o(e,t):o}class cc{constructor(e,t,n){this.type=e,this.elementDefinition=t,this.overrideDefinition=n,this.definition=Object.assign(Object.assign({},this.elementDefinition),this.overrideDefinition)}register(e,t){const n=this.definition,i=this.overrideDefinition,s=`${n.prefix||t.elementPrefix}-${n.baseName}`;t.tryDefineElement({name:s,type:this.type,baseClass:this.elementDefinition.baseClass,callback:c=>{const a=new sc(kt(n.template,c,n),kt(n.styles,c,n));c.definePresentation(a);let l=kt(n.shadowOptions,c,n);c.shadowRootMode&&(l?i.shadowOptions||(l.mode=c.shadowRootMode):l!==null&&(l={mode:c.shadowRootMode})),c.defineElement({elementOptions:kt(n.elementOptions,c,n),shadowOptions:l,attributes:kt(n.attributes,c,n)})}})}}function ie(o,...e){e.forEach(t=>{if(Object.getOwnPropertyNames(t.prototype).forEach(n=>{n!=="constructor"&&Object.defineProperty(o.prototype,n,Object.getOwnPropertyDescriptor(t.prototype,n))}),t.attributes){const n=o.attributes||[];o.attributes=n.concat(t.attributes)}})}var Ht;(function(o){o.horizontal="horizontal",o.vertical="vertical"})(Ht||(Ht={}));function ac(o,e){let t=o.length;for(;t--;)if(e(o[t],t,o))return t;return-1}function lc(){return!!(typeof window<"u"&&window.document&&window.document.createElement)}function dc(...o){return o.every(e=>e instanceof HTMLElement)}function uc(){const o=document.querySelector('meta[property="csp-nonce"]');return o?o.getAttribute("content"):null}let Ee;function hc(){if(typeof Ee=="boolean")return Ee;if(!lc())return Ee=!1,Ee;const o=document.createElement("style"),e=uc();e!==null&&o.setAttribute("nonce",e),document.head.appendChild(o);try{o.sheet.insertRule("foo:focus-visible {color:inherit}",0),Ee=!0}catch{Ee=!1}finally{document.head.removeChild(o)}return Ee}const ei="focus",ti="focusin",lt="focusout",dt="keydown";var oi;(function(o){o[o.alt=18]="alt",o[o.arrowDown=40]="arrowDown",o[o.arrowLeft=37]="arrowLeft",o[o.arrowRight=39]="arrowRight",o[o.arrowUp=38]="arrowUp",o[o.back=8]="back",o[o.backSlash=220]="backSlash",o[o.break=19]="break",o[o.capsLock=20]="capsLock",o[o.closeBracket=221]="closeBracket",o[o.colon=186]="colon",o[o.colon2=59]="colon2",o[o.comma=188]="comma",o[o.ctrl=17]="ctrl",o[o.delete=46]="delete",o[o.end=35]="end",o[o.enter=13]="enter",o[o.equals=187]="equals",o[o.equals2=61]="equals2",o[o.equals3=107]="equals3",o[o.escape=27]="escape",o[o.forwardSlash=191]="forwardSlash",o[o.function1=112]="function1",o[o.function10=121]="function10",o[o.function11=122]="function11",o[o.function12=123]="function12",o[o.function2=113]="function2",o[o.function3=114]="function3",o[o.function4=115]="function4",o[o.function5=116]="function5",o[o.function6=117]="function6",o[o.function7=118]="function7",o[o.function8=119]="function8",o[o.function9=120]="function9",o[o.home=36]="home",o[o.insert=45]="insert",o[o.menu=93]="menu",o[o.minus=189]="minus",o[o.minus2=109]="minus2",o[o.numLock=144]="numLock",o[o.numPad0=96]="numPad0",o[o.numPad1=97]="numPad1",o[o.numPad2=98]="numPad2",o[o.numPad3=99]="numPad3",o[o.numPad4=100]="numPad4",o[o.numPad5=101]="numPad5",o[o.numPad6=102]="numPad6",o[o.numPad7=103]="numPad7",o[o.numPad8=104]="numPad8",o[o.numPad9=105]="numPad9",o[o.numPadDivide=111]="numPadDivide",o[o.numPadDot=110]="numPadDot",o[o.numPadMinus=109]="numPadMinus",o[o.numPadMultiply=106]="numPadMultiply",o[o.numPadPlus=107]="numPadPlus",o[o.openBracket=219]="openBracket",o[o.pageDown=34]="pageDown",o[o.pageUp=33]="pageUp",o[o.period=190]="period",o[o.print=44]="print",o[o.quote=222]="quote",o[o.scrollLock=145]="scrollLock",o[o.shift=16]="shift",o[o.space=32]="space",o[o.tab=9]="tab",o[o.tilde=192]="tilde",o[o.windowsLeft=91]="windowsLeft",o[o.windowsOpera=219]="windowsOpera",o[o.windowsRight=92]="windowsRight"})(oi||(oi={}));const pt="ArrowDown",Nt="ArrowLeft",Vt="ArrowRight",gt="ArrowUp",Ut="Enter",So="Escape",vt="Home",mt="End",fc="F2",bc="PageDown",pc="PageUp",Gt=" ",yn="Tab",Ji={ArrowDown:pt,ArrowLeft:Nt,ArrowRight:Vt,ArrowUp:gt};var ut;(function(o){o.ltr="ltr",o.rtl="rtl"})(ut||(ut={}));function gc(o,e,t){return t<o?e:t>e?o:t}function Kt(o,e,t=0){return[e,t]=[e,t].sort((n,i)=>n-i),e<=o&&o<t}let vc=0;function bo(o=""){return`${o}${vc++}`}const mc=(o,e)=>B`
    <a
        class="control"
        part="control"
        download="${t=>t.download}"
        href="${t=>t.href}"
        hreflang="${t=>t.hreflang}"
        ping="${t=>t.ping}"
        referrerpolicy="${t=>t.referrerpolicy}"
        rel="${t=>t.rel}"
        target="${t=>t.target}"
        type="${t=>t.type}"
        aria-atomic="${t=>t.ariaAtomic}"
        aria-busy="${t=>t.ariaBusy}"
        aria-controls="${t=>t.ariaControls}"
        aria-current="${t=>t.ariaCurrent}"
        aria-describedby="${t=>t.ariaDescribedby}"
        aria-details="${t=>t.ariaDetails}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-errormessage="${t=>t.ariaErrormessage}"
        aria-expanded="${t=>t.ariaExpanded}"
        aria-flowto="${t=>t.ariaFlowto}"
        aria-haspopup="${t=>t.ariaHaspopup}"
        aria-hidden="${t=>t.ariaHidden}"
        aria-invalid="${t=>t.ariaInvalid}"
        aria-keyshortcuts="${t=>t.ariaKeyshortcuts}"
        aria-label="${t=>t.ariaLabel}"
        aria-labelledby="${t=>t.ariaLabelledby}"
        aria-live="${t=>t.ariaLive}"
        aria-owns="${t=>t.ariaOwns}"
        aria-relevant="${t=>t.ariaRelevant}"
        aria-roledescription="${t=>t.ariaRoledescription}"
        ${K("control")}
    >
        ${bt(o,e)}
        <span class="content" part="content">
            <slot ${le("defaultSlottedContent")}></slot>
        </span>
        ${ft(o,e)}
    </a>
`;class F{}h([f({attribute:"aria-atomic"})],F.prototype,"ariaAtomic",void 0);h([f({attribute:"aria-busy"})],F.prototype,"ariaBusy",void 0);h([f({attribute:"aria-controls"})],F.prototype,"ariaControls",void 0);h([f({attribute:"aria-current"})],F.prototype,"ariaCurrent",void 0);h([f({attribute:"aria-describedby"})],F.prototype,"ariaDescribedby",void 0);h([f({attribute:"aria-details"})],F.prototype,"ariaDetails",void 0);h([f({attribute:"aria-disabled"})],F.prototype,"ariaDisabled",void 0);h([f({attribute:"aria-errormessage"})],F.prototype,"ariaErrormessage",void 0);h([f({attribute:"aria-flowto"})],F.prototype,"ariaFlowto",void 0);h([f({attribute:"aria-haspopup"})],F.prototype,"ariaHaspopup",void 0);h([f({attribute:"aria-hidden"})],F.prototype,"ariaHidden",void 0);h([f({attribute:"aria-invalid"})],F.prototype,"ariaInvalid",void 0);h([f({attribute:"aria-keyshortcuts"})],F.prototype,"ariaKeyshortcuts",void 0);h([f({attribute:"aria-label"})],F.prototype,"ariaLabel",void 0);h([f({attribute:"aria-labelledby"})],F.prototype,"ariaLabelledby",void 0);h([f({attribute:"aria-live"})],F.prototype,"ariaLive",void 0);h([f({attribute:"aria-owns"})],F.prototype,"ariaOwns",void 0);h([f({attribute:"aria-relevant"})],F.prototype,"ariaRelevant",void 0);h([f({attribute:"aria-roledescription"})],F.prototype,"ariaRoledescription",void 0);class be extends _{constructor(){super(...arguments),this.handleUnsupportedDelegatesFocus=()=>{var e;window.ShadowRoot&&!window.ShadowRoot.prototype.hasOwnProperty("delegatesFocus")&&((e=this.$fastController.definition.shadowOptions)===null||e===void 0?void 0:e.delegatesFocus)&&(this.focus=()=>{this.control.focus()})}}connectedCallback(){super.connectedCallback(),this.handleUnsupportedDelegatesFocus()}}h([f],be.prototype,"download",void 0);h([f],be.prototype,"href",void 0);h([f],be.prototype,"hreflang",void 0);h([f],be.prototype,"ping",void 0);h([f],be.prototype,"referrerpolicy",void 0);h([f],be.prototype,"rel",void 0);h([f],be.prototype,"target",void 0);h([f],be.prototype,"type",void 0);h([g],be.prototype,"defaultSlottedContent",void 0);class xn{}h([f({attribute:"aria-expanded"})],xn.prototype,"ariaExpanded",void 0);ie(xn,F);ie(be,ht,xn);const yc=o=>{const e=o.closest("[dir]");return e!==null&&e.dir==="rtl"?ut.rtl:ut.ltr},Zi=(o,e)=>B`
    <template class="${t=>t.circular?"circular":""}">
        <div class="control" part="control" style="${t=>t.generateBadgeStyle()}">
            <slot></slot>
        </div>
    </template>
`;class Wt extends _{constructor(){super(...arguments),this.generateBadgeStyle=()=>{if(!this.fill&&!this.color)return;const e=`background-color: var(--badge-fill-${this.fill});`,t=`color: var(--badge-color-${this.color});`;return this.fill&&!this.color?e:this.color&&!this.fill?t:`${t} ${e}`}}}h([f({attribute:"fill"})],Wt.prototype,"fill",void 0);h([f({attribute:"color"})],Wt.prototype,"color",void 0);h([f({mode:"boolean"})],Wt.prototype,"circular",void 0);const xc=(o,e)=>B`
    <button
        class="control"
        part="control"
        ?autofocus="${t=>t.autofocus}"
        ?disabled="${t=>t.disabled}"
        form="${t=>t.formId}"
        formaction="${t=>t.formaction}"
        formenctype="${t=>t.formenctype}"
        formmethod="${t=>t.formmethod}"
        formnovalidate="${t=>t.formnovalidate}"
        formtarget="${t=>t.formtarget}"
        name="${t=>t.name}"
        type="${t=>t.type}"
        value="${t=>t.value}"
        aria-atomic="${t=>t.ariaAtomic}"
        aria-busy="${t=>t.ariaBusy}"
        aria-controls="${t=>t.ariaControls}"
        aria-current="${t=>t.ariaCurrent}"
        aria-describedby="${t=>t.ariaDescribedby}"
        aria-details="${t=>t.ariaDetails}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-errormessage="${t=>t.ariaErrormessage}"
        aria-expanded="${t=>t.ariaExpanded}"
        aria-flowto="${t=>t.ariaFlowto}"
        aria-haspopup="${t=>t.ariaHaspopup}"
        aria-hidden="${t=>t.ariaHidden}"
        aria-invalid="${t=>t.ariaInvalid}"
        aria-keyshortcuts="${t=>t.ariaKeyshortcuts}"
        aria-label="${t=>t.ariaLabel}"
        aria-labelledby="${t=>t.ariaLabelledby}"
        aria-live="${t=>t.ariaLive}"
        aria-owns="${t=>t.ariaOwns}"
        aria-pressed="${t=>t.ariaPressed}"
        aria-relevant="${t=>t.ariaRelevant}"
        aria-roledescription="${t=>t.ariaRoledescription}"
        ${K("control")}
    >
        ${bt(o,e)}
        <span class="content" part="content">
            <slot ${le("defaultSlottedContent")}></slot>
        </span>
        ${ft(o,e)}
    </button>
`,ni="form-associated-proxy",ii="ElementInternals",ri=ii in window&&"setFormValue"in window[ii].prototype,si=new WeakMap;function Qt(o){const e=class extends o{constructor(...t){super(...t),this.dirtyValue=!1,this.disabled=!1,this.proxyEventsToBlock=["change","click"],this.proxyInitialized=!1,this.required=!1,this.initialValue=this.initialValue||"",this.elementInternals||(this.formResetCallback=this.formResetCallback.bind(this))}static get formAssociated(){return ri}get validity(){return this.elementInternals?this.elementInternals.validity:this.proxy.validity}get form(){return this.elementInternals?this.elementInternals.form:this.proxy.form}get validationMessage(){return this.elementInternals?this.elementInternals.validationMessage:this.proxy.validationMessage}get willValidate(){return this.elementInternals?this.elementInternals.willValidate:this.proxy.willValidate}get labels(){if(this.elementInternals)return Object.freeze(Array.from(this.elementInternals.labels));if(this.proxy instanceof HTMLElement&&this.proxy.ownerDocument&&this.id){const t=this.proxy.labels,n=Array.from(this.proxy.getRootNode().querySelectorAll(`[for='${this.id}']`)),i=t?n.concat(Array.from(t)):n;return Object.freeze(i)}else return He}valueChanged(t,n){this.dirtyValue=!0,this.proxy instanceof HTMLElement&&(this.proxy.value=this.value),this.currentValue=this.value,this.setFormValue(this.value),this.validate()}currentValueChanged(){this.value=this.currentValue}initialValueChanged(t,n){this.dirtyValue||(this.value=this.initialValue,this.dirtyValue=!1)}disabledChanged(t,n){this.proxy instanceof HTMLElement&&(this.proxy.disabled=this.disabled),I.queueUpdate(()=>this.classList.toggle("disabled",this.disabled))}nameChanged(t,n){this.proxy instanceof HTMLElement&&(this.proxy.name=this.name)}requiredChanged(t,n){this.proxy instanceof HTMLElement&&(this.proxy.required=this.required),I.queueUpdate(()=>this.classList.toggle("required",this.required)),this.validate()}get elementInternals(){if(!ri)return null;let t=si.get(this);return t||(t=this.attachInternals(),si.set(this,t)),t}connectedCallback(){super.connectedCallback(),this.addEventListener("keypress",this._keypressHandler),this.value||(this.value=this.initialValue,this.dirtyValue=!1),this.elementInternals||(this.attachProxy(),this.form&&this.form.addEventListener("reset",this.formResetCallback))}disconnectedCallback(){this.proxyEventsToBlock.forEach(t=>this.proxy.removeEventListener(t,this.stopPropagation)),!this.elementInternals&&this.form&&this.form.removeEventListener("reset",this.formResetCallback)}checkValidity(){return this.elementInternals?this.elementInternals.checkValidity():this.proxy.checkValidity()}reportValidity(){return this.elementInternals?this.elementInternals.reportValidity():this.proxy.reportValidity()}setValidity(t,n,i){this.elementInternals?this.elementInternals.setValidity(t,n,i):typeof n=="string"&&this.proxy.setCustomValidity(n)}formDisabledCallback(t){this.disabled=t}formResetCallback(){this.value=this.initialValue,this.dirtyValue=!1}attachProxy(){var t;this.proxyInitialized||(this.proxyInitialized=!0,this.proxy.style.display="none",this.proxyEventsToBlock.forEach(n=>this.proxy.addEventListener(n,this.stopPropagation)),this.proxy.disabled=this.disabled,this.proxy.required=this.required,typeof this.name=="string"&&(this.proxy.name=this.name),typeof this.value=="string"&&(this.proxy.value=this.value),this.proxy.setAttribute("slot",ni),this.proxySlot=document.createElement("slot"),this.proxySlot.setAttribute("name",ni)),(t=this.shadowRoot)===null||t===void 0||t.appendChild(this.proxySlot),this.appendChild(this.proxy)}detachProxy(){var t;this.removeChild(this.proxy),(t=this.shadowRoot)===null||t===void 0||t.removeChild(this.proxySlot)}validate(){this.proxy instanceof HTMLElement&&this.setValidity(this.proxy.validity,this.proxy.validationMessage)}setFormValue(t,n){this.elementInternals&&this.elementInternals.setFormValue(t,n||t)}_keypressHandler(t){switch(t.key){case Ut:if(this.form instanceof HTMLFormElement){const n=this.form.querySelector("[type=submit]");n?.click()}break}}stopPropagation(t){t.stopPropagation()}};return f({mode:"boolean"})(e.prototype,"disabled"),f({mode:"fromView",attribute:"value"})(e.prototype,"initialValue"),f({attribute:"current-value"})(e.prototype,"currentValue"),f(e.prototype,"name"),f({mode:"boolean"})(e.prototype,"required"),g(e.prototype,"value"),e}function Ki(o){class e extends Qt(o){}class t extends e{constructor(...i){super(i),this.dirtyChecked=!1,this.checkedAttribute=!1,this.checked=!1,this.dirtyChecked=!1}checkedAttributeChanged(){this.defaultChecked=this.checkedAttribute}defaultCheckedChanged(){this.dirtyChecked||(this.checked=this.defaultChecked,this.dirtyChecked=!1)}checkedChanged(i,r){this.dirtyChecked||(this.dirtyChecked=!0),this.currentChecked=this.checked,this.updateForm(),this.proxy instanceof HTMLInputElement&&(this.proxy.checked=this.checked),i!==void 0&&this.$emit("change"),this.validate()}currentCheckedChanged(i,r){this.checked=this.currentChecked}updateForm(){const i=this.checked?this.value:null;this.setFormValue(i,i)}connectedCallback(){super.connectedCallback(),this.updateForm()}formResetCallback(){super.formResetCallback(),this.checked=!!this.checkedAttribute,this.dirtyChecked=!1}}return f({attribute:"checked",mode:"boolean"})(t.prototype,"checkedAttribute"),f({attribute:"current-checked",converter:Hi})(t.prototype,"currentChecked"),g(t.prototype,"defaultChecked"),g(t.prototype,"checked"),t}class wc extends _{}class kc extends Qt(wc){constructor(){super(...arguments),this.proxy=document.createElement("input")}}class pe extends kc{constructor(){super(...arguments),this.handleClick=e=>{var t;this.disabled&&((t=this.defaultSlottedContent)===null||t===void 0?void 0:t.length)<=1&&e.stopPropagation()},this.handleSubmission=()=>{if(!this.form)return;const e=this.proxy.isConnected;e||this.attachProxy(),typeof this.form.requestSubmit=="function"?this.form.requestSubmit(this.proxy):this.proxy.click(),e||this.detachProxy()},this.handleFormReset=()=>{var e;(e=this.form)===null||e===void 0||e.reset()},this.handleUnsupportedDelegatesFocus=()=>{var e;window.ShadowRoot&&!window.ShadowRoot.prototype.hasOwnProperty("delegatesFocus")&&((e=this.$fastController.definition.shadowOptions)===null||e===void 0?void 0:e.delegatesFocus)&&(this.focus=()=>{this.control.focus()})}}formactionChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formAction=this.formaction)}formenctypeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formEnctype=this.formenctype)}formmethodChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formMethod=this.formmethod)}formnovalidateChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formNoValidate=this.formnovalidate)}formtargetChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formTarget=this.formtarget)}typeChanged(e,t){this.proxy instanceof HTMLInputElement&&(this.proxy.type=this.type),t==="submit"&&this.addEventListener("click",this.handleSubmission),e==="submit"&&this.removeEventListener("click",this.handleSubmission),t==="reset"&&this.addEventListener("click",this.handleFormReset),e==="reset"&&this.removeEventListener("click",this.handleFormReset)}connectedCallback(){var e;super.connectedCallback(),this.proxy.setAttribute("type",this.type),this.handleUnsupportedDelegatesFocus();const t=Array.from((e=this.control)===null||e===void 0?void 0:e.children);t&&t.forEach(n=>{n.addEventListener("click",this.handleClick)})}disconnectedCallback(){var e;super.disconnectedCallback();const t=Array.from((e=this.control)===null||e===void 0?void 0:e.children);t&&t.forEach(n=>{n.removeEventListener("click",this.handleClick)})}}h([f({mode:"boolean"})],pe.prototype,"autofocus",void 0);h([f({attribute:"form"})],pe.prototype,"formId",void 0);h([f],pe.prototype,"formaction",void 0);h([f],pe.prototype,"formenctype",void 0);h([f],pe.prototype,"formmethod",void 0);h([f({mode:"boolean"})],pe.prototype,"formnovalidate",void 0);h([f],pe.prototype,"formtarget",void 0);h([f],pe.prototype,"type",void 0);h([g],pe.prototype,"defaultSlottedContent",void 0);class Io{}h([f({attribute:"aria-expanded"})],Io.prototype,"ariaExpanded",void 0);h([f({attribute:"aria-pressed"})],Io.prototype,"ariaPressed",void 0);ie(Io,F);ie(pe,ht,Io);var et;(function(o){o.none="none",o.default="default",o.sticky="sticky"})(et||(et={}));var ve;(function(o){o.default="default",o.columnHeader="columnheader",o.rowHeader="rowheader"})(ve||(ve={}));var Ne;(function(o){o.default="default",o.header="header",o.stickyHeader="sticky-header"})(Ne||(Ne={}));class Q extends _{constructor(){super(...arguments),this.rowType=Ne.default,this.rowData=null,this.columnDefinitions=null,this.isActiveRow=!1,this.cellsRepeatBehavior=null,this.cellsPlaceholder=null,this.focusColumnIndex=0,this.refocusOnLoad=!1,this.updateRowStyle=()=>{this.style.gridTemplateColumns=this.gridTemplateColumns}}gridTemplateColumnsChanged(){this.$fastController.isConnected&&this.updateRowStyle()}rowTypeChanged(){this.$fastController.isConnected&&this.updateItemTemplate()}rowDataChanged(){if(this.rowData!==null&&this.isActiveRow){this.refocusOnLoad=!0;return}}cellItemTemplateChanged(){this.updateItemTemplate()}headerCellItemTemplateChanged(){this.updateItemTemplate()}connectedCallback(){super.connectedCallback(),this.cellsRepeatBehavior===null&&(this.cellsPlaceholder=document.createComment(""),this.appendChild(this.cellsPlaceholder),this.updateItemTemplate(),this.cellsRepeatBehavior=new qi(e=>e.columnDefinitions,e=>e.activeCellItemTemplate,{positioning:!0}).createBehavior(this.cellsPlaceholder),this.$fastController.addBehaviors([this.cellsRepeatBehavior])),this.addEventListener("cell-focused",this.handleCellFocus),this.addEventListener(lt,this.handleFocusout),this.addEventListener(dt,this.handleKeydown),this.updateRowStyle(),this.refocusOnLoad&&(this.refocusOnLoad=!1,this.cellElements.length>this.focusColumnIndex&&this.cellElements[this.focusColumnIndex].focus())}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("cell-focused",this.handleCellFocus),this.removeEventListener(lt,this.handleFocusout),this.removeEventListener(dt,this.handleKeydown)}handleFocusout(e){this.contains(e.target)||(this.isActiveRow=!1,this.focusColumnIndex=0)}handleCellFocus(e){this.isActiveRow=!0,this.focusColumnIndex=this.cellElements.indexOf(e.target),this.$emit("row-focused",this)}handleKeydown(e){if(e.defaultPrevented)return;let t=0;switch(e.key){case Nt:t=Math.max(0,this.focusColumnIndex-1),this.cellElements[t].focus(),e.preventDefault();break;case Vt:t=Math.min(this.cellElements.length-1,this.focusColumnIndex+1),this.cellElements[t].focus(),e.preventDefault();break;case vt:e.ctrlKey||(this.cellElements[0].focus(),e.preventDefault());break;case mt:e.ctrlKey||(this.cellElements[this.cellElements.length-1].focus(),e.preventDefault());break}}updateItemTemplate(){this.activeCellItemTemplate=this.rowType===Ne.default&&this.cellItemTemplate!==void 0?this.cellItemTemplate:this.rowType===Ne.default&&this.cellItemTemplate===void 0?this.defaultCellItemTemplate:this.headerCellItemTemplate!==void 0?this.headerCellItemTemplate:this.defaultHeaderCellItemTemplate}}h([f({attribute:"grid-template-columns"})],Q.prototype,"gridTemplateColumns",void 0);h([f({attribute:"row-type"})],Q.prototype,"rowType",void 0);h([g],Q.prototype,"rowData",void 0);h([g],Q.prototype,"columnDefinitions",void 0);h([g],Q.prototype,"cellItemTemplate",void 0);h([g],Q.prototype,"headerCellItemTemplate",void 0);h([g],Q.prototype,"rowIndex",void 0);h([g],Q.prototype,"isActiveRow",void 0);h([g],Q.prototype,"activeCellItemTemplate",void 0);h([g],Q.prototype,"defaultCellItemTemplate",void 0);h([g],Q.prototype,"defaultHeaderCellItemTemplate",void 0);h([g],Q.prototype,"cellElements",void 0);function $c(o){const e=o.tagFor(Q);return B`
    <${e}
        :rowData="${t=>t}"
        :cellItemTemplate="${(t,n)=>n.parent.cellItemTemplate}"
        :headerCellItemTemplate="${(t,n)=>n.parent.headerCellItemTemplate}"
    ></${e}>
`}const Cc=(o,e)=>{const t=$c(o),n=o.tagFor(Q);return B`
        <template
            role="grid"
            tabindex="0"
            :rowElementTag="${()=>n}"
            :defaultRowItemTemplate="${t}"
            ${Gi({property:"rowElements",filter:mn("[role=row]")})}
        >
            <slot></slot>
        </template>
    `};class H extends _{constructor(){super(),this.noTabbing=!1,this.generateHeader=et.default,this.rowsData=[],this.columnDefinitions=null,this.focusRowIndex=0,this.focusColumnIndex=0,this.rowsPlaceholder=null,this.generatedHeader=null,this.isUpdatingFocus=!1,this.pendingFocusUpdate=!1,this.rowindexUpdateQueued=!1,this.columnDefinitionsStale=!0,this.generatedGridTemplateColumns="",this.focusOnCell=(e,t,n)=>{if(this.rowElements.length===0){this.focusRowIndex=0,this.focusColumnIndex=0;return}const i=Math.max(0,Math.min(this.rowElements.length-1,e)),s=this.rowElements[i].querySelectorAll('[role="cell"], [role="gridcell"], [role="columnheader"], [role="rowheader"]'),c=Math.max(0,Math.min(s.length-1,t)),a=s[c];n&&this.scrollHeight!==this.clientHeight&&(i<this.focusRowIndex&&this.scrollTop>0||i>this.focusRowIndex&&this.scrollTop<this.scrollHeight-this.clientHeight)&&a.scrollIntoView({block:"center",inline:"center"}),a.focus()},this.onChildListChange=(e,t)=>{e&&e.length&&(e.forEach(n=>{n.addedNodes.forEach(i=>{i.nodeType===1&&i.getAttribute("role")==="row"&&(i.columnDefinitions=this.columnDefinitions)})}),this.queueRowIndexUpdate())},this.queueRowIndexUpdate=()=>{this.rowindexUpdateQueued||(this.rowindexUpdateQueued=!0,I.queueUpdate(this.updateRowIndexes))},this.updateRowIndexes=()=>{let e=this.gridTemplateColumns;if(e===void 0){if(this.generatedGridTemplateColumns===""&&this.rowElements.length>0){const t=this.rowElements[0];this.generatedGridTemplateColumns=new Array(t.cellElements.length).fill("1fr").join(" ")}e=this.generatedGridTemplateColumns}this.rowElements.forEach((t,n)=>{const i=t;i.rowIndex=n,i.gridTemplateColumns=e,this.columnDefinitionsStale&&(i.columnDefinitions=this.columnDefinitions)}),this.rowindexUpdateQueued=!1,this.columnDefinitionsStale=!1}}static generateTemplateColumns(e){let t="";return e.forEach(n=>{t=`${t}${t===""?"":" "}1fr`}),t}noTabbingChanged(){this.$fastController.isConnected&&(this.noTabbing?this.setAttribute("tabIndex","-1"):this.setAttribute("tabIndex",this.contains(document.activeElement)||this===document.activeElement?"-1":"0"))}generateHeaderChanged(){this.$fastController.isConnected&&this.toggleGeneratedHeader()}gridTemplateColumnsChanged(){this.$fastController.isConnected&&this.updateRowIndexes()}rowsDataChanged(){this.columnDefinitions===null&&this.rowsData.length>0&&(this.columnDefinitions=H.generateColumns(this.rowsData[0])),this.$fastController.isConnected&&this.toggleGeneratedHeader()}columnDefinitionsChanged(){if(this.columnDefinitions===null){this.generatedGridTemplateColumns="";return}this.generatedGridTemplateColumns=H.generateTemplateColumns(this.columnDefinitions),this.$fastController.isConnected&&(this.columnDefinitionsStale=!0,this.queueRowIndexUpdate())}headerCellItemTemplateChanged(){this.$fastController.isConnected&&this.generatedHeader!==null&&(this.generatedHeader.headerCellItemTemplate=this.headerCellItemTemplate)}focusRowIndexChanged(){this.$fastController.isConnected&&this.queueFocusUpdate()}focusColumnIndexChanged(){this.$fastController.isConnected&&this.queueFocusUpdate()}connectedCallback(){super.connectedCallback(),this.rowItemTemplate===void 0&&(this.rowItemTemplate=this.defaultRowItemTemplate),this.rowsPlaceholder=document.createComment(""),this.appendChild(this.rowsPlaceholder),this.toggleGeneratedHeader(),this.rowsRepeatBehavior=new qi(e=>e.rowsData,e=>e.rowItemTemplate,{positioning:!0}).createBehavior(this.rowsPlaceholder),this.$fastController.addBehaviors([this.rowsRepeatBehavior]),this.addEventListener("row-focused",this.handleRowFocus),this.addEventListener(ei,this.handleFocus),this.addEventListener(dt,this.handleKeydown),this.addEventListener(lt,this.handleFocusOut),this.observer=new MutationObserver(this.onChildListChange),this.observer.observe(this,{childList:!0}),this.noTabbing&&this.setAttribute("tabindex","-1"),I.queueUpdate(this.queueRowIndexUpdate)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("row-focused",this.handleRowFocus),this.removeEventListener(ei,this.handleFocus),this.removeEventListener(dt,this.handleKeydown),this.removeEventListener(lt,this.handleFocusOut),this.observer.disconnect(),this.rowsPlaceholder=null,this.generatedHeader=null}handleRowFocus(e){this.isUpdatingFocus=!0;const t=e.target;this.focusRowIndex=this.rowElements.indexOf(t),this.focusColumnIndex=t.focusColumnIndex,this.setAttribute("tabIndex","-1"),this.isUpdatingFocus=!1}handleFocus(e){this.focusOnCell(this.focusRowIndex,this.focusColumnIndex,!0)}handleFocusOut(e){(e.relatedTarget===null||!this.contains(e.relatedTarget))&&this.setAttribute("tabIndex",this.noTabbing?"-1":"0")}handleKeydown(e){if(e.defaultPrevented)return;let t;const n=this.rowElements.length-1,i=this.offsetHeight+this.scrollTop,r=this.rowElements[n];switch(e.key){case gt:e.preventDefault(),this.focusOnCell(this.focusRowIndex-1,this.focusColumnIndex,!0);break;case pt:e.preventDefault(),this.focusOnCell(this.focusRowIndex+1,this.focusColumnIndex,!0);break;case pc:if(e.preventDefault(),this.rowElements.length===0){this.focusOnCell(0,0,!1);break}if(this.focusRowIndex===0){this.focusOnCell(0,this.focusColumnIndex,!1);return}for(t=this.focusRowIndex-1,t;t>=0;t--){const s=this.rowElements[t];if(s.offsetTop<this.scrollTop){this.scrollTop=s.offsetTop+s.clientHeight-this.clientHeight;break}}this.focusOnCell(t,this.focusColumnIndex,!1);break;case bc:if(e.preventDefault(),this.rowElements.length===0){this.focusOnCell(0,0,!1);break}if(this.focusRowIndex>=n||r.offsetTop+r.offsetHeight<=i){this.focusOnCell(n,this.focusColumnIndex,!1);return}for(t=this.focusRowIndex+1,t;t<=n;t++){const s=this.rowElements[t];if(s.offsetTop+s.offsetHeight>i){let c=0;this.generateHeader===et.sticky&&this.generatedHeader!==null&&(c=this.generatedHeader.clientHeight),this.scrollTop=s.offsetTop-c;break}}this.focusOnCell(t,this.focusColumnIndex,!1);break;case vt:e.ctrlKey&&(e.preventDefault(),this.focusOnCell(0,0,!0));break;case mt:e.ctrlKey&&this.columnDefinitions!==null&&(e.preventDefault(),this.focusOnCell(this.rowElements.length-1,this.columnDefinitions.length-1,!0));break}}queueFocusUpdate(){this.isUpdatingFocus&&(this.contains(document.activeElement)||this===document.activeElement)||this.pendingFocusUpdate===!1&&(this.pendingFocusUpdate=!0,I.queueUpdate(()=>this.updateFocus()))}updateFocus(){this.pendingFocusUpdate=!1,this.focusOnCell(this.focusRowIndex,this.focusColumnIndex,!0)}toggleGeneratedHeader(){if(this.generatedHeader!==null&&(this.removeChild(this.generatedHeader),this.generatedHeader=null),this.generateHeader!==et.none&&this.rowsData.length>0){const e=document.createElement(this.rowElementTag);this.generatedHeader=e,this.generatedHeader.columnDefinitions=this.columnDefinitions,this.generatedHeader.gridTemplateColumns=this.gridTemplateColumns,this.generatedHeader.rowType=this.generateHeader===et.sticky?Ne.stickyHeader:Ne.header,(this.firstChild!==null||this.rowsPlaceholder!==null)&&this.insertBefore(e,this.firstChild!==null?this.firstChild:this.rowsPlaceholder);return}}}H.generateColumns=o=>Object.getOwnPropertyNames(o).map((e,t)=>({columnDataKey:e,gridColumn:`${t}`}));h([f({attribute:"no-tabbing",mode:"boolean"})],H.prototype,"noTabbing",void 0);h([f({attribute:"generate-header"})],H.prototype,"generateHeader",void 0);h([f({attribute:"grid-template-columns"})],H.prototype,"gridTemplateColumns",void 0);h([g],H.prototype,"rowsData",void 0);h([g],H.prototype,"columnDefinitions",void 0);h([g],H.prototype,"rowItemTemplate",void 0);h([g],H.prototype,"cellItemTemplate",void 0);h([g],H.prototype,"headerCellItemTemplate",void 0);h([g],H.prototype,"focusRowIndex",void 0);h([g],H.prototype,"focusColumnIndex",void 0);h([g],H.prototype,"defaultRowItemTemplate",void 0);h([g],H.prototype,"rowElementTag",void 0);h([g],H.prototype,"rowElements",void 0);const Sc=B`
    <template>
        ${o=>o.rowData===null||o.columnDefinition===null||o.columnDefinition.columnDataKey===null?null:o.rowData[o.columnDefinition.columnDataKey]}
    </template>
`,Ic=B`
    <template>
        ${o=>o.columnDefinition===null?null:o.columnDefinition.title===void 0?o.columnDefinition.columnDataKey:o.columnDefinition.title}
    </template>
`;class Oe extends _{constructor(){super(...arguments),this.cellType=ve.default,this.rowData=null,this.columnDefinition=null,this.isActiveCell=!1,this.customCellView=null,this.updateCellStyle=()=>{this.style.gridColumn=this.gridColumn}}cellTypeChanged(){this.$fastController.isConnected&&this.updateCellView()}gridColumnChanged(){this.$fastController.isConnected&&this.updateCellStyle()}columnDefinitionChanged(e,t){this.$fastController.isConnected&&this.updateCellView()}connectedCallback(){var e;super.connectedCallback(),this.addEventListener(ti,this.handleFocusin),this.addEventListener(lt,this.handleFocusout),this.addEventListener(dt,this.handleKeydown),this.style.gridColumn=`${((e=this.columnDefinition)===null||e===void 0?void 0:e.gridColumn)===void 0?0:this.columnDefinition.gridColumn}`,this.updateCellView(),this.updateCellStyle()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(ti,this.handleFocusin),this.removeEventListener(lt,this.handleFocusout),this.removeEventListener(dt,this.handleKeydown),this.disconnectCellView()}handleFocusin(e){if(!this.isActiveCell){switch(this.isActiveCell=!0,this.cellType){case ve.columnHeader:if(this.columnDefinition!==null&&this.columnDefinition.headerCellInternalFocusQueue!==!0&&typeof this.columnDefinition.headerCellFocusTargetCallback=="function"){const t=this.columnDefinition.headerCellFocusTargetCallback(this);t!==null&&t.focus()}break;default:if(this.columnDefinition!==null&&this.columnDefinition.cellInternalFocusQueue!==!0&&typeof this.columnDefinition.cellFocusTargetCallback=="function"){const t=this.columnDefinition.cellFocusTargetCallback(this);t!==null&&t.focus()}break}this.$emit("cell-focused",this)}}handleFocusout(e){this!==document.activeElement&&!this.contains(document.activeElement)&&(this.isActiveCell=!1)}handleKeydown(e){if(!(e.defaultPrevented||this.columnDefinition===null||this.cellType===ve.default&&this.columnDefinition.cellInternalFocusQueue!==!0||this.cellType===ve.columnHeader&&this.columnDefinition.headerCellInternalFocusQueue!==!0))switch(e.key){case Ut:case fc:if(this.contains(document.activeElement)&&document.activeElement!==this)return;switch(this.cellType){case ve.columnHeader:if(this.columnDefinition.headerCellFocusTargetCallback!==void 0){const t=this.columnDefinition.headerCellFocusTargetCallback(this);t!==null&&t.focus(),e.preventDefault()}break;default:if(this.columnDefinition.cellFocusTargetCallback!==void 0){const t=this.columnDefinition.cellFocusTargetCallback(this);t!==null&&t.focus(),e.preventDefault()}break}break;case So:this.contains(document.activeElement)&&document.activeElement!==this&&(this.focus(),e.preventDefault());break}}updateCellView(){if(this.disconnectCellView(),this.columnDefinition!==null)switch(this.cellType){case ve.columnHeader:this.columnDefinition.headerCellTemplate!==void 0?this.customCellView=this.columnDefinition.headerCellTemplate.render(this,this):this.customCellView=Ic.render(this,this);break;case void 0:case ve.rowHeader:case ve.default:this.columnDefinition.cellTemplate!==void 0?this.customCellView=this.columnDefinition.cellTemplate.render(this,this):this.customCellView=Sc.render(this,this);break}}disconnectCellView(){this.customCellView!==null&&(this.customCellView.dispose(),this.customCellView=null)}}h([f({attribute:"cell-type"})],Oe.prototype,"cellType",void 0);h([f({attribute:"grid-column"})],Oe.prototype,"gridColumn",void 0);h([g],Oe.prototype,"rowData",void 0);h([g],Oe.prototype,"columnDefinition",void 0);function Tc(o){const e=o.tagFor(Oe);return B`
    <${e}
        cell-type="${t=>t.isRowHeader?"rowheader":void 0}"
        grid-column="${(t,n)=>n.index+1}"
        :rowData="${(t,n)=>n.parent.rowData}"
        :columnDefinition="${t=>t}"
    ></${e}>
`}function Bc(o){const e=o.tagFor(Oe);return B`
    <${e}
        cell-type="columnheader"
        grid-column="${(t,n)=>n.index+1}"
        :columnDefinition="${t=>t}"
    ></${e}>
`}const Ac=(o,e)=>{const t=Tc(o),n=Bc(o);return B`
        <template
            role="row"
            class="${i=>i.rowType!=="default"?i.rowType:""}"
            :defaultCellItemTemplate="${t}"
            :defaultHeaderCellItemTemplate="${n}"
            ${Gi({property:"cellElements",filter:mn('[role="cell"],[role="gridcell"],[role="columnheader"],[role="rowheader"]')})}
        >
            <slot ${le("slottedCellElements")}></slot>
        </template>
    `},Rc=(o,e)=>B`
        <template
            tabindex="-1"
            role="${t=>!t.cellType||t.cellType==="default"?"gridcell":t.cellType}"
            class="
            ${t=>t.cellType==="columnheader"?"column-header":t.cellType==="rowheader"?"row-header":""}
            "
        >
            <slot></slot>
        </template>
    `,Oc=(o,e)=>B`
    <template
        role="checkbox"
        aria-checked="${t=>t.checked}"
        aria-required="${t=>t.required}"
        aria-disabled="${t=>t.disabled}"
        aria-readonly="${t=>t.readOnly}"
        tabindex="${t=>t.disabled?null:0}"
        @keypress="${(t,n)=>t.keypressHandler(n.event)}"
        @click="${(t,n)=>t.clickHandler(n.event)}"
        class="${t=>t.readOnly?"readonly":""} ${t=>t.checked?"checked":""} ${t=>t.indeterminate?"indeterminate":""}"
    >
        <div part="control" class="control">
            <slot name="checked-indicator">
                ${e.checkedIndicator||""}
            </slot>
            <slot name="indeterminate-indicator">
                ${e.indeterminateIndicator||""}
            </slot>
        </div>
        <label
            part="label"
            class="${t=>t.defaultSlottedNodes&&t.defaultSlottedNodes.length?"label":"label label__hidden"}"
        >
            <slot ${le("defaultSlottedNodes")}></slot>
        </label>
    </template>
`;class _c extends _{}class Fc extends Ki(_c){constructor(){super(...arguments),this.proxy=document.createElement("input")}}class To extends Fc{constructor(){super(),this.initialValue="on",this.indeterminate=!1,this.keypressHandler=e=>{switch(e.key){case Gt:this.checked=!this.checked;break}},this.clickHandler=e=>{!this.disabled&&!this.readOnly&&(this.checked=!this.checked)},this.proxy.setAttribute("type","checkbox")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}}h([f({attribute:"readonly",mode:"boolean"})],To.prototype,"readOnly",void 0);h([g],To.prototype,"defaultSlottedNodes",void 0);h([g],To.prototype,"indeterminate",void 0);function er(o){return dc(o)&&(o.getAttribute("role")==="option"||o instanceof HTMLOptionElement)}class Se extends _{constructor(e,t,n,i){super(),this.defaultSelected=!1,this.dirtySelected=!1,this.selected=this.defaultSelected,this.dirtyValue=!1,e&&(this.textContent=e),t&&(this.initialValue=t),n&&(this.defaultSelected=n),i&&(this.selected=i),this.proxy=new Option(`${this.textContent}`,this.initialValue,this.defaultSelected,this.selected),this.proxy.disabled=this.disabled}checkedChanged(e,t){if(typeof t=="boolean"){this.ariaChecked=t?"true":"false";return}this.ariaChecked=null}contentChanged(e,t){this.proxy instanceof HTMLOptionElement&&(this.proxy.textContent=this.textContent),this.$emit("contentchange",null,{bubbles:!0})}defaultSelectedChanged(){this.dirtySelected||(this.selected=this.defaultSelected,this.proxy instanceof HTMLOptionElement&&(this.proxy.selected=this.defaultSelected))}disabledChanged(e,t){this.ariaDisabled=this.disabled?"true":"false",this.proxy instanceof HTMLOptionElement&&(this.proxy.disabled=this.disabled)}selectedAttributeChanged(){this.defaultSelected=this.selectedAttribute,this.proxy instanceof HTMLOptionElement&&(this.proxy.defaultSelected=this.defaultSelected)}selectedChanged(){this.ariaSelected=this.selected?"true":"false",this.dirtySelected||(this.dirtySelected=!0),this.proxy instanceof HTMLOptionElement&&(this.proxy.selected=this.selected)}initialValueChanged(e,t){this.dirtyValue||(this.value=this.initialValue,this.dirtyValue=!1)}get label(){var e;return(e=this.value)!==null&&e!==void 0?e:this.text}get text(){var e,t;return(t=(e=this.textContent)===null||e===void 0?void 0:e.replace(/\s+/g," ").trim())!==null&&t!==void 0?t:""}set value(e){const t=`${e??""}`;this._value=t,this.dirtyValue=!0,this.proxy instanceof HTMLOptionElement&&(this.proxy.value=t),S.notify(this,"value")}get value(){var e;return S.track(this,"value"),(e=this._value)!==null&&e!==void 0?e:this.text}get form(){return this.proxy?this.proxy.form:null}}h([g],Se.prototype,"checked",void 0);h([g],Se.prototype,"content",void 0);h([g],Se.prototype,"defaultSelected",void 0);h([f({mode:"boolean"})],Se.prototype,"disabled",void 0);h([f({attribute:"selected",mode:"boolean"})],Se.prototype,"selectedAttribute",void 0);h([g],Se.prototype,"selected",void 0);h([f({attribute:"value",mode:"fromView"})],Se.prototype,"initialValue",void 0);class yt{}h([g],yt.prototype,"ariaChecked",void 0);h([g],yt.prototype,"ariaPosInSet",void 0);h([g],yt.prototype,"ariaSelected",void 0);h([g],yt.prototype,"ariaSetSize",void 0);ie(yt,F);ie(Se,ht,yt);class Z extends _{constructor(){super(...arguments),this._options=[],this.selectedIndex=-1,this.selectedOptions=[],this.shouldSkipFocus=!1,this.typeaheadBuffer="",this.typeaheadExpired=!0,this.typeaheadTimeout=-1}get firstSelectedOption(){var e;return(e=this.selectedOptions[0])!==null&&e!==void 0?e:null}get hasSelectableOptions(){return this.options.length>0&&!this.options.every(e=>e.disabled)}get length(){var e,t;return(t=(e=this.options)===null||e===void 0?void 0:e.length)!==null&&t!==void 0?t:0}get options(){return S.track(this,"options"),this._options}set options(e){this._options=e,S.notify(this,"options")}get typeAheadExpired(){return this.typeaheadExpired}set typeAheadExpired(e){this.typeaheadExpired=e}clickHandler(e){const t=e.target.closest("option,[role=option]");if(t&&!t.disabled)return this.selectedIndex=this.options.indexOf(t),!0}focusAndScrollOptionIntoView(e=this.firstSelectedOption){this.contains(document.activeElement)&&e!==null&&(e.focus(),requestAnimationFrame(()=>{e.scrollIntoView({block:"nearest"})}))}focusinHandler(e){!this.shouldSkipFocus&&e.target===e.currentTarget&&(this.setSelectedOptions(),this.focusAndScrollOptionIntoView()),this.shouldSkipFocus=!1}getTypeaheadMatches(){const e=this.typeaheadBuffer.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&"),t=new RegExp(`^${e}`,"gi");return this.options.filter(n=>n.text.trim().match(t))}getSelectableIndex(e=this.selectedIndex,t){const n=e>t?-1:e<t?1:0,i=e+n;let r=null;switch(n){case-1:{r=this.options.reduceRight((s,c,a)=>!s&&!c.disabled&&a<i?c:s,r);break}case 1:{r=this.options.reduce((s,c,a)=>!s&&!c.disabled&&a>i?c:s,r);break}}return this.options.indexOf(r)}handleChange(e,t){switch(t){case"selected":{Z.slottedOptionFilter(e)&&(this.selectedIndex=this.options.indexOf(e)),this.setSelectedOptions();break}}}handleTypeAhead(e){this.typeaheadTimeout&&window.clearTimeout(this.typeaheadTimeout),this.typeaheadTimeout=window.setTimeout(()=>this.typeaheadExpired=!0,Z.TYPE_AHEAD_TIMEOUT_MS),!(e.length>1)&&(this.typeaheadBuffer=`${this.typeaheadExpired?"":this.typeaheadBuffer}${e}`)}keydownHandler(e){if(this.disabled)return!0;this.shouldSkipFocus=!1;const t=e.key;switch(t){case vt:{e.shiftKey||(e.preventDefault(),this.selectFirstOption());break}case pt:{e.shiftKey||(e.preventDefault(),this.selectNextOption());break}case gt:{e.shiftKey||(e.preventDefault(),this.selectPreviousOption());break}case mt:{e.preventDefault(),this.selectLastOption();break}case yn:return this.focusAndScrollOptionIntoView(),!0;case Ut:case So:return!0;case Gt:if(this.typeaheadExpired)return!0;default:return t.length===1&&this.handleTypeAhead(`${t}`),!0}}mousedownHandler(e){return this.shouldSkipFocus=!this.contains(document.activeElement),!0}multipleChanged(e,t){this.ariaMultiSelectable=t?"true":null}selectedIndexChanged(e,t){var n;if(!this.hasSelectableOptions){this.selectedIndex=-1;return}if(((n=this.options[this.selectedIndex])===null||n===void 0?void 0:n.disabled)&&typeof e=="number"){const i=this.getSelectableIndex(e,t),r=i>-1?i:e;this.selectedIndex=r,t===r&&this.selectedIndexChanged(t,r);return}this.setSelectedOptions()}selectedOptionsChanged(e,t){var n;const i=t.filter(Z.slottedOptionFilter);(n=this.options)===null||n===void 0||n.forEach(r=>{const s=S.getNotifier(r);s.unsubscribe(this,"selected"),r.selected=i.includes(r),s.subscribe(this,"selected")})}selectFirstOption(){var e,t;this.disabled||(this.selectedIndex=(t=(e=this.options)===null||e===void 0?void 0:e.findIndex(n=>!n.disabled))!==null&&t!==void 0?t:-1)}selectLastOption(){this.disabled||(this.selectedIndex=ac(this.options,e=>!e.disabled))}selectNextOption(){!this.disabled&&this.selectedIndex<this.options.length-1&&(this.selectedIndex+=1)}selectPreviousOption(){!this.disabled&&this.selectedIndex>0&&(this.selectedIndex=this.selectedIndex-1)}setDefaultSelectedOption(){var e,t;this.selectedIndex=(t=(e=this.options)===null||e===void 0?void 0:e.findIndex(n=>n.defaultSelected))!==null&&t!==void 0?t:-1}setSelectedOptions(){var e,t,n;!((e=this.options)===null||e===void 0)&&e.length&&(this.selectedOptions=[this.options[this.selectedIndex]],this.ariaActiveDescendant=(n=(t=this.firstSelectedOption)===null||t===void 0?void 0:t.id)!==null&&n!==void 0?n:"",this.focusAndScrollOptionIntoView())}slottedOptionsChanged(e,t){this.options=t.reduce((i,r)=>(er(r)&&i.push(r),i),[]);const n=`${this.options.length}`;this.options.forEach((i,r)=>{i.id||(i.id=bo("option-")),i.ariaPosInSet=`${r+1}`,i.ariaSetSize=n}),this.$fastController.isConnected&&(this.setSelectedOptions(),this.setDefaultSelectedOption())}typeaheadBufferChanged(e,t){if(this.$fastController.isConnected){const n=this.getTypeaheadMatches();if(n.length){const i=this.options.indexOf(n[0]);i>-1&&(this.selectedIndex=i)}this.typeaheadExpired=!1}}}Z.slottedOptionFilter=o=>er(o)&&!o.hidden;Z.TYPE_AHEAD_TIMEOUT_MS=1e3;h([f({mode:"boolean"})],Z.prototype,"disabled",void 0);h([g],Z.prototype,"selectedIndex",void 0);h([g],Z.prototype,"selectedOptions",void 0);h([g],Z.prototype,"slottedOptions",void 0);h([g],Z.prototype,"typeaheadBuffer",void 0);class Qe{}h([g],Qe.prototype,"ariaActiveDescendant",void 0);h([g],Qe.prototype,"ariaDisabled",void 0);h([g],Qe.prototype,"ariaExpanded",void 0);h([g],Qe.prototype,"ariaMultiSelectable",void 0);ie(Qe,F);ie(Z,Qe);var tt;(function(o){o.above="above",o.below="below"})(tt||(tt={}));function on(o){const e=o.parentElement;if(e)return e;{const t=o.getRootNode();if(t.host instanceof HTMLElement)return t.host}return null}function Ec(o,e){let t=e;for(;t!==null;){if(t===o)return!0;t=on(t)}return!1}const we=document.createElement("div");function Dc(o){return o instanceof Co}class wn{setProperty(e,t){I.queueUpdate(()=>this.target.setProperty(e,t))}removeProperty(e){I.queueUpdate(()=>this.target.removeProperty(e))}}class Pc extends wn{constructor(e){super();const t=new CSSStyleSheet;this.target=t.cssRules[t.insertRule(":host{}")].style,e.$fastController.addStyles(oe.create([t]))}}class Lc extends wn{constructor(){super();const e=new CSSStyleSheet;this.target=e.cssRules[e.insertRule(":root{}")].style,document.adoptedStyleSheets=[...document.adoptedStyleSheets,e]}}class Hc extends wn{constructor(){super(),this.style=document.createElement("style"),document.head.appendChild(this.style);const{sheet:e}=this.style;if(e){const t=e.insertRule(":root{}",e.cssRules.length);this.target=e.cssRules[t].style}}}class tr{constructor(e){this.store=new Map,this.target=null;const t=e.$fastController;this.style=document.createElement("style"),t.addStyles(this.style),S.getNotifier(t).subscribe(this,"isConnected"),this.handleChange(t,"isConnected")}targetChanged(){if(this.target!==null)for(const[e,t]of this.store.entries())this.target.setProperty(e,t)}setProperty(e,t){this.store.set(e,t),I.queueUpdate(()=>{this.target!==null&&this.target.setProperty(e,t)})}removeProperty(e){this.store.delete(e),I.queueUpdate(()=>{this.target!==null&&this.target.removeProperty(e)})}handleChange(e,t){const{sheet:n}=this.style;if(n){const i=n.insertRule(":host{}",n.cssRules.length);this.target=n.cssRules[i].style}else this.target=null}}h([g],tr.prototype,"target",void 0);class Nc{constructor(e){this.target=e.style}setProperty(e,t){I.queueUpdate(()=>this.target.setProperty(e,t))}removeProperty(e){I.queueUpdate(()=>this.target.removeProperty(e))}}class V{setProperty(e,t){V.properties[e]=t;for(const n of V.roots.values())ot.getOrCreate(V.normalizeRoot(n)).setProperty(e,t)}removeProperty(e){delete V.properties[e];for(const t of V.roots.values())ot.getOrCreate(V.normalizeRoot(t)).removeProperty(e)}static registerRoot(e){const{roots:t}=V;if(!t.has(e)){t.add(e);const n=ot.getOrCreate(this.normalizeRoot(e));for(const i in V.properties)n.setProperty(i,V.properties[i])}}static unregisterRoot(e){const{roots:t}=V;if(t.has(e)){t.delete(e);const n=ot.getOrCreate(V.normalizeRoot(e));for(const i in V.properties)n.removeProperty(i)}}static normalizeRoot(e){return e===we?document:e}}V.roots=new Set;V.properties={};const zo=new WeakMap,Vc=I.supportsAdoptedStyleSheets?Pc:tr,ot=Object.freeze({getOrCreate(o){if(zo.has(o))return zo.get(o);let e;return o===we?e=new V:o instanceof Document?e=I.supportsAdoptedStyleSheets?new Lc:new Hc:Dc(o)?e=new Vc(o):e=new Nc(o),zo.set(o,e),e}});class Y extends Vi{constructor(e){super(),this.subscribers=new WeakMap,this._appliedTo=new Set,this.name=e.name,e.cssCustomPropertyName!==null&&(this.cssCustomProperty=`--${e.cssCustomPropertyName}`,this.cssVar=`var(${this.cssCustomProperty})`),this.id=Y.uniqueId(),Y.tokensById.set(this.id,this)}get appliedTo(){return[...this._appliedTo]}static from(e){return new Y({name:typeof e=="string"?e:e.name,cssCustomPropertyName:typeof e=="string"?e:e.cssCustomPropertyName===void 0?e.name:e.cssCustomPropertyName})}static isCSSDesignToken(e){return typeof e.cssCustomProperty=="string"}static isDerivedDesignTokenValue(e){return typeof e=="function"}static getTokenById(e){return Y.tokensById.get(e)}getOrCreateSubscriberSet(e=this){return this.subscribers.get(e)||this.subscribers.set(e,new Set)&&this.subscribers.get(e)}createCSS(){return this.cssVar||""}getValueFor(e){const t=P.getOrCreate(e).get(this);if(t!==void 0)return t;throw new Error(`Value could not be retrieved for token named "${this.name}". Ensure the value is set for ${e} or an ancestor of ${e}.`)}setValueFor(e,t){return this._appliedTo.add(e),t instanceof Y&&(t=this.alias(t)),P.getOrCreate(e).set(this,t),this}deleteValueFor(e){return this._appliedTo.delete(e),P.existsFor(e)&&P.getOrCreate(e).delete(this),this}withDefault(e){return this.setValueFor(we,e),this}subscribe(e,t){const n=this.getOrCreateSubscriberSet(t);t&&!P.existsFor(t)&&P.getOrCreate(t),n.has(e)||n.add(e)}unsubscribe(e,t){const n=this.subscribers.get(t||this);n&&n.has(e)&&n.delete(e)}notify(e){const t=Object.freeze({token:this,target:e});this.subscribers.has(this)&&this.subscribers.get(this).forEach(n=>n.handleChange(t)),this.subscribers.has(e)&&this.subscribers.get(e).forEach(n=>n.handleChange(t))}alias(e){return t=>e.getValueFor(t)}}Y.uniqueId=(()=>{let o=0;return()=>(o++,o.toString(16))})();Y.tokensById=new Map;class Mc{startReflection(e,t){e.subscribe(this,t),this.handleChange({token:e,target:t})}stopReflection(e,t){e.unsubscribe(this,t),this.remove(e,t)}handleChange(e){const{token:t,target:n}=e;this.add(t,n)}add(e,t){ot.getOrCreate(t).setProperty(e.cssCustomProperty,this.resolveCSSValue(P.getOrCreate(t).get(e)))}remove(e,t){ot.getOrCreate(t).removeProperty(e.cssCustomProperty)}resolveCSSValue(e){return e&&typeof e.createCSS=="function"?e.createCSS():e}}class zc{constructor(e,t,n){this.source=e,this.token=t,this.node=n,this.dependencies=new Set,this.observer=S.binding(e,this,!1),this.observer.handleChange=this.observer.call,this.handleChange()}disconnect(){this.observer.disconnect()}handleChange(){this.node.store.set(this.token,this.observer.observe(this.node.target,Rt))}}class jc{constructor(){this.values=new Map}set(e,t){this.values.get(e)!==t&&(this.values.set(e,t),S.getNotifier(this).notify(e.id))}get(e){return S.track(this,e.id),this.values.get(e)}delete(e){this.values.delete(e)}all(){return this.values.entries()}}const $t=new WeakMap,Ct=new WeakMap;class P{constructor(e){this.target=e,this.store=new jc,this.children=[],this.assignedValues=new Map,this.reflecting=new Set,this.bindingObservers=new Map,this.tokenValueChangeHandler={handleChange:(t,n)=>{const i=Y.getTokenById(n);if(i&&(i.notify(this.target),Y.isCSSDesignToken(i))){const r=this.parent,s=this.isReflecting(i);if(r){const c=r.get(i),a=t.get(i);c!==a&&!s?this.reflectToCSS(i):c===a&&s&&this.stopReflectToCSS(i)}else s||this.reflectToCSS(i)}}},$t.set(e,this),S.getNotifier(this.store).subscribe(this.tokenValueChangeHandler),e instanceof Co?e.$fastController.addBehaviors([this]):e.isConnected&&this.bind()}static getOrCreate(e){return $t.get(e)||new P(e)}static existsFor(e){return $t.has(e)}static findParent(e){if(we!==e.target){let t=on(e.target);for(;t!==null;){if($t.has(t))return $t.get(t);t=on(t)}return P.getOrCreate(we)}return null}static findClosestAssignedNode(e,t){let n=t;do{if(n.has(e))return n;n=n.parent?n.parent:n.target!==we?P.getOrCreate(we):null}while(n!==null);return null}get parent(){return Ct.get(this)||null}has(e){return this.assignedValues.has(e)}get(e){const t=this.store.get(e);if(t!==void 0)return t;const n=this.getRaw(e);if(n!==void 0)return this.hydrate(e,n),this.get(e)}getRaw(e){var t;return this.assignedValues.has(e)?this.assignedValues.get(e):(t=P.findClosestAssignedNode(e,this))===null||t===void 0?void 0:t.getRaw(e)}set(e,t){Y.isDerivedDesignTokenValue(this.assignedValues.get(e))&&this.tearDownBindingObserver(e),this.assignedValues.set(e,t),Y.isDerivedDesignTokenValue(t)?this.setupBindingObserver(e,t):this.store.set(e,t)}delete(e){this.assignedValues.delete(e),this.tearDownBindingObserver(e);const t=this.getRaw(e);t?this.hydrate(e,t):this.store.delete(e)}bind(){const e=P.findParent(this);e&&e.appendChild(this);for(const t of this.assignedValues.keys())t.notify(this.target)}unbind(){this.parent&&Ct.get(this).removeChild(this)}appendChild(e){e.parent&&Ct.get(e).removeChild(e);const t=this.children.filter(n=>e.contains(n));Ct.set(e,this),this.children.push(e),t.forEach(n=>e.appendChild(n)),S.getNotifier(this.store).subscribe(e);for(const[n,i]of this.store.all())e.hydrate(n,this.bindingObservers.has(n)?this.getRaw(n):i)}removeChild(e){const t=this.children.indexOf(e);return t!==-1&&this.children.splice(t,1),S.getNotifier(this.store).unsubscribe(e),e.parent===this?Ct.delete(e):!1}contains(e){return Ec(this.target,e.target)}reflectToCSS(e){this.isReflecting(e)||(this.reflecting.add(e),P.cssCustomPropertyReflector.startReflection(e,this.target))}stopReflectToCSS(e){this.isReflecting(e)&&(this.reflecting.delete(e),P.cssCustomPropertyReflector.stopReflection(e,this.target))}isReflecting(e){return this.reflecting.has(e)}handleChange(e,t){const n=Y.getTokenById(t);!n||this.hydrate(n,this.getRaw(n))}hydrate(e,t){if(!this.has(e)){const n=this.bindingObservers.get(e);Y.isDerivedDesignTokenValue(t)?n?n.source!==t&&(this.tearDownBindingObserver(e),this.setupBindingObserver(e,t)):this.setupBindingObserver(e,t):(n&&this.tearDownBindingObserver(e),this.store.set(e,t))}}setupBindingObserver(e,t){const n=new zc(t,e,this);return this.bindingObservers.set(e,n),n}tearDownBindingObserver(e){return this.bindingObservers.has(e)?(this.bindingObservers.get(e).disconnect(),this.bindingObservers.delete(e),!0):!1}}P.cssCustomPropertyReflector=new Mc;h([g],P.prototype,"children",void 0);function qc(o){return Y.from(o)}const or=Object.freeze({create:qc,notifyConnection(o){return!o.isConnected||!P.existsFor(o)?!1:(P.getOrCreate(o).bind(),!0)},notifyDisconnection(o){return o.isConnected||!P.existsFor(o)?!1:(P.getOrCreate(o).unbind(),!0)},registerRoot(o=we){V.registerRoot(o)},unregisterRoot(o=we){V.unregisterRoot(o)}}),jo=Object.freeze({definitionCallbackOnly:null,ignoreDuplicate:Symbol()}),qo=new Map,ro=new Map;let it=null;const St=E.createInterface(o=>o.cachedCallback(e=>(it===null&&(it=new ir(null,e)),it))),nr=Object.freeze({tagFor(o){return ro.get(o)},responsibleFor(o){const e=o.$$designSystem$$;return e||E.findResponsibleContainer(o).get(St)},getOrCreate(o){if(!o)return it===null&&(it=E.getOrCreateDOMContainer().get(St)),it;const e=o.$$designSystem$$;if(e)return e;const t=E.getOrCreateDOMContainer(o);if(t.has(St,!1))return t.get(St);{const n=new ir(o,t);return t.register(Lt.instance(St,n)),n}}});function Uc(o,e,t){return typeof o=="string"?{name:o,type:e,callback:t}:o}class ir{constructor(e,t){this.owner=e,this.container=t,this.designTokensInitialized=!1,this.prefix="fast",this.shadowRootMode=void 0,this.disambiguate=()=>jo.definitionCallbackOnly,e!==null&&(e.$$designSystem$$=this)}withPrefix(e){return this.prefix=e,this}withShadowRootMode(e){return this.shadowRootMode=e,this}withElementDisambiguation(e){return this.disambiguate=e,this}withDesignTokenRoot(e){return this.designTokenRoot=e,this}register(...e){const t=this.container,n=[],i=this.disambiguate,r=this.shadowRootMode,s={elementPrefix:this.prefix,tryDefineElement(c,a,l){const d=Uc(c,a,l),{name:u,callback:b,baseClass:m}=d;let{type:k}=d,A=u,N=qo.get(A),ge=!0;for(;N;){const U=i(A,k,N);switch(U){case jo.ignoreDuplicate:return;case jo.definitionCallbackOnly:ge=!1,N=void 0;break;default:A=U,N=qo.get(A);break}}ge&&((ro.has(k)||k===_)&&(k=class extends k{}),qo.set(A,k),ro.set(k,A),m&&ro.set(m,A)),n.push(new Gc(t,A,k,r,b,ge))}};this.designTokensInitialized||(this.designTokensInitialized=!0,this.designTokenRoot!==null&&or.registerRoot(this.designTokenRoot)),t.registerWithContext(s,...e);for(const c of n)c.callback(c),c.willDefine&&c.definition!==null&&c.definition.define();return this}}class Gc{constructor(e,t,n,i,r,s){this.container=e,this.name=t,this.type=n,this.shadowRootMode=i,this.callback=r,this.willDefine=s,this.definition=null}definePresentation(e){Yi.define(this.name,e,this.container)}defineElement(e){this.definition=new $o(this.type,Object.assign(Object.assign({},e),{name:this.name}))}tagFor(e){return nr.tagFor(e)}}const Wc=(o,e)=>B`
    <template role="${t=>t.role}" aria-orientation="${t=>t.orientation}"></template>
`;var nn;(function(o){o.separator="separator",o.presentation="presentation"})(nn||(nn={}));class kn extends _{constructor(){super(...arguments),this.role=nn.separator,this.orientation=Ht.horizontal}}h([f],kn.prototype,"role",void 0);h([f],kn.prototype,"orientation",void 0);const Qc=(o,e)=>B`
    <template
        aria-checked="${t=>t.ariaChecked}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-posinset="${t=>t.ariaPosInSet}"
        aria-selected="${t=>t.ariaSelected}"
        aria-setsize="${t=>t.ariaSetSize}"
        class="${t=>[t.checked&&"checked",t.selected&&"selected",t.disabled&&"disabled"].filter(Boolean).join(" ")}"
        role="option"
    >
        ${bt(o,e)}
        <span class="content" part="content">
            <slot ${le("content")}></slot>
        </span>
        ${ft(o,e)}
    </template>
`;class Bo extends Z{constructor(){super(...arguments),this.activeIndex=-1,this.rangeStartIndex=-1}get activeOption(){return this.options[this.activeIndex]}get checkedOptions(){var e;return(e=this.options)===null||e===void 0?void 0:e.filter(t=>t.checked)}get firstSelectedOptionIndex(){return this.options.indexOf(this.firstSelectedOption)}activeIndexChanged(e,t){var n,i;this.ariaActiveDescendant=(i=(n=this.options[t])===null||n===void 0?void 0:n.id)!==null&&i!==void 0?i:"",this.focusAndScrollOptionIntoView()}checkActiveIndex(){if(!this.multiple)return;const e=this.activeOption;e&&(e.checked=!0)}checkFirstOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex+1),this.options.forEach((t,n)=>{t.checked=Kt(n,this.rangeStartIndex)})):this.uncheckAllOptions(),this.activeIndex=0,this.checkActiveIndex()}checkLastOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.options.forEach((t,n)=>{t.checked=Kt(n,this.rangeStartIndex,this.options.length)})):this.uncheckAllOptions(),this.activeIndex=this.options.length-1,this.checkActiveIndex()}connectedCallback(){super.connectedCallback(),this.addEventListener("focusout",this.focusoutHandler)}disconnectedCallback(){this.removeEventListener("focusout",this.focusoutHandler),super.disconnectedCallback()}checkNextOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.options.forEach((t,n)=>{t.checked=Kt(n,this.rangeStartIndex,this.activeIndex+1)})):this.uncheckAllOptions(),this.activeIndex+=this.activeIndex<this.options.length-1?1:0,this.checkActiveIndex()}checkPreviousOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.checkedOptions.length===1&&(this.rangeStartIndex+=1),this.options.forEach((t,n)=>{t.checked=Kt(n,this.activeIndex,this.rangeStartIndex)})):this.uncheckAllOptions(),this.activeIndex-=this.activeIndex>0?1:0,this.checkActiveIndex()}clickHandler(e){var t;if(!this.multiple)return super.clickHandler(e);const n=(t=e.target)===null||t===void 0?void 0:t.closest("[role=option]");if(!(!n||n.disabled))return this.uncheckAllOptions(),this.activeIndex=this.options.indexOf(n),this.checkActiveIndex(),this.toggleSelectedForAllCheckedOptions(),!0}focusAndScrollOptionIntoView(){super.focusAndScrollOptionIntoView(this.activeOption)}focusinHandler(e){if(!this.multiple)return super.focusinHandler(e);!this.shouldSkipFocus&&e.target===e.currentTarget&&(this.uncheckAllOptions(),this.activeIndex===-1&&(this.activeIndex=this.firstSelectedOptionIndex!==-1?this.firstSelectedOptionIndex:0),this.checkActiveIndex(),this.setSelectedOptions(),this.focusAndScrollOptionIntoView()),this.shouldSkipFocus=!1}focusoutHandler(e){this.multiple&&this.uncheckAllOptions()}keydownHandler(e){if(!this.multiple)return super.keydownHandler(e);if(this.disabled)return!0;const{key:t,shiftKey:n}=e;switch(this.shouldSkipFocus=!1,t){case vt:{this.checkFirstOption(n);return}case pt:{this.checkNextOption(n);return}case gt:{this.checkPreviousOption(n);return}case mt:{this.checkLastOption(n);return}case yn:return this.focusAndScrollOptionIntoView(),!0;case So:return this.uncheckAllOptions(),this.checkActiveIndex(),!0;case Gt:if(e.preventDefault(),this.typeAheadExpired){this.toggleSelectedForAllCheckedOptions();return}default:return t.length===1&&this.handleTypeAhead(`${t}`),!0}}mousedownHandler(e){if(e.offsetX>=0&&e.offsetX<=this.scrollWidth)return super.mousedownHandler(e)}multipleChanged(e,t){var n;this.ariaMultiSelectable=t?"true":null,(n=this.options)===null||n===void 0||n.forEach(i=>{i.checked=t?!1:void 0}),this.setSelectedOptions()}setSelectedOptions(){if(!this.multiple){super.setSelectedOptions();return}this.$fastController.isConnected&&this.options&&(this.selectedOptions=this.options.filter(e=>e.selected),this.focusAndScrollOptionIntoView())}sizeChanged(e,t){var n;const i=Math.max(0,parseInt((n=t?.toFixed())!==null&&n!==void 0?n:"",10));i!==t&&I.queueUpdate(()=>{this.size=i})}toggleSelectedForAllCheckedOptions(){const e=this.checkedOptions.filter(n=>!n.disabled),t=!e.every(n=>n.selected);e.forEach(n=>n.selected=t),this.selectedIndex=this.options.indexOf(e[e.length-1]),this.setSelectedOptions()}typeaheadBufferChanged(e,t){if(!this.multiple){super.typeaheadBufferChanged(e,t);return}if(this.$fastController.isConnected){const n=this.getTypeaheadMatches(),i=this.options.indexOf(n[0]);i>-1&&(this.activeIndex=i,this.uncheckAllOptions(),this.checkActiveIndex()),this.typeAheadExpired=!1}}uncheckAllOptions(e=!1){this.options.forEach(t=>t.checked=this.multiple?!1:void 0),e||(this.rangeStartIndex=-1)}}h([g],Bo.prototype,"activeIndex",void 0);h([f({mode:"boolean"})],Bo.prototype,"multiple",void 0);h([f({converter:fe})],Bo.prototype,"size",void 0);class Xc extends _{}class Yc extends Qt(Xc){constructor(){super(...arguments),this.proxy=document.createElement("input")}}var rn;(function(o){o.email="email",o.password="password",o.tel="tel",o.text="text",o.url="url"})(rn||(rn={}));class se extends Yc{constructor(){super(...arguments),this.type=rn.text}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly,this.validate())}autofocusChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.autofocus=this.autofocus,this.validate())}placeholderChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.placeholder=this.placeholder)}typeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.type=this.type,this.validate())}listChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.setAttribute("list",this.list),this.validate())}maxlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.maxLength=this.maxlength,this.validate())}minlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.minLength=this.minlength,this.validate())}patternChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.pattern=this.pattern,this.validate())}sizeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.size=this.size)}spellcheckChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.spellcheck=this.spellcheck)}connectedCallback(){super.connectedCallback(),this.proxy.setAttribute("type",this.type),this.validate(),this.autofocus&&I.queueUpdate(()=>{this.focus()})}select(){this.control.select(),this.$emit("select")}handleTextInput(){this.value=this.control.value}handleChange(){this.$emit("change")}}h([f({attribute:"readonly",mode:"boolean"})],se.prototype,"readOnly",void 0);h([f({mode:"boolean"})],se.prototype,"autofocus",void 0);h([f],se.prototype,"placeholder",void 0);h([f],se.prototype,"type",void 0);h([f],se.prototype,"list",void 0);h([f({converter:fe})],se.prototype,"maxlength",void 0);h([f({converter:fe})],se.prototype,"minlength",void 0);h([f],se.prototype,"pattern",void 0);h([f({converter:fe})],se.prototype,"size",void 0);h([f({mode:"boolean"})],se.prototype,"spellcheck",void 0);h([g],se.prototype,"defaultSlottedNodes",void 0);class $n{}ie($n,F);ie(se,ht,$n);const ci=44,Jc=(o,e)=>B`
    <template
        role="progressbar"
        aria-valuenow="${t=>t.value}"
        aria-valuemin="${t=>t.min}"
        aria-valuemax="${t=>t.max}"
        class="${t=>t.paused?"paused":""}"
    >
        ${fo(t=>typeof t.value=="number",B`
                <svg
                    class="progress"
                    part="progress"
                    viewBox="0 0 16 16"
                    slot="determinate"
                >
                    <circle
                        class="background"
                        part="background"
                        cx="8px"
                        cy="8px"
                        r="7px"
                    ></circle>
                    <circle
                        class="determinate"
                        part="determinate"
                        style="stroke-dasharray: ${t=>ci*t.percentComplete/100}px ${ci}px"
                        cx="8px"
                        cy="8px"
                        r="7px"
                    ></circle>
                </svg>
            `)}
        ${fo(t=>typeof t.value!="number",B`
                <slot name="indeterminate" slot="indeterminate">
                    ${e.indeterminateIndicator||""}
                </slot>
            `)}
    </template>
`;class xt extends _{constructor(){super(...arguments),this.percentComplete=0}valueChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}minChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}maxChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}connectedCallback(){super.connectedCallback(),this.updatePercentComplete()}updatePercentComplete(){const e=typeof this.min=="number"?this.min:0,t=typeof this.max=="number"?this.max:100,n=typeof this.value=="number"?this.value:0,i=t-e;this.percentComplete=i===0?0:Math.fround((n-e)/i*100)}}h([f({converter:fe})],xt.prototype,"value",void 0);h([f({converter:fe})],xt.prototype,"min",void 0);h([f({converter:fe})],xt.prototype,"max",void 0);h([f({mode:"boolean"})],xt.prototype,"paused",void 0);h([g],xt.prototype,"percentComplete",void 0);const Zc=(o,e)=>B`
    <template
        role="radiogroup"
        aria-disabled="${t=>t.disabled}"
        aria-readonly="${t=>t.readOnly}"
        @click="${(t,n)=>t.clickHandler(n.event)}"
        @keydown="${(t,n)=>t.keydownHandler(n.event)}"
        @focusout="${(t,n)=>t.focusOutHandler(n.event)}"
    >
        <slot name="label"></slot>
        <div
            class="positioning-region ${t=>t.orientation===Ht.horizontal?"horizontal":"vertical"}"
            part="positioning-region"
        >
            <slot
                ${le({property:"slottedRadioButtons",filter:mn("[role=radio]")})}
            ></slot>
        </div>
    </template>
`;class _e extends _{constructor(){super(...arguments),this.orientation=Ht.horizontal,this.radioChangeHandler=e=>{const t=e.target;t.checked&&(this.slottedRadioButtons.forEach(n=>{n!==t&&(n.checked=!1,this.isInsideFoundationToolbar||n.setAttribute("tabindex","-1"))}),this.selectedRadio=t,this.value=t.value,t.setAttribute("tabindex","0"),this.focusedRadio=t),e.stopPropagation()},this.moveToRadioByIndex=(e,t)=>{const n=e[t];this.isInsideToolbar||(n.setAttribute("tabindex","0"),n.readOnly?this.slottedRadioButtons.forEach(i=>{i!==n&&i.setAttribute("tabindex","-1")}):(n.checked=!0,this.selectedRadio=n)),this.focusedRadio=n,n.focus()},this.moveRightOffGroup=()=>{var e;(e=this.nextElementSibling)===null||e===void 0||e.focus()},this.moveLeftOffGroup=()=>{var e;(e=this.previousElementSibling)===null||e===void 0||e.focus()},this.focusOutHandler=e=>{const t=this.slottedRadioButtons,n=e.target,i=n!==null?t.indexOf(n):0,r=this.focusedRadio?t.indexOf(this.focusedRadio):-1;return(r===0&&i===r||r===t.length-1&&r===i)&&(this.selectedRadio?(this.focusedRadio=this.selectedRadio,this.isInsideFoundationToolbar||(this.selectedRadio.setAttribute("tabindex","0"),t.forEach(s=>{s!==this.selectedRadio&&s.setAttribute("tabindex","-1")}))):(this.focusedRadio=t[0],this.focusedRadio.setAttribute("tabindex","0"),t.forEach(s=>{s!==this.focusedRadio&&s.setAttribute("tabindex","-1")}))),!0},this.clickHandler=e=>{const t=e.target;if(t){const n=this.slottedRadioButtons;t.checked||n.indexOf(t)===0?(t.setAttribute("tabindex","0"),this.selectedRadio=t):(t.setAttribute("tabindex","-1"),this.selectedRadio=null),this.focusedRadio=t}e.preventDefault()},this.shouldMoveOffGroupToTheRight=(e,t,n)=>e===t.length&&this.isInsideToolbar&&n===Vt,this.shouldMoveOffGroupToTheLeft=(e,t)=>(this.focusedRadio?e.indexOf(this.focusedRadio)-1:0)<0&&this.isInsideToolbar&&t===Nt,this.checkFocusedRadio=()=>{this.focusedRadio!==null&&!this.focusedRadio.readOnly&&!this.focusedRadio.checked&&(this.focusedRadio.checked=!0,this.focusedRadio.setAttribute("tabindex","0"),this.focusedRadio.focus(),this.selectedRadio=this.focusedRadio)},this.moveRight=e=>{const t=this.slottedRadioButtons;let n=0;if(n=this.focusedRadio?t.indexOf(this.focusedRadio)+1:1,this.shouldMoveOffGroupToTheRight(n,t,e.key)){this.moveRightOffGroup();return}else n===t.length&&(n=0);for(;n<t.length&&t.length>1;)if(t[n].disabled){if(this.focusedRadio&&n===t.indexOf(this.focusedRadio))break;if(n+1>=t.length){if(this.isInsideToolbar)break;n=0}else n+=1}else{this.moveToRadioByIndex(t,n);break}},this.moveLeft=e=>{const t=this.slottedRadioButtons;let n=0;if(n=this.focusedRadio?t.indexOf(this.focusedRadio)-1:0,n=n<0?t.length-1:n,this.shouldMoveOffGroupToTheLeft(t,e.key)){this.moveLeftOffGroup();return}for(;n>=0&&t.length>1;)if(t[n].disabled){if(this.focusedRadio&&n===t.indexOf(this.focusedRadio))break;n-1<0?n=t.length-1:n-=1}else{this.moveToRadioByIndex(t,n);break}},this.keydownHandler=e=>{const t=e.key;if(t in Ji&&this.isInsideFoundationToolbar)return!0;switch(t){case Ut:{this.checkFocusedRadio();break}case Vt:case pt:{this.direction===ut.ltr?this.moveRight(e):this.moveLeft(e);break}case Nt:case gt:{this.direction===ut.ltr?this.moveLeft(e):this.moveRight(e);break}default:return!0}}}readOnlyChanged(){this.slottedRadioButtons!==void 0&&this.slottedRadioButtons.forEach(e=>{this.readOnly?e.readOnly=!0:e.readOnly=!1})}disabledChanged(){this.slottedRadioButtons!==void 0&&this.slottedRadioButtons.forEach(e=>{this.disabled?e.disabled=!0:e.disabled=!1})}nameChanged(){this.slottedRadioButtons&&this.slottedRadioButtons.forEach(e=>{e.setAttribute("name",this.name)})}valueChanged(){this.slottedRadioButtons&&this.slottedRadioButtons.forEach(e=>{e.getAttribute("value")===this.value&&(e.checked=!0,this.selectedRadio=e)}),this.$emit("change")}slottedRadioButtonsChanged(e,t){this.slottedRadioButtons&&this.slottedRadioButtons.length>0&&this.setupRadioButtons()}get parentToolbar(){return this.closest('[role="toolbar"]')}get isInsideToolbar(){var e;return(e=this.parentToolbar)!==null&&e!==void 0?e:!1}get isInsideFoundationToolbar(){var e;return!!(!((e=this.parentToolbar)===null||e===void 0)&&e.$fastController)}connectedCallback(){super.connectedCallback(),this.direction=yc(this),this.setupRadioButtons()}disconnectedCallback(){this.slottedRadioButtons.forEach(e=>{e.removeEventListener("change",this.radioChangeHandler)})}setupRadioButtons(){const e=this.slottedRadioButtons.filter(i=>i.hasAttribute("checked")),t=e?e.length:0;if(t>1){const i=e[t-1];i.checked=!0}let n=!1;if(this.slottedRadioButtons.forEach(i=>{this.name!==void 0&&i.setAttribute("name",this.name),this.disabled&&(i.disabled=!0),this.readOnly&&(i.readOnly=!0),this.value&&this.value===i.value?(this.selectedRadio=i,this.focusedRadio=i,i.checked=!0,i.setAttribute("tabindex","0"),n=!0):(this.isInsideFoundationToolbar||i.setAttribute("tabindex","-1"),i.checked=!1),i.addEventListener("change",this.radioChangeHandler)}),this.value===void 0&&this.slottedRadioButtons.length>0){const i=this.slottedRadioButtons.filter(s=>s.hasAttribute("checked")),r=i!==null?i.length:0;if(r>0&&!n){const s=i[r-1];s.checked=!0,this.focusedRadio=s,s.setAttribute("tabindex","0")}else this.slottedRadioButtons[0].setAttribute("tabindex","0"),this.focusedRadio=this.slottedRadioButtons[0]}}}h([f({attribute:"readonly",mode:"boolean"})],_e.prototype,"readOnly",void 0);h([f({attribute:"disabled",mode:"boolean"})],_e.prototype,"disabled",void 0);h([f],_e.prototype,"name",void 0);h([f],_e.prototype,"value",void 0);h([f],_e.prototype,"orientation",void 0);h([g],_e.prototype,"childItems",void 0);h([g],_e.prototype,"slottedRadioButtons",void 0);const Kc=(o,e)=>B`
    <template
        role="radio"
        class="${t=>t.checked?"checked":""} ${t=>t.readOnly?"readonly":""}"
        aria-checked="${t=>t.checked}"
        aria-required="${t=>t.required}"
        aria-disabled="${t=>t.disabled}"
        aria-readonly="${t=>t.readOnly}"
        @keypress="${(t,n)=>t.keypressHandler(n.event)}"
        @click="${(t,n)=>t.clickHandler(n.event)}"
    >
        <div part="control" class="control">
            <slot name="checked-indicator">
                ${e.checkedIndicator||""}
            </slot>
        </div>
        <label
            part="label"
            class="${t=>t.defaultSlottedNodes&&t.defaultSlottedNodes.length?"label":"label label__hidden"}"
        >
            <slot ${le("defaultSlottedNodes")}></slot>
        </label>
    </template>
`;class ea extends _{}class ta extends Ki(ea){constructor(){super(...arguments),this.proxy=document.createElement("input")}}class Ao extends ta{constructor(){super(),this.initialValue="on",this.keypressHandler=e=>{switch(e.key){case Gt:!this.checked&&!this.readOnly&&(this.checked=!0);return}return!0},this.proxy.setAttribute("type","radio")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}defaultCheckedChanged(){var e;this.$fastController.isConnected&&!this.dirtyChecked&&(this.isInsideRadioGroup()||(this.checked=(e=this.defaultChecked)!==null&&e!==void 0?e:!1,this.dirtyChecked=!1))}connectedCallback(){var e,t;super.connectedCallback(),this.validate(),((e=this.parentElement)===null||e===void 0?void 0:e.getAttribute("role"))!=="radiogroup"&&this.getAttribute("tabindex")===null&&(this.disabled||this.setAttribute("tabindex","0")),this.checkedAttribute&&(this.dirtyChecked||this.isInsideRadioGroup()||(this.checked=(t=this.defaultChecked)!==null&&t!==void 0?t:!1,this.dirtyChecked=!1))}isInsideRadioGroup(){return this.closest("[role=radiogroup]")!==null}clickHandler(e){!this.disabled&&!this.readOnly&&!this.checked&&(this.checked=!0)}}h([f({attribute:"readonly",mode:"boolean"})],Ao.prototype,"readOnly",void 0);h([g],Ao.prototype,"name",void 0);h([g],Ao.prototype,"defaultSlottedNodes",void 0);function oa(o,e,t){return o.nodeType!==Node.TEXT_NODE?!0:typeof o.nodeValue=="string"&&!!o.nodeValue.trim().length}class na extends Bo{}class ia extends Qt(na){constructor(){super(...arguments),this.proxy=document.createElement("select")}}class Fe extends ia{constructor(){super(...arguments),this.open=!1,this.forcedPosition=!1,this.position=tt.below,this.listboxId=bo("listbox-"),this.maxHeight=0}openChanged(e,t){if(!!this.collapsible){if(this.open){this.ariaControls=this.listboxId,this.ariaExpanded="true",this.setPositioning(),this.focusAndScrollOptionIntoView(),this.indexWhenOpened=this.selectedIndex,I.queueUpdate(()=>this.focus());return}this.ariaControls="",this.ariaExpanded="false"}}get collapsible(){return!(this.multiple||typeof this.size=="number")}get value(){return S.track(this,"value"),this._value}set value(e){var t,n,i,r,s,c,a;const l=`${this._value}`;if(!((t=this._options)===null||t===void 0)&&t.length){const d=this._options.findIndex(m=>m.value===e),u=(i=(n=this._options[this.selectedIndex])===null||n===void 0?void 0:n.value)!==null&&i!==void 0?i:null,b=(s=(r=this._options[d])===null||r===void 0?void 0:r.value)!==null&&s!==void 0?s:null;(d===-1||u!==b)&&(e="",this.selectedIndex=d),e=(a=(c=this.firstSelectedOption)===null||c===void 0?void 0:c.value)!==null&&a!==void 0?a:e}l!==e&&(this._value=e,super.valueChanged(l,e),S.notify(this,"value"),this.updateDisplayValue())}updateValue(e){var t,n;this.$fastController.isConnected&&(this.value=(n=(t=this.firstSelectedOption)===null||t===void 0?void 0:t.value)!==null&&n!==void 0?n:""),e&&(this.$emit("input"),this.$emit("change",this,{bubbles:!0,composed:void 0}))}selectedIndexChanged(e,t){super.selectedIndexChanged(e,t),this.updateValue()}positionChanged(){this.positionAttribute=this.position,this.setPositioning()}setPositioning(){const e=this.getBoundingClientRect(),n=window.innerHeight-e.bottom;this.position=this.forcedPosition?this.positionAttribute:e.top>n?tt.above:tt.below,this.positionAttribute=this.forcedPosition?this.positionAttribute:this.position,this.maxHeight=this.position===tt.above?~~e.top:~~n}get displayValue(){var e,t;return S.track(this,"displayValue"),(t=(e=this.firstSelectedOption)===null||e===void 0?void 0:e.text)!==null&&t!==void 0?t:""}disabledChanged(e,t){super.disabledChanged&&super.disabledChanged(e,t),this.ariaDisabled=this.disabled?"true":"false"}formResetCallback(){this.setProxyOptions(),super.setDefaultSelectedOption(),this.selectedIndex===-1&&(this.selectedIndex=0)}clickHandler(e){if(!this.disabled){if(this.open){const t=e.target.closest("option,[role=option]");if(t&&t.disabled)return}return super.clickHandler(e),this.open=this.collapsible&&!this.open,!this.open&&this.indexWhenOpened!==this.selectedIndex&&this.updateValue(!0),!0}}focusoutHandler(e){var t;if(super.focusoutHandler(e),!this.open)return!0;const n=e.relatedTarget;if(this.isSameNode(n)){this.focus();return}!((t=this.options)===null||t===void 0)&&t.includes(n)||(this.open=!1,this.indexWhenOpened!==this.selectedIndex&&this.updateValue(!0))}handleChange(e,t){super.handleChange(e,t),t==="value"&&this.updateValue()}slottedOptionsChanged(e,t){this.options.forEach(n=>{S.getNotifier(n).unsubscribe(this,"value")}),super.slottedOptionsChanged(e,t),this.options.forEach(n=>{S.getNotifier(n).subscribe(this,"value")}),this.setProxyOptions(),this.updateValue()}mousedownHandler(e){var t;return e.offsetX>=0&&e.offsetX<=((t=this.listbox)===null||t===void 0?void 0:t.scrollWidth)?super.mousedownHandler(e):this.collapsible}multipleChanged(e,t){super.multipleChanged(e,t),this.proxy&&(this.proxy.multiple=t)}selectedOptionsChanged(e,t){var n;super.selectedOptionsChanged(e,t),(n=this.options)===null||n===void 0||n.forEach((i,r)=>{var s;const c=(s=this.proxy)===null||s===void 0?void 0:s.options.item(r);c&&(c.selected=i.selected)})}setDefaultSelectedOption(){var e;const t=(e=this.options)!==null&&e!==void 0?e:Array.from(this.children).filter(Z.slottedOptionFilter),n=t?.findIndex(i=>i.hasAttribute("selected")||i.selected||i.value===this.value);if(n!==-1){this.selectedIndex=n;return}this.selectedIndex=0}setProxyOptions(){this.proxy instanceof HTMLSelectElement&&this.options&&(this.proxy.options.length=0,this.options.forEach(e=>{const t=e.proxy||(e instanceof HTMLOptionElement?e.cloneNode():null);t&&this.proxy.options.add(t)}))}keydownHandler(e){super.keydownHandler(e);const t=e.key||e.key.charCodeAt(0);switch(t){case Gt:{e.preventDefault(),this.collapsible&&this.typeAheadExpired&&(this.open=!this.open);break}case vt:case mt:{e.preventDefault();break}case Ut:{e.preventDefault(),this.open=!this.open;break}case So:{this.collapsible&&this.open&&(e.preventDefault(),this.open=!1);break}case yn:return this.collapsible&&this.open&&(e.preventDefault(),this.open=!1),!0}return!this.open&&this.indexWhenOpened!==this.selectedIndex&&(this.updateValue(!0),this.indexWhenOpened=this.selectedIndex),!(t in Ji)}connectedCallback(){super.connectedCallback(),this.forcedPosition=!!this.positionAttribute,this.addEventListener("contentchange",this.updateDisplayValue)}disconnectedCallback(){this.removeEventListener("contentchange",this.updateDisplayValue),super.disconnectedCallback()}sizeChanged(e,t){super.sizeChanged(e,t),this.proxy&&(this.proxy.size=t)}updateDisplayValue(){this.collapsible&&S.notify(this,"displayValue")}}h([f({attribute:"open",mode:"boolean"})],Fe.prototype,"open",void 0);h([ds],Fe.prototype,"collapsible",null);h([g],Fe.prototype,"control",void 0);h([f({attribute:"position"})],Fe.prototype,"positionAttribute",void 0);h([g],Fe.prototype,"position",void 0);h([g],Fe.prototype,"maxHeight",void 0);class Cn{}h([g],Cn.prototype,"ariaControls",void 0);ie(Cn,Qe);ie(Fe,ht,Cn);const ra=(o,e)=>B`
    <template
        class="${t=>[t.collapsible&&"collapsible",t.collapsible&&t.open&&"open",t.disabled&&"disabled",t.collapsible&&t.position].filter(Boolean).join(" ")}"
        aria-activedescendant="${t=>t.ariaActiveDescendant}"
        aria-controls="${t=>t.ariaControls}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-expanded="${t=>t.ariaExpanded}"
        aria-haspopup="${t=>t.collapsible?"listbox":null}"
        aria-multiselectable="${t=>t.ariaMultiSelectable}"
        ?open="${t=>t.open}"
        role="combobox"
        tabindex="${t=>t.disabled?null:"0"}"
        @click="${(t,n)=>t.clickHandler(n.event)}"
        @focusin="${(t,n)=>t.focusinHandler(n.event)}"
        @focusout="${(t,n)=>t.focusoutHandler(n.event)}"
        @keydown="${(t,n)=>t.keydownHandler(n.event)}"
        @mousedown="${(t,n)=>t.mousedownHandler(n.event)}"
    >
        ${fo(t=>t.collapsible,B`
                <div
                    class="control"
                    part="control"
                    ?disabled="${t=>t.disabled}"
                    ${K("control")}
                >
                    ${bt(o,e)}
                    <slot name="button-container">
                        <div class="selected-value" part="selected-value">
                            <slot name="selected-value">${t=>t.displayValue}</slot>
                        </div>
                        <div aria-hidden="true" class="indicator" part="indicator">
                            <slot name="indicator">
                                ${e.indicator||""}
                            </slot>
                        </div>
                    </slot>
                    ${ft(o,e)}
                </div>
            `)}
        <div
            class="listbox"
            id="${t=>t.listboxId}"
            part="listbox"
            role="listbox"
            ?disabled="${t=>t.disabled}"
            ?hidden="${t=>t.collapsible?!t.open:!1}"
            ${K("listbox")}
        >
            <slot
                ${le({filter:Z.slottedOptionFilter,flatten:!0,property:"slottedOptions"})}
            ></slot>
        </div>
    </template>
`,sa=(o,e)=>B`
    <template slot="tabpanel" role="tabpanel">
        <slot></slot>
    </template>
`;class ca extends _{}const aa=(o,e)=>B`
    <template slot="tab" role="tab" aria-disabled="${t=>t.disabled}">
        <slot></slot>
    </template>
`;class rr extends _{}h([f({mode:"boolean"})],rr.prototype,"disabled",void 0);const la=(o,e)=>B`
    <template class="${t=>t.orientation}">
        ${bt(o,e)}
        <div class="tablist" part="tablist" role="tablist">
            <slot class="tab" name="tab" part="tab" ${le("tabs")}></slot>

            ${fo(t=>t.showActiveIndicator,B`
                    <div
                        ${K("activeIndicatorRef")}
                        class="activeIndicator"
                        part="activeIndicator"
                    ></div>
                `)}
        </div>
        ${ft(o,e)}
        <div class="tabpanel">
            <slot name="tabpanel" part="tabpanel" ${le("tabpanels")}></slot>
        </div>
    </template>
`;var Mt;(function(o){o.vertical="vertical",o.horizontal="horizontal"})(Mt||(Mt={}));class Ie extends _{constructor(){super(...arguments),this.orientation=Mt.horizontal,this.activeindicator=!0,this.showActiveIndicator=!0,this.prevActiveTabIndex=0,this.activeTabIndex=0,this.ticking=!1,this.change=()=>{this.$emit("change",this.activetab)},this.isDisabledElement=e=>e.getAttribute("aria-disabled")==="true",this.isFocusableElement=e=>!this.isDisabledElement(e),this.setTabs=()=>{const e="gridColumn",t="gridRow",n=this.isHorizontal()?e:t;this.activeTabIndex=this.getActiveIndex(),this.showActiveIndicator=!1,this.tabs.forEach((i,r)=>{if(i.slot==="tab"){const s=this.activeTabIndex===r&&this.isFocusableElement(i);this.activeindicator&&this.isFocusableElement(i)&&(this.showActiveIndicator=!0);const c=this.tabIds[r],a=this.tabpanelIds[r];i.setAttribute("id",c),i.setAttribute("aria-selected",s?"true":"false"),i.setAttribute("aria-controls",a),i.addEventListener("click",this.handleTabClick),i.addEventListener("keydown",this.handleTabKeyDown),i.setAttribute("tabindex",s?"0":"-1"),s&&(this.activetab=i)}i.style[e]="",i.style[t]="",i.style[n]=`${r+1}`,this.isHorizontal()?i.classList.remove("vertical"):i.classList.add("vertical")})},this.setTabPanels=()=>{this.tabpanels.forEach((e,t)=>{const n=this.tabIds[t],i=this.tabpanelIds[t];e.setAttribute("id",i),e.setAttribute("aria-labelledby",n),this.activeTabIndex!==t?e.setAttribute("hidden",""):e.removeAttribute("hidden")})},this.handleTabClick=e=>{const t=e.currentTarget;t.nodeType===1&&this.isFocusableElement(t)&&(this.prevActiveTabIndex=this.activeTabIndex,this.activeTabIndex=this.tabs.indexOf(t),this.setComponent())},this.handleTabKeyDown=e=>{if(this.isHorizontal())switch(e.key){case Nt:e.preventDefault(),this.adjustBackward(e);break;case Vt:e.preventDefault(),this.adjustForward(e);break}else switch(e.key){case gt:e.preventDefault(),this.adjustBackward(e);break;case pt:e.preventDefault(),this.adjustForward(e);break}switch(e.key){case vt:e.preventDefault(),this.adjust(-this.activeTabIndex);break;case mt:e.preventDefault(),this.adjust(this.tabs.length-this.activeTabIndex-1);break}},this.adjustForward=e=>{const t=this.tabs;let n=0;for(n=this.activetab?t.indexOf(this.activetab)+1:1,n===t.length&&(n=0);n<t.length&&t.length>1;)if(this.isFocusableElement(t[n])){this.moveToTabByIndex(t,n);break}else{if(this.activetab&&n===t.indexOf(this.activetab))break;n+1>=t.length?n=0:n+=1}},this.adjustBackward=e=>{const t=this.tabs;let n=0;for(n=this.activetab?t.indexOf(this.activetab)-1:0,n=n<0?t.length-1:n;n>=0&&t.length>1;)if(this.isFocusableElement(t[n])){this.moveToTabByIndex(t,n);break}else n-1<0?n=t.length-1:n-=1},this.moveToTabByIndex=(e,t)=>{const n=e[t];this.activetab=n,this.prevActiveTabIndex=this.activeTabIndex,this.activeTabIndex=t,n.focus(),this.setComponent()}}orientationChanged(){this.$fastController.isConnected&&(this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}activeidChanged(e,t){this.$fastController.isConnected&&this.tabs.length<=this.tabpanels.length&&(this.prevActiveTabIndex=this.tabs.findIndex(n=>n.id===e),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}tabsChanged(){this.$fastController.isConnected&&this.tabs.length<=this.tabpanels.length&&(this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}tabpanelsChanged(){this.$fastController.isConnected&&this.tabpanels.length<=this.tabs.length&&(this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}getActiveIndex(){return this.activeid!==void 0?this.tabIds.indexOf(this.activeid)===-1?0:this.tabIds.indexOf(this.activeid):0}getTabIds(){return this.tabs.map(e=>{var t;return(t=e.getAttribute("id"))!==null&&t!==void 0?t:`tab-${bo()}`})}getTabPanelIds(){return this.tabpanels.map(e=>{var t;return(t=e.getAttribute("id"))!==null&&t!==void 0?t:`panel-${bo()}`})}setComponent(){this.activeTabIndex!==this.prevActiveTabIndex&&(this.activeid=this.tabIds[this.activeTabIndex],this.focusTab(),this.change())}isHorizontal(){return this.orientation===Mt.horizontal}handleActiveIndicatorPosition(){this.showActiveIndicator&&this.activeindicator&&this.activeTabIndex!==this.prevActiveTabIndex&&(this.ticking?this.ticking=!1:(this.ticking=!0,this.animateActiveIndicator()))}animateActiveIndicator(){this.ticking=!0;const e=this.isHorizontal()?"gridColumn":"gridRow",t=this.isHorizontal()?"translateX":"translateY",n=this.isHorizontal()?"offsetLeft":"offsetTop",i=this.activeIndicatorRef[n];this.activeIndicatorRef.style[e]=`${this.activeTabIndex+1}`;const r=this.activeIndicatorRef[n];this.activeIndicatorRef.style[e]=`${this.prevActiveTabIndex+1}`;const s=r-i;this.activeIndicatorRef.style.transform=`${t}(${s}px)`,this.activeIndicatorRef.classList.add("activeIndicatorTransition"),this.activeIndicatorRef.addEventListener("transitionend",()=>{this.ticking=!1,this.activeIndicatorRef.style[e]=`${this.activeTabIndex+1}`,this.activeIndicatorRef.style.transform=`${t}(0px)`,this.activeIndicatorRef.classList.remove("activeIndicatorTransition")})}adjust(e){this.prevActiveTabIndex=this.activeTabIndex,this.activeTabIndex=gc(0,this.tabs.length-1,this.activeTabIndex+e),this.setComponent()}focusTab(){this.tabs[this.activeTabIndex].focus()}connectedCallback(){super.connectedCallback(),this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.activeTabIndex=this.getActiveIndex()}}h([f],Ie.prototype,"orientation",void 0);h([f],Ie.prototype,"activeid",void 0);h([g],Ie.prototype,"tabs",void 0);h([g],Ie.prototype,"tabpanels",void 0);h([f({mode:"boolean"})],Ie.prototype,"activeindicator",void 0);h([g],Ie.prototype,"activeIndicatorRef",void 0);h([g],Ie.prototype,"showActiveIndicator",void 0);ie(Ie,ht);class da extends _{}class ua extends Qt(da){constructor(){super(...arguments),this.proxy=document.createElement("textarea")}}var po;(function(o){o.none="none",o.both="both",o.horizontal="horizontal",o.vertical="vertical"})(po||(po={}));class te extends ua{constructor(){super(...arguments),this.resize=po.none,this.cols=20,this.handleTextInput=()=>{this.value=this.control.value}}readOnlyChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.readOnly=this.readOnly)}autofocusChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.autofocus=this.autofocus)}listChanged(){this.proxy instanceof HTMLTextAreaElement&&this.proxy.setAttribute("list",this.list)}maxlengthChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.maxLength=this.maxlength)}minlengthChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.minLength=this.minlength)}spellcheckChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.spellcheck=this.spellcheck)}select(){this.control.select(),this.$emit("select")}handleChange(){this.$emit("change")}}h([f({mode:"boolean"})],te.prototype,"readOnly",void 0);h([f],te.prototype,"resize",void 0);h([f({mode:"boolean"})],te.prototype,"autofocus",void 0);h([f({attribute:"form"})],te.prototype,"formId",void 0);h([f],te.prototype,"list",void 0);h([f({converter:fe})],te.prototype,"maxlength",void 0);h([f({converter:fe})],te.prototype,"minlength",void 0);h([f],te.prototype,"name",void 0);h([f],te.prototype,"placeholder",void 0);h([f({converter:fe,mode:"fromView"})],te.prototype,"cols",void 0);h([f({converter:fe,mode:"fromView"})],te.prototype,"rows",void 0);h([f({mode:"boolean"})],te.prototype,"spellcheck",void 0);h([g],te.prototype,"defaultSlottedNodes",void 0);ie(te,$n);const ha=(o,e)=>B`
    <template
        class="
            ${t=>t.readOnly?"readonly":""}
            ${t=>t.resize!==po.none?`resize-${t.resize}`:""}"
    >
        <label
            part="label"
            for="control"
            class="${t=>t.defaultSlottedNodes&&t.defaultSlottedNodes.length?"label":"label label__hidden"}"
        >
            <slot ${le("defaultSlottedNodes")}></slot>
        </label>
        <textarea
            part="control"
            class="control"
            id="control"
            ?autofocus="${t=>t.autofocus}"
            cols="${t=>t.cols}"
            ?disabled="${t=>t.disabled}"
            form="${t=>t.form}"
            list="${t=>t.list}"
            maxlength="${t=>t.maxlength}"
            minlength="${t=>t.minlength}"
            name="${t=>t.name}"
            placeholder="${t=>t.placeholder}"
            ?readonly="${t=>t.readOnly}"
            ?required="${t=>t.required}"
            rows="${t=>t.rows}"
            ?spellcheck="${t=>t.spellcheck}"
            :value="${t=>t.value}"
            aria-atomic="${t=>t.ariaAtomic}"
            aria-busy="${t=>t.ariaBusy}"
            aria-controls="${t=>t.ariaControls}"
            aria-current="${t=>t.ariaCurrent}"
            aria-describedby="${t=>t.ariaDescribedby}"
            aria-details="${t=>t.ariaDetails}"
            aria-disabled="${t=>t.ariaDisabled}"
            aria-errormessage="${t=>t.ariaErrormessage}"
            aria-flowto="${t=>t.ariaFlowto}"
            aria-haspopup="${t=>t.ariaHaspopup}"
            aria-hidden="${t=>t.ariaHidden}"
            aria-invalid="${t=>t.ariaInvalid}"
            aria-keyshortcuts="${t=>t.ariaKeyshortcuts}"
            aria-label="${t=>t.ariaLabel}"
            aria-labelledby="${t=>t.ariaLabelledby}"
            aria-live="${t=>t.ariaLive}"
            aria-owns="${t=>t.ariaOwns}"
            aria-relevant="${t=>t.ariaRelevant}"
            aria-roledescription="${t=>t.ariaRoledescription}"
            @input="${(t,n)=>t.handleTextInput()}"
            @change="${t=>t.handleChange()}"
            ${K("control")}
        ></textarea>
    </template>
`,fa=(o,e)=>B`
    <template
        class="
            ${t=>t.readOnly?"readonly":""}
        "
    >
        <label
            part="label"
            for="control"
            class="${t=>t.defaultSlottedNodes&&t.defaultSlottedNodes.length?"label":"label label__hidden"}"
        >
            <slot
                ${le({property:"defaultSlottedNodes",filter:oa})}
            ></slot>
        </label>
        <div class="root" part="root">
            ${bt(o,e)}
            <input
                class="control"
                part="control"
                id="control"
                @input="${t=>t.handleTextInput()}"
                @change="${t=>t.handleChange()}"
                ?autofocus="${t=>t.autofocus}"
                ?disabled="${t=>t.disabled}"
                list="${t=>t.list}"
                maxlength="${t=>t.maxlength}"
                minlength="${t=>t.minlength}"
                pattern="${t=>t.pattern}"
                placeholder="${t=>t.placeholder}"
                ?readonly="${t=>t.readOnly}"
                ?required="${t=>t.required}"
                size="${t=>t.size}"
                ?spellcheck="${t=>t.spellcheck}"
                :value="${t=>t.value}"
                type="${t=>t.type}"
                aria-atomic="${t=>t.ariaAtomic}"
                aria-busy="${t=>t.ariaBusy}"
                aria-controls="${t=>t.ariaControls}"
                aria-current="${t=>t.ariaCurrent}"
                aria-describedby="${t=>t.ariaDescribedby}"
                aria-details="${t=>t.ariaDetails}"
                aria-disabled="${t=>t.ariaDisabled}"
                aria-errormessage="${t=>t.ariaErrormessage}"
                aria-flowto="${t=>t.ariaFlowto}"
                aria-haspopup="${t=>t.ariaHaspopup}"
                aria-hidden="${t=>t.ariaHidden}"
                aria-invalid="${t=>t.ariaInvalid}"
                aria-keyshortcuts="${t=>t.ariaKeyshortcuts}"
                aria-label="${t=>t.ariaLabel}"
                aria-labelledby="${t=>t.ariaLabelledby}"
                aria-live="${t=>t.ariaLive}"
                aria-owns="${t=>t.ariaOwns}"
                aria-relevant="${t=>t.ariaRelevant}"
                aria-roledescription="${t=>t.ariaRoledescription}"
                ${K("control")}
            />
            ${ft(o,e)}
        </div>
    </template>
`,Re="not-allowed",ba=":host([hidden]){display:none}";function X(o){return`${ba}:host{display:${o}}`}const W=hc()?"focus-visible":"focus";function pa(o){return nr.getOrCreate(o).withPrefix("vscode")}function ga(o){window.addEventListener("load",()=>{new MutationObserver(()=>{ai(o)}).observe(document.body,{attributes:!0,attributeFilter:["class"]}),ai(o)})}function ai(o){const e=getComputedStyle(document.body),t=document.querySelector("body");if(t){const n=t.getAttribute("data-vscode-theme-kind");for(const[i,r]of o){let s=e.getPropertyValue(i).toString();n==="vscode-high-contrast"?(s.length===0&&r.name.includes("background")&&(s="transparent"),r.name==="button-icon-hover-background"&&(s="transparent")):r.name==="contrast-active-border"&&(s="transparent"),r.setValueFor(t,s)}}}const li=new Map;let di=!1;function p(o,e){const t=or.create(o);if(e){if(e.includes("--fake-vscode-token")){const n="id"+Math.random().toString(16).slice(2);e=`${e}-${n}`}li.set(e,t)}return di||(ga(li),di=!0),t}const va=p("background","--vscode-editor-background").withDefault("#1e1e1e"),T=p("border-width").withDefault(1),sr=p("contrast-active-border","--vscode-contrastActiveBorder").withDefault("#f38518");p("contrast-border","--vscode-contrastBorder").withDefault("#6fc3df");const ye=p("corner-radius").withDefault(0),x=p("design-unit").withDefault(4),Xe=p("disabled-opacity").withDefault(.4),O=p("focus-border","--vscode-focusBorder").withDefault("#007fd4"),de=p("font-family","--vscode-font-family").withDefault("-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol");p("font-weight","--vscode-font-weight").withDefault("400");const G=p("foreground","--vscode-foreground").withDefault("#cccccc"),so=p("input-height").withDefault("26"),Sn=p("input-min-width").withDefault("100px"),ee=p("type-ramp-base-font-size","--vscode-font-size").withDefault("13px"),ne=p("type-ramp-base-line-height").withDefault("normal"),cr=p("type-ramp-minus1-font-size").withDefault("11px"),ar=p("type-ramp-minus1-line-height").withDefault("16px");p("type-ramp-minus2-font-size").withDefault("9px");p("type-ramp-minus2-line-height").withDefault("16px");p("type-ramp-plus1-font-size").withDefault("16px");p("type-ramp-plus1-line-height").withDefault("24px");const ma=p("scrollbarWidth").withDefault("10px"),ya=p("scrollbarHeight").withDefault("10px"),xa=p("scrollbar-slider-background","--vscode-scrollbarSlider-background").withDefault("#79797966"),wa=p("scrollbar-slider-hover-background","--vscode-scrollbarSlider-hoverBackground").withDefault("#646464b3"),ka=p("scrollbar-slider-active-background","--vscode-scrollbarSlider-activeBackground").withDefault("#bfbfbf66"),lr=p("badge-background","--vscode-badge-background").withDefault("#4d4d4d"),dr=p("badge-foreground","--vscode-badge-foreground").withDefault("#ffffff"),In=p("button-border","--vscode-button-border").withDefault("transparent"),ui=p("button-icon-background").withDefault("transparent"),$a=p("button-icon-corner-radius").withDefault("5px"),Ca=p("button-icon-outline-offset").withDefault(0),hi=p("button-icon-hover-background","--fake-vscode-token").withDefault("rgba(90, 93, 94, 0.31)"),Sa=p("button-icon-padding").withDefault("3px"),rt=p("button-primary-background","--vscode-button-background").withDefault("#0e639c"),ur=p("button-primary-foreground","--vscode-button-foreground").withDefault("#ffffff"),hr=p("button-primary-hover-background","--vscode-button-hoverBackground").withDefault("#1177bb"),Uo=p("button-secondary-background","--vscode-button-secondaryBackground").withDefault("#3a3d41"),Ia=p("button-secondary-foreground","--vscode-button-secondaryForeground").withDefault("#ffffff"),Ta=p("button-secondary-hover-background","--vscode-button-secondaryHoverBackground").withDefault("#45494e"),Ba=p("button-padding-horizontal").withDefault("11px"),Aa=p("button-padding-vertical").withDefault("4px"),xe=p("checkbox-background","--vscode-checkbox-background").withDefault("#3c3c3c"),nt=p("checkbox-border","--vscode-checkbox-border").withDefault("#3c3c3c"),Ra=p("checkbox-corner-radius").withDefault(3);p("checkbox-foreground","--vscode-checkbox-foreground").withDefault("#f0f0f0");const De=p("list-active-selection-background","--vscode-list-activeSelectionBackground").withDefault("#094771"),st=p("list-active-selection-foreground","--vscode-list-activeSelectionForeground").withDefault("#ffffff"),Oa=p("list-hover-background","--vscode-list-hoverBackground").withDefault("#2a2d2e"),_a=p("divider-background","--vscode-settings-dropdownListBorder").withDefault("#454545"),eo=p("dropdown-background","--vscode-dropdown-background").withDefault("#3c3c3c"),Be=p("dropdown-border","--vscode-dropdown-border").withDefault("#3c3c3c");p("dropdown-foreground","--vscode-dropdown-foreground").withDefault("#f0f0f0");const Fa=p("dropdown-list-max-height").withDefault("200px"),Pe=p("input-background","--vscode-input-background").withDefault("#3c3c3c"),fr=p("input-foreground","--vscode-input-foreground").withDefault("#cccccc");p("input-placeholder-foreground","--vscode-input-placeholderForeground").withDefault("#cccccc");const fi=p("link-active-foreground","--vscode-textLink-activeForeground").withDefault("#3794ff"),Ea=p("link-foreground","--vscode-textLink-foreground").withDefault("#3794ff"),Da=p("progress-background","--vscode-progressBar-background").withDefault("#0e70c0"),Pa=p("panel-tab-active-border","--vscode-panelTitle-activeBorder").withDefault("#e7e7e7"),Ke=p("panel-tab-active-foreground","--vscode-panelTitle-activeForeground").withDefault("#e7e7e7"),La=p("panel-tab-foreground","--vscode-panelTitle-inactiveForeground").withDefault("#e7e7e799");p("panel-view-background","--vscode-panel-background").withDefault("#1e1e1e");p("panel-view-border","--vscode-panel-border").withDefault("#80808059");const Ha=p("tag-corner-radius").withDefault("2px"),Na=(o,e)=>D`
	${X("inline-block")} :host {
		box-sizing: border-box;
		font-family: ${de};
		font-size: ${cr};
		line-height: ${ar};
		text-align: center;
	}
	.control {
		align-items: center;
		background-color: ${lr};
		border: calc(${T} * 1px) solid ${In};
		border-radius: 11px;
		box-sizing: border-box;
		color: ${dr};
		display: flex;
		height: calc(${x} * 4px);
		justify-content: center;
		min-width: calc(${x} * 4px + 2px);
		min-height: calc(${x} * 4px + 2px);
		padding: 3px 6px;
	}
`;class Va extends Wt{connectedCallback(){super.connectedCallback(),this.circular||(this.circular=!0)}}const Ma=Va.compose({baseName:"badge",template:Zi,styles:Na}),za=D`
	${X("inline-flex")} :host {
		outline: none;
		font-family: ${de};
		font-size: ${ee};
		line-height: ${ne};
		color: ${ur};
		background: ${rt};
		border-radius: calc(${ye} * 1px);
		fill: currentColor;
		cursor: pointer;
	}
	.control {
		background: transparent;
		height: inherit;
		flex-grow: 1;
		box-sizing: border-box;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		padding: ${Aa} ${Ba};
		white-space: wrap;
		outline: none;
		text-decoration: none;
		border: calc(${T} * 1px) solid ${In};
		color: inherit;
		border-radius: inherit;
		fill: inherit;
		cursor: inherit;
		font-family: inherit;
		max-width: 300px;
	}
	:host(:hover) {
		background: ${hr};
	}
	:host(:active) {
		background: ${rt};
	}
	.control:${W} {
		outline: calc(${T} * 1px) solid ${O};
		outline-offset: calc(${T} * 2px);
	}
	.control::-moz-focus-inner {
		border: 0;
	}
	:host([disabled]) {
		opacity: ${Xe};
		background: ${rt};
		cursor: ${Re};
	}
	.content {
		display: flex;
	}
	.start {
		display: flex;
	}
	::slotted(svg),
	::slotted(span) {
		width: calc(${x} * 4px);
		height: calc(${x} * 4px);
	}
	.start {
		margin-inline-end: 8px;
	}
`,ja=D`
	:host([appearance='primary']) {
		background: ${rt};
		color: ${ur};
	}
	:host([appearance='primary']:hover) {
		background: ${hr};
	}
	:host([appearance='primary']:active) .control:active {
		background: ${rt};
	}
	:host([appearance='primary']) .control:${W} {
		outline: calc(${T} * 1px) solid ${O};
		outline-offset: calc(${T} * 2px);
	}
	:host([appearance='primary'][disabled]) {
		background: ${rt};
	}
`,qa=D`
	:host([appearance='secondary']) {
		background: ${Uo};
		color: ${Ia};
	}
	:host([appearance='secondary']:hover) {
		background: ${Ta};
	}
	:host([appearance='secondary']:active) .control:active {
		background: ${Uo};
	}
	:host([appearance='secondary']) .control:${W} {
		outline: calc(${T} * 1px) solid ${O};
		outline-offset: calc(${T} * 2px);
	}
	:host([appearance='secondary'][disabled]) {
		background: ${Uo};
	}
`,Ua=D`
	:host([appearance='icon']) {
		background: ${ui};
		border-radius: ${$a};
		color: ${G};
	}
	:host([appearance='icon']:hover) {
		background: ${hi};
		outline: 1px dotted ${sr};
		outline-offset: -1px;
	}
	:host([appearance='icon']) .control {
		padding: ${Sa};
		border: none;
	}
	:host([appearance='icon']:active) .control:active {
		background: ${hi};
	}
	:host([appearance='icon']) .control:${W} {
		outline: calc(${T} * 1px) solid ${O};
		outline-offset: ${Ca};
	}
	:host([appearance='icon'][disabled]) {
		background: ${ui};
	}
`,Ga=(o,e)=>D`
	${za}
	${ja}
	${qa}
	${Ua}
`;class br extends pe{connectedCallback(){if(super.connectedCallback(),!this.appearance){const e=this.getAttribute("appearance");this.appearance=e}}attributeChangedCallback(e,t,n){e==="appearance"&&n==="icon"&&(this.getAttribute("aria-label")||(this.ariaLabel="Icon Button")),e==="aria-label"&&(this.ariaLabel=n),e==="disabled"&&(this.disabled=n!==null)}}h([f],br.prototype,"appearance",void 0);const Wa=br.compose({baseName:"button",template:xc,styles:Ga,shadowOptions:{delegatesFocus:!0}}),Qa=(o,e)=>D`
	${X("inline-flex")} :host {
		align-items: center;
		outline: none;
		margin: calc(${x} * 1px) 0;
		user-select: none;
		font-size: ${ee};
		line-height: ${ne};
	}
	.control {
		position: relative;
		width: calc(${x} * 4px + 2px);
		height: calc(${x} * 4px + 2px);
		box-sizing: border-box;
		border-radius: calc(${Ra} * 1px);
		border: calc(${T} * 1px) solid ${nt};
		background: ${xe};
		outline: none;
		cursor: pointer;
	}
	.label {
		font-family: ${de};
		color: ${G};
		padding-inline-start: calc(${x} * 2px + 2px);
		margin-inline-end: calc(${x} * 2px + 2px);
		cursor: pointer;
	}
	.label__hidden {
		display: none;
		visibility: hidden;
	}
	.checked-indicator {
		width: 100%;
		height: 100%;
		display: block;
		fill: ${G};
		opacity: 0;
		pointer-events: none;
	}
	.indeterminate-indicator {
		border-radius: 2px;
		background: ${G};
		position: absolute;
		top: 50%;
		left: 50%;
		width: 50%;
		height: 50%;
		transform: translate(-50%, -50%);
		opacity: 0;
	}
	:host(:enabled) .control:hover {
		background: ${xe};
		border-color: ${nt};
	}
	:host(:enabled) .control:active {
		background: ${xe};
		border-color: ${O};
	}
	:host(:${W}) .control {
		border: calc(${T} * 1px) solid ${O};
	}
	:host(.disabled) .label,
	:host(.readonly) .label,
	:host(.readonly) .control,
	:host(.disabled) .control {
		cursor: ${Re};
	}
	:host(.checked:not(.indeterminate)) .checked-indicator,
	:host(.indeterminate) .indeterminate-indicator {
		opacity: 1;
	}
	:host(.disabled) {
		opacity: ${Xe};
	}
`;class Xa extends To{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Checkbox")}}const Ya=Xa.compose({baseName:"checkbox",template:Oc,styles:Qa,checkedIndicator:`
		<svg 
			part="checked-indicator"
			class="checked-indicator"
			width="16" 
			height="16" 
			viewBox="0 0 16 16" 
			xmlns="http://www.w3.org/2000/svg" 
			fill="currentColor"
		>
			<path 
				fill-rule="evenodd" 
				clip-rule="evenodd" 
				d="M14.431 3.323l-8.47 10-.79-.036-3.35-4.77.818-.574 2.978 4.24 8.051-9.506.764.646z"
			/>
		</svg>
	`,indeterminateIndicator:`
		<div part="indeterminate-indicator" class="indeterminate-indicator"></div>
	`}),Ja=(o,e)=>D`
	:host {
		display: flex;
		position: relative;
		flex-direction: column;
		width: 100%;
	}
`,Za=(o,e)=>D`
	:host {
		display: grid;
		padding: calc((${x} / 4) * 1px) 0;
		box-sizing: border-box;
		width: 100%;
		background: transparent;
	}
	:host(.header) {
	}
	:host(.sticky-header) {
		background: ${va};
		position: sticky;
		top: 0;
	}
	:host(:hover) {
		background: ${Oa};
		outline: 1px dotted ${sr};
		outline-offset: -1px;
	}
`,Ka=(o,e)=>D`
	:host {
		padding: calc(${x} * 1px) calc(${x} * 3px);
		color: ${G};
		opacity: 1;
		box-sizing: border-box;
		font-family: ${de};
		font-size: ${ee};
		line-height: ${ne};
		font-weight: 400;
		border: solid calc(${T} * 1px) transparent;
		border-radius: calc(${ye} * 1px);
		white-space: wrap;
		overflow-wrap: anywhere;
	}
	:host(.column-header) {
		font-weight: 600;
		overflow-wrap: normal;
	}
	:host(:${W}),
	:host(:focus),
	:host(:active) {
		background: ${De};
		border: solid calc(${T} * 1px) ${O};
		color: ${st};
		outline: none;
	}
	:host(:${W}) ::slotted(*),
	:host(:focus) ::slotted(*),
	:host(:active) ::slotted(*) {
		color: ${st} !important;
	}
`;class el extends H{connectedCallback(){super.connectedCallback(),this.getAttribute("aria-label")||this.setAttribute("aria-label","Data Grid")}}const tl=el.compose({baseName:"data-grid",baseClass:H,template:Cc,styles:Ja});class ol extends Q{}const nl=ol.compose({baseName:"data-grid-row",baseClass:Q,template:Ac,styles:Za});class il extends Oe{}const rl=il.compose({baseName:"data-grid-cell",baseClass:Oe,template:Rc,styles:Ka}),sl=(o,e)=>D`
	${X("block")} :host {
		border: none;
		border-top: calc(${T} * 1px) solid ${_a};
		box-sizing: content-box;
		height: 0;
		margin: calc(${x} * 1px) 0;
		width: 100%;
	}
`;class cl extends kn{}const al=cl.compose({baseName:"divider",template:Wc,styles:sl}),ll=(o,e)=>D`
	${X("inline-flex")} :host {
		background: ${eo};
		box-sizing: border-box;
		color: ${G};
		contain: contents;
		font-family: ${de};
		height: calc(${so} * 1px);
		position: relative;
		user-select: none;
		min-width: ${Sn};
		outline: none;
		vertical-align: top;
	}
	.control {
		align-items: center;
		box-sizing: border-box;
		border: calc(${T} * 1px) solid ${Be};
		border-radius: calc(${ye} * 1px);
		cursor: pointer;
		display: flex;
		font-family: inherit;
		font-size: ${ee};
		line-height: ${ne};
		min-height: 100%;
		padding: 2px 6px 2px 8px;
		width: 100%;
	}
	.listbox {
		background: ${eo};
		border: calc(${T} * 1px) solid ${O};
		border-radius: calc(${ye} * 1px);
		box-sizing: border-box;
		display: inline-flex;
		flex-direction: column;
		left: 0;
		max-height: ${Fa};
		padding: 0 0 calc(${x} * 1px) 0;
		overflow-y: auto;
		position: absolute;
		width: 100%;
		z-index: 1;
	}
	.listbox[hidden] {
		display: none;
	}
	:host(:${W}) .control {
		border-color: ${O};
	}
	:host(:not([disabled]):hover) {
		background: ${eo};
		border-color: ${Be};
	}
	:host(:${W}) ::slotted([aria-selected="true"][role="option"]:not([disabled])) {
		background: ${De};
		border: calc(${T} * 1px) solid ${O};
		color: ${st};
	}
	:host([disabled]) {
		cursor: ${Re};
		opacity: ${Xe};
	}
	:host([disabled]) .control {
		cursor: ${Re};
		user-select: none;
	}
	:host([disabled]:hover) {
		background: ${eo};
		color: ${G};
		fill: currentcolor;
	}
	:host(:not([disabled])) .control:active {
		border-color: ${O};
	}
	:host(:empty) .listbox {
		display: none;
	}
	:host([open]) .control {
		border-color: ${O};
	}
	:host([open][position='above']) .listbox,
	:host([open][position='below']) .control {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
	:host([open][position='above']) .control,
	:host([open][position='below']) .listbox {
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}
	:host([open][position='above']) .listbox {
		bottom: calc(${so} * 1px);
	}
	:host([open][position='below']) .listbox {
		top: calc(${so} * 1px);
	}
	.selected-value {
		flex: 1 1 auto;
		font-family: inherit;
		overflow: hidden;
		text-align: start;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.indicator {
		flex: 0 0 auto;
		margin-inline-start: 1em;
	}
	slot[name='listbox'] {
		display: none;
		width: 100%;
	}
	:host([open]) slot[name='listbox'] {
		display: flex;
		position: absolute;
	}
	.end {
		margin-inline-start: auto;
	}
	.start,
	.end,
	.indicator,
	.select-indicator,
	::slotted(svg),
	::slotted(span) {
		fill: currentcolor;
		height: 1em;
		min-height: calc(${x} * 4px);
		min-width: calc(${x} * 4px);
		width: 1em;
	}
	::slotted([role='option']),
	::slotted(option) {
		flex: 0 0 auto;
	}
`;class dl extends Fe{}const ul=dl.compose({baseName:"dropdown",template:ra,styles:ll,indicator:`
		<svg 
			class="select-indicator"
			part="select-indicator"
			width="16" 
			height="16" 
			viewBox="0 0 16 16" 
			xmlns="http://www.w3.org/2000/svg" 
			fill="currentColor"
		>
			<path 
				fill-rule="evenodd" 
				clip-rule="evenodd" 
				d="M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z"
			/>
		</svg>
	`}),hl=(o,e)=>D`
	${X("inline-flex")} :host {
		background: transparent;
		box-sizing: border-box;
		color: ${Ea};
		cursor: pointer;
		fill: currentcolor;
		font-family: ${de};
		font-size: ${ee};
		line-height: ${ne};
		outline: none;
	}
	.control {
		background: transparent;
		border: calc(${T} * 1px) solid transparent;
		border-radius: calc(${ye} * 1px);
		box-sizing: border-box;
		color: inherit;
		cursor: inherit;
		fill: inherit;
		font-family: inherit;
		height: inherit;
		padding: 0;
		outline: none;
		text-decoration: none;
		white-space: nowrap;
	}
	.control::-moz-focus-inner {
		border: 0;
	}
	:host(:hover) {
		color: ${fi};
	}
	:host(:hover) .content {
		text-decoration: underline;
	}
	:host(:active) {
		background: transparent;
		color: ${fi};
	}
	:host(:${W}) .control {
		border: calc(${T} * 1px) solid ${O};
	}
`;class fl extends be{}const bl=fl.compose({baseName:"link",template:mc,styles:hl,shadowOptions:{delegatesFocus:!0}}),pl=(o,e)=>D`
	${X("inline-flex")} :host {
		font-family: var(--body-font);
		border-radius: ${ye};
		border: calc(${T} * 1px) solid transparent;
		box-sizing: border-box;
		color: ${G};
		cursor: pointer;
		fill: currentcolor;
		font-size: ${ee};
		line-height: ${ne};
		margin: 0;
		outline: none;
		overflow: hidden;
		padding: 0 calc((${x} / 2) * 1px)
			calc((${x} / 4) * 1px);
		user-select: none;
		white-space: nowrap;
	}
	:host(:${W}) {
		border-color: ${O};
		background: ${De};
		color: ${G};
	}
	:host([aria-selected='true']) {
		background: ${De};
		border: calc(${T} * 1px) solid ${O};
		color: ${st};
	}
	:host(:active) {
		background: ${De};
		color: ${st};
	}
	:host(:not([aria-selected='true']):hover) {
		background: ${De};
		border: calc(${T} * 1px) solid ${O};
		color: ${st};
	}
	:host(:not([aria-selected='true']):active) {
		background: ${De};
		color: ${G};
	}
	:host([disabled]) {
		cursor: ${Re};
		opacity: ${Xe};
	}
	:host([disabled]:hover) {
		background-color: inherit;
	}
	.content {
		grid-column-start: 2;
		justify-self: start;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;class gl extends Se{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Option")}}const vl=gl.compose({baseName:"option",template:Qc,styles:pl}),ml=(o,e)=>D`
	${X("grid")} :host {
		box-sizing: border-box;
		font-family: ${de};
		font-size: ${ee};
		line-height: ${ne};
		color: ${G};
		grid-template-columns: auto 1fr auto;
		grid-template-rows: auto 1fr;
		overflow-x: auto;
	}
	.tablist {
		display: grid;
		grid-template-rows: auto auto;
		grid-template-columns: auto;
		column-gap: calc(${x} * 8px);
		position: relative;
		width: max-content;
		align-self: end;
		padding: calc(${x} * 1px) calc(${x} * 1px) 0;
		box-sizing: border-box;
	}
	.start,
	.end {
		align-self: center;
	}
	.activeIndicator {
		grid-row: 2;
		grid-column: 1;
		width: 100%;
		height: calc((${x} / 4) * 1px);
		justify-self: center;
		background: ${Ke};
		margin: 0;
		border-radius: calc(${ye} * 1px);
	}
	.activeIndicatorTransition {
		transition: transform 0.01s linear;
	}
	.tabpanel {
		grid-row: 2;
		grid-column-start: 1;
		grid-column-end: 4;
		position: relative;
	}
`,yl=(o,e)=>D`
	${X("inline-flex")} :host {
		box-sizing: border-box;
		font-family: ${de};
		font-size: ${ee};
		line-height: ${ne};
		height: calc(${x} * 7px);
		padding: calc(${x} * 1px) 0;
		color: ${La};
		fill: currentcolor;
		border-radius: calc(${ye} * 1px);
		border: solid calc(${T} * 1px) transparent;
		align-items: center;
		justify-content: center;
		grid-row: 1;
		cursor: pointer;
	}
	:host(:hover) {
		color: ${Ke};
		fill: currentcolor;
	}
	:host(:active) {
		color: ${Ke};
		fill: currentcolor;
	}
	:host([aria-selected='true']) {
		background: transparent;
		color: ${Ke};
		fill: currentcolor;
	}
	:host([aria-selected='true']:hover) {
		background: transparent;
		color: ${Ke};
		fill: currentcolor;
	}
	:host([aria-selected='true']:active) {
		background: transparent;
		color: ${Ke};
		fill: currentcolor;
	}
	:host(:${W}) {
		outline: none;
		border: solid calc(${T} * 1px) ${Pa};
	}
	:host(:focus) {
		outline: none;
	}
	::slotted(vscode-badge) {
		margin-inline-start: calc(${x} * 2px);
	}
`,xl=(o,e)=>D`
	${X("flex")} :host {
		color: inherit;
		background-color: transparent;
		border: solid calc(${T} * 1px) transparent;
		box-sizing: border-box;
		font-size: ${ee};
		line-height: ${ne};
		padding: 10px calc((${x} + 2) * 1px);
	}
`;class wl extends Ie{connectedCallback(){super.connectedCallback(),this.orientation&&(this.orientation=Mt.horizontal),this.getAttribute("aria-label")||this.setAttribute("aria-label","Panels")}}const kl=wl.compose({baseName:"panels",template:la,styles:ml});class $l extends rr{connectedCallback(){super.connectedCallback(),this.disabled&&(this.disabled=!1),this.textContent&&this.setAttribute("aria-label",this.textContent)}}const Cl=$l.compose({baseName:"panel-tab",template:aa,styles:yl});class Sl extends ca{}const Il=Sl.compose({baseName:"panel-view",template:sa,styles:xl}),Tl=(o,e)=>D`
	${X("flex")} :host {
		align-items: center;
		outline: none;
		height: calc(${x} * 7px);
		width: calc(${x} * 7px);
		margin: 0;
	}
	.progress {
		height: 100%;
		width: 100%;
	}
	.background {
		fill: none;
		stroke: transparent;
		stroke-width: calc(${x} / 2 * 1px);
	}
	.indeterminate-indicator-1 {
		fill: none;
		stroke: ${Da};
		stroke-width: calc(${x} / 2 * 1px);
		stroke-linecap: square;
		transform-origin: 50% 50%;
		transform: rotate(-90deg);
		transition: all 0.2s ease-in-out;
		animation: spin-infinite 2s linear infinite;
	}
	@keyframes spin-infinite {
		0% {
			stroke-dasharray: 0.01px 43.97px;
			transform: rotate(0deg);
		}
		50% {
			stroke-dasharray: 21.99px 21.99px;
			transform: rotate(450deg);
		}
		100% {
			stroke-dasharray: 0.01px 43.97px;
			transform: rotate(1080deg);
		}
	}
`;class Bl extends xt{connectedCallback(){super.connectedCallback(),this.paused&&(this.paused=!1),this.setAttribute("aria-label","Loading"),this.setAttribute("aria-live","assertive"),this.setAttribute("role","alert")}attributeChangedCallback(e,t,n){e==="value"&&this.removeAttribute("value")}}const Al=Bl.compose({baseName:"progress-ring",template:Jc,styles:Tl,indeterminateIndicator:`
		<svg class="progress" part="progress" viewBox="0 0 16 16">
			<circle
				class="background"
				part="background"
				cx="8px"
				cy="8px"
				r="7px"
			></circle>
			<circle
				class="indeterminate-indicator-1"
				part="indeterminate-indicator-1"
				cx="8px"
				cy="8px"
				r="7px"
			></circle>
		</svg>
	`}),Rl=(o,e)=>D`
	${X("flex")} :host {
		align-items: flex-start;
		margin: calc(${x} * 1px) 0;
		flex-direction: column;
	}
	.positioning-region {
		display: flex;
		flex-wrap: wrap;
	}
	:host([orientation='vertical']) .positioning-region {
		flex-direction: column;
	}
	:host([orientation='horizontal']) .positioning-region {
		flex-direction: row;
	}
	::slotted([slot='label']) {
		color: ${G};
		font-size: ${ee};
		margin: calc(${x} * 1px) 0;
	}
`;class Ol extends _e{connectedCallback(){super.connectedCallback();const e=this.querySelector("label");if(e){const t="radio-group-"+Math.random().toString(16).slice(2);e.setAttribute("id",t),this.setAttribute("aria-labelledby",t)}}}const _l=Ol.compose({baseName:"radio-group",template:Zc,styles:Rl}),Fl=(o,e)=>D`
	${X("inline-flex")} :host {
		align-items: center;
		flex-direction: row;
		font-size: ${ee};
		line-height: ${ne};
		margin: calc(${x} * 1px) 0;
		outline: none;
		position: relative;
		transition: all 0.2s ease-in-out;
		user-select: none;
	}
	.control {
		background: ${xe};
		border-radius: 999px;
		border: calc(${T} * 1px) solid ${nt};
		box-sizing: border-box;
		cursor: pointer;
		height: calc(${x} * 4px);
		position: relative;
		outline: none;
		width: calc(${x} * 4px);
	}
	.label {
		color: ${G};
		cursor: pointer;
		font-family: ${de};
		margin-inline-end: calc(${x} * 2px + 2px);
		padding-inline-start: calc(${x} * 2px + 2px);
	}
	.label__hidden {
		display: none;
		visibility: hidden;
	}
	.control,
	.checked-indicator {
		flex-shrink: 0;
	}
	.checked-indicator {
		background: ${G};
		border-radius: 999px;
		display: inline-block;
		inset: calc(${x} * 1px);
		opacity: 0;
		pointer-events: none;
		position: absolute;
	}
	:host(:not([disabled])) .control:hover {
		background: ${xe};
		border-color: ${nt};
	}
	:host(:not([disabled])) .control:active {
		background: ${xe};
		border-color: ${O};
	}
	:host(:${W}) .control {
		border: calc(${T} * 1px) solid ${O};
	}
	:host([aria-checked='true']) .control {
		background: ${xe};
		border: calc(${T} * 1px) solid ${nt};
	}
	:host([aria-checked='true']:not([disabled])) .control:hover {
		background: ${xe};
		border: calc(${T} * 1px) solid ${nt};
	}
	:host([aria-checked='true']:not([disabled])) .control:active {
		background: ${xe};
		border: calc(${T} * 1px) solid ${O};
	}
	:host([aria-checked="true"]:${W}:not([disabled])) .control {
		border: calc(${T} * 1px) solid ${O};
	}
	:host([disabled]) .label,
	:host([readonly]) .label,
	:host([readonly]) .control,
	:host([disabled]) .control {
		cursor: ${Re};
	}
	:host([aria-checked='true']) .checked-indicator {
		opacity: 1;
	}
	:host([disabled]) {
		opacity: ${Xe};
	}
`;class El extends Ao{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Radio")}}const Dl=El.compose({baseName:"radio",template:Kc,styles:Fl,checkedIndicator:`
		<div part="checked-indicator" class="checked-indicator"></div>
	`}),Pl=(o,e)=>D`
	${X("inline-block")} :host {
		box-sizing: border-box;
		font-family: ${de};
		font-size: ${cr};
		line-height: ${ar};
	}
	.control {
		background-color: ${lr};
		border: calc(${T} * 1px) solid ${In};
		border-radius: ${Ha};
		color: ${dr};
		padding: calc(${x} * 0.5px) calc(${x} * 1px);
		text-transform: uppercase;
	}
`;class Ll extends Wt{connectedCallback(){super.connectedCallback(),this.circular&&(this.circular=!1)}}const Hl=Ll.compose({baseName:"tag",template:Zi,styles:Pl}),Nl=(o,e)=>D`
	${X("inline-block")} :host {
		font-family: ${de};
		outline: none;
		user-select: none;
	}
	.control {
		box-sizing: border-box;
		position: relative;
		color: ${fr};
		background: ${Pe};
		border-radius: calc(${ye} * 1px);
		border: calc(${T} * 1px) solid ${Be};
		font: inherit;
		font-size: ${ee};
		line-height: ${ne};
		padding: calc(${x} * 2px + 1px);
		width: 100%;
		min-width: ${Sn};
		resize: none;
	}
	.control:hover:enabled {
		background: ${Pe};
		border-color: ${Be};
	}
	.control:active:enabled {
		background: ${Pe};
		border-color: ${O};
	}
	.control:hover,
	.control:${W},
	.control:disabled,
	.control:active {
		outline: none;
	}
	.control::-webkit-scrollbar {
		width: ${ma};
		height: ${ya};
	}
	.control::-webkit-scrollbar-corner {
		background: ${Pe};
	}
	.control::-webkit-scrollbar-thumb {
		background: ${xa};
	}
	.control::-webkit-scrollbar-thumb:hover {
		background: ${wa};
	}
	.control::-webkit-scrollbar-thumb:active {
		background: ${ka};
	}
	:host(:focus-within:not([disabled])) .control {
		border-color: ${O};
	}
	:host([resize='both']) .control {
		resize: both;
	}
	:host([resize='horizontal']) .control {
		resize: horizontal;
	}
	:host([resize='vertical']) .control {
		resize: vertical;
	}
	.label {
		display: block;
		color: ${G};
		cursor: pointer;
		font-size: ${ee};
		line-height: ${ne};
		margin-bottom: 2px;
	}
	.label__hidden {
		display: none;
		visibility: hidden;
	}
	:host([disabled]) .label,
	:host([readonly]) .label,
	:host([readonly]) .control,
	:host([disabled]) .control {
		cursor: ${Re};
	}
	:host([disabled]) {
		opacity: ${Xe};
	}
	:host([disabled]) .control {
		border-color: ${Be};
	}
`;class Vl extends te{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Text area")}}const Ml=Vl.compose({baseName:"text-area",template:ha,styles:Nl,shadowOptions:{delegatesFocus:!0}}),zl=(o,e)=>D`
	${X("inline-block")} :host {
		font-family: ${de};
		outline: none;
		user-select: none;
	}
	.root {
		box-sizing: border-box;
		position: relative;
		display: flex;
		flex-direction: row;
		color: ${fr};
		background: ${Pe};
		border-radius: calc(${ye} * 1px);
		border: calc(${T} * 1px) solid ${Be};
		height: calc(${so} * 1px);
		min-width: ${Sn};
	}
	.control {
		-webkit-appearance: none;
		font: inherit;
		background: transparent;
		border: 0;
		color: inherit;
		height: calc(100% - (${x} * 1px));
		width: 100%;
		margin-top: auto;
		margin-bottom: auto;
		border: none;
		padding: 0 calc(${x} * 2px + 1px);
		font-size: ${ee};
		line-height: ${ne};
	}
	.control:hover,
	.control:${W},
	.control:disabled,
	.control:active {
		outline: none;
	}
	.label {
		display: block;
		color: ${G};
		cursor: pointer;
		font-size: ${ee};
		line-height: ${ne};
		margin-bottom: 2px;
	}
	.label__hidden {
		display: none;
		visibility: hidden;
	}
	.start,
	.end {
		display: flex;
		margin: auto;
		fill: currentcolor;
	}
	::slotted(svg),
	::slotted(span) {
		width: calc(${x} * 4px);
		height: calc(${x} * 4px);
	}
	.start {
		margin-inline-start: calc(${x} * 2px);
	}
	.end {
		margin-inline-end: calc(${x} * 2px);
	}
	:host(:hover:not([disabled])) .root {
		background: ${Pe};
		border-color: ${Be};
	}
	:host(:active:not([disabled])) .root {
		background: ${Pe};
		border-color: ${O};
	}
	:host(:focus-within:not([disabled])) .root {
		border-color: ${O};
	}
	:host([disabled]) .label,
	:host([readonly]) .label,
	:host([readonly]) .control,
	:host([disabled]) .control {
		cursor: ${Re};
	}
	:host([disabled]) {
		opacity: ${Xe};
	}
	:host([disabled]) .control {
		border-color: ${Be};
	}
`;class jl extends se{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Text field")}}const ql=jl.compose({baseName:"text-field",template:fa,styles:zl,shadowOptions:{delegatesFocus:!0}}),Ul={vsCodeBadge:Ma,vsCodeButton:Wa,vsCodeCheckbox:Ya,vsCodeDataGrid:tl,vsCodeDataGridCell:rl,vsCodeDataGridRow:nl,vsCodeDivider:al,vsCodeDropdown:ul,vsCodeLink:bl,vsCodeOption:vl,vsCodePanels:kl,vsCodePanelTab:Cl,vsCodePanelView:Il,vsCodeProgressRing:Al,vsCodeRadioGroup:_l,vsCodeRadio:Dl,vsCodeTag:Hl,vsCodeTextArea:Ml,vsCodeTextField:ql,register(o,...e){if(!!o)for(const t in this)t!=="register"&&this[t]().register(o,...e)}};class Gl{constructor(){typeof acquireVsCodeApi=="function"&&(this.vsCodeApi=acquireVsCodeApi())}postMessage(e){this.vsCodeApi?this.vsCodeApi.postMessage(e):console.log(e)}getState(){if(this.vsCodeApi)return this.vsCodeApi.getState();{const e=localStorage.getItem("vscodeState");return e?JSON.parse(e):void 0}}setState(e){return this.vsCodeApi?this.vsCodeApi.setState(e):(localStorage.setItem("vscodeState",JSON.stringify(e)),e)}}const go=new Gl,pr=Symbol("store-raw"),vo=Symbol("store-node"),Wl=Symbol("store-name");function gr(o,e){let t=o[Me];if(!t){Object.defineProperty(o,Me,{value:t=new Proxy(o,Yl)});const n=Object.keys(o),i=Object.getOwnPropertyDescriptors(o);for(let r=0,s=n.length;r<s;r++){const c=n[r];if(i[c].get){const a=i[c].get.bind(t);Object.defineProperty(o,c,{get:a})}}}return t}function mo(o){return o!=null&&typeof o=="object"&&(o[Me]||!o.__proto__||o.__proto__===Object.prototype||Array.isArray(o))}function ze(o,e=new Set){let t,n,i,r;if(t=o!=null&&o[pr])return t;if(!mo(o)||e.has(o))return o;if(Array.isArray(o)){Object.isFrozen(o)?o=o.slice(0):e.add(o);for(let s=0,c=o.length;s<c;s++)i=o[s],(n=ze(i,e))!==i&&(o[s]=n)}else{Object.isFrozen(o)?o=Object.assign({},o):e.add(o);const s=Object.keys(o),c=Object.getOwnPropertyDescriptors(o);for(let a=0,l=s.length;a<l;a++)r=s[a],!c[r].get&&(i=o[r],(n=ze(i,e))!==i&&(o[r]=n))}return o}function yo(o){let e=o[vo];return e||Object.defineProperty(o,vo,{value:e={}}),e}function Ql(o,e){const t=Reflect.getOwnPropertyDescriptor(o,e);return!t||t.get||!t.configurable||e===Me||e===vo||e===Wl||(delete t.value,delete t.writable,t.get=()=>o[Me][e]),t}function Xl(o){if($i()){const e=yo(o);(e._||(e._=sn()))()}return Reflect.ownKeys(o)}function sn(){const[o,e]=Ue(void 0,{equals:!1,internal:!0});return o.$=e,o}const Yl={get(o,e,t){if(e===pr)return o;if(e===Me)return t;const n=o[e];if(e===vo||e==="__proto__")return n;const i=mo(n);if($i()&&(typeof n!="function"||o.hasOwnProperty(e))){let r,s;i&&(r=yo(n))&&(s=r._||(r._=sn()),s()),r=yo(o),s=r[e]||(r[e]=sn()),s()}return i?gr(n):n},set(){return!0},deleteProperty(){return!0},ownKeys:Xl,getOwnPropertyDescriptor:Ql};function vr(o,e,t){if(o[e]===t)return;const n=Array.isArray(o),i=o.length,r=t===void 0,s=n||r===e in o;r?delete o[e]:o[e]=t;let c=yo(o),a;(a=c[e])&&a.$(),n&&o.length!==i&&(a=c.length)&&a.$(),s&&(a=c._)&&a.$()}function Jl(o,e){const t=Object.keys(e);for(let n=0;n<t.length;n+=1){const i=t[n];vr(o,i,e[i])}}function It(o,e,t=[]){let n,i=o;if(e.length>1){n=e.shift();const s=typeof n,c=Array.isArray(o);if(Array.isArray(n)){for(let a=0;a<n.length;a++)It(o,[n[a]].concat(e),t);return}else if(c&&s==="function"){for(let a=0;a<o.length;a++)n(o[a],a)&&It(o,[a].concat(e),t);return}else if(c&&s==="object"){const{from:a=0,to:l=o.length-1,by:d=1}=n;for(let u=a;u<=l;u+=d)It(o,[u].concat(e),t);return}else if(e.length>1){It(o[n],e,[n].concat(t));return}i=o[n],t=[n].concat(t)}let r=e[0];typeof r=="function"&&(r=r(i,t),r===i)||n===void 0&&r==null||(r=ze(r),n===void 0||mo(i)&&mo(r)&&!Array.isArray(r)?Jl(i,r):vr(o,n,r))}function Tn(o,e){const t=ze(o||{}),n=gr(t);function i(...r){wi(()=>It(t,r))}return[n,i]}function xo(o){const e=document.getElementById("debug");e&&(e.innerHTML=`${e.innerHTML}
${o}`,e.scrollTop=e.scrollHeight)}function Zl(){const o={clusterInfo:{contextName:"kind-context",clusterName:"kind-cluster",clusterProvider:"Azure Arc",isClusterProviderUserOverride:!1,isAzure:!0},gitInfo:{name:"debug-standalone",url:"ssh://git@github.com/juozasg/pooodinfo.git",branch:"master"},namespaces:["default","flux-system","foobar"],sources:["podinfo","podinfo2","podinfo11"],selectSourceTab:!1,selectedSource:"podinfo2"};setTimeout(()=>{for(const[e,t]of Object.entries(o))mr(e,t)},100)}const[z,mr]=Tn({});function Kl(o){for(const[e,t]of Object.entries(o))mr(e,t);xo("params set:"),xo(JSON.stringify(z))}const[$e,bi]=Ue(!0),[Ye,Bn]=Ue(""),[$,R]=Tn({kind:"GitRepository",name:"podinfo",namespace:"flux-system",gitUrl:"https://github.com/stefanprodan/podinfo1",helmUrl:"https://stefanprodan.github.io/podinfo",ociUrl:"oci://ghcr.io/stefanprodan/manifests/podinfo",bucketEndpoint:"minio.minio.svc.cluster.local:9000",bucketName:"podinfo",bucketAccessKey:"",bucketSecretKey:"",bucketSecretRef:"",gitRef:"master",gitRefType:"branch",helmPassCredentials:!1,ociRef:"latest",ociRefType:"tag",ociProvider:"generic",interval:"1m0s",timeout:"5m0s",createFluxConfig:!0,azureScope:"cluster",insecure:!1,passCredentials:!1,username:"",password:"",secretRef:"",serviceAccount:"",caFile:"",certFile:"",certRef:"",privateKeyFile:"",keyFile:"",recurseSubmodules:!1}),[zt,ed]=Ue(!0),[_t,Le]=Tn({name:"podinfo",namespace:"flux-system",path:"/kustomize",targetNamespace:"default",dependsOn:"",prune:!0});function Go(o,e){e&&R(o,e)}Ge(()=>{Go("name",z.gitInfo?.name),Go("gitUrl",z.gitInfo?.url),Go("ref",z.gitInfo?.branch),z.selectedSource&&z.selectedSource!==""&&Bn(z.selectedSource)});function td(){const o=ze($);switch(o.kind){case"GitRepository":o[o.gitRefType]=o.gitRef;break;case"OCIRepository":o[o.ociRefType]=o.ociRef;break}for(const e in o)o[e]===""&&delete o[e];return o}function pi(){const o={};return $e()?o.source=td():o.selectedSource=Ye(),zt()&&(o.kustomization=ze(_t)),o.clusterInfo=ze(z).clusterInfo,o}function je(o,e){o.addEventListener("change",t=>{e()(o.currentValue)})}function Ve(o,e){o.addEventListener("change",t=>{e()(o.checked)})}function od(o,e){const[t,n]=e();Ge(()=>o.currentValue=t()),o.addEventListener("change",i=>n(o.currentValue))}function j(o,e){const[t,n,i]=e();Ge(()=>o.value=t[i]),o.addEventListener("input",r=>n(i,o.value))}const nd=C("<vscode-checkbox>Create a <code>Kustomization</code></vscode-checkbox>"),id=C("<div><label><code>Kustomization</code> Name</label><input></div>"),rd=C('<div><label>Namespace</label><div><vscode-dropdown class="medium"></vscode-dropdown></div></div>'),sd=C(`<div><label>File path in <code>GitRepository</code> '<!>'</label><input class="long"></div>`),cd=C('<div><label>Target Namespace</label><div><vscode-dropdown class="medium" style="margin-bottom: 0.5rem"></vscode-dropdown><div><i>Namespace for objects reconciled by the <code>Kustomization</code></i></div></div></div>'),ad=C('<div style="margin-top: 1.5rem"><label>Depends on <code>Kustomizations</code></label><input class="long"></div>'),ld=C("<div><vscode-checkbox checked>Prune (remove stale resources)</vscode-checkbox></div>"),dd=C('<div><h2>Create Kustomization <a href="https://fluxcd.io/flux/components/kustomize/kustomization/"><span class="codicon codicon-question"></span></a></h2><div style="margin-top: 1rem; margin-bottom: 2rem"></div></div>'),gi=C("<vscode-option></vscode-option>");let Wo,Qo,Xo;const ud=o=>Le("namespace",o),hd=o=>{o==="<unset>"?Le("targetNamespace",""):Le("targetNamespace",o)};function fd(){const o=()=>$e()?$.name:Ye(),e=()=>z.clusterInfo?.isAzure&&(!$e()||$.createFluxConfig);ke(()=>Xo.checked=zt()),ke(()=>Wo.currentValue=$.namespace),ke(()=>{e||(Qo.currentValue="default")});const t=()=>[...z.namespaces?.values()||[],"<unset>"];return(()=>{const n=dd.cloneNode(!0),i=n.firstChild,r=i.nextSibling;return y(r,w(re,{get when(){return $e()},get children(){const s=nd.cloneNode(!0);Ve(s,()=>ed);const c=Xo;return typeof c=="function"?c(s):Xo=s,s._$owner=v(),s}})),y(n,w(re,{get when(){return zt()},get children(){return[(()=>{const s=id.cloneNode(!0),c=s.firstChild,a=c.nextSibling;return j(a,()=>[_t,Le,"name"]),s})(),w(re,{get when(){return!e()},get children(){const s=rd.cloneNode(!0),c=s.firstChild,a=c.nextSibling,l=a.firstChild;je(l,()=>ud);const d=Wo;return typeof d=="function"?d(l):Wo=l,l._$owner=v(),y(l,w(Et,{get each(){return z.namespaces},children:(u,b)=>(()=>{const m=gi.cloneNode(!0);return m._$owner=v(),y(m,u),m})()})),s}}),(()=>{const s=sd.cloneNode(!0),c=s.firstChild,a=c.firstChild,l=a.nextSibling,d=l.nextSibling,u=d.nextSibling;u.nextSibling;const b=c.nextSibling;return y(c,o,u),j(b,()=>[_t,Le,"path"]),s})(),w(re,{get when(){return!e()},get children(){const s=cd.cloneNode(!0),c=s.firstChild,a=c.nextSibling,l=a.firstChild;je(l,()=>hd);const d=Qo;return typeof d=="function"?d(l):Qo=l,l._$owner=v(),y(l,w(Et,{get each(){return t()},children:(u,b)=>(()=>{const m=gi.cloneNode(!0);return m._$owner=v(),y(m,u),m})()})),s}}),(()=>{const s=ad.cloneNode(!0),c=s.firstChild,a=c.nextSibling;return j(a,()=>[_t,Le,"dependsOn"]),s})(),(()=>{const s=ld.cloneNode(!0),c=s.firstChild;return Ve(c,()=>a=>Le("prune",a)),c._$owner=v(),s})()]}}),null),n})()}const yr=o=>{let e;const t=Er({class:"",as:"div",value:!1},o);ke(()=>{t.value||(e.style.overflow="hidden",e.style.height="0px",e.style.display="none"),e.style.margin="0px",e.style.padding="0px",e.style.border="0px"}),Ge(i=>{const r=t.value;return We(()=>{if(i!==r){let s,c;const a=l=>{if(typeof c>"u")return c=l,r?(e.style.height="0px",requestAnimationFrame(a)):(e.style.height=`${e.scrollHeight}px`,requestAnimationFrame(a));typeof c=="number"&&(r?(e.style.display="block",e.style.height=`${e.scrollHeight}px`):(e.style.overflow="hidden",e.style.height="0px"))};s=requestAnimationFrame(a),ki(()=>cancelAnimationFrame(s))}}),r});const n=()=>{t.value?(e.style.overflow="visible",e.style.height="auto"):e.style.display="none"};return w(rs,{get id(){return t.id},ref:i=>e=i,get["aria-labelledby"](){return t["aria-labelledby"]},get role(){return t.role},get component(){return t.as},get class(){return t.class},onTransitionEnd:n,get children(){return t.children}})},bd=C('<div><div><label>Repository sync interval</label><div class="flex-row"><input class="short-number"></div></div><div><label>Repository sync timeout</label><div class="flex-row"><input class="short-number"></div></div></div>');function xr(){return(()=>{const o=bd.cloneNode(!0),e=o.firstChild,t=e.firstChild,n=t.nextSibling,i=n.firstChild,r=e.nextSibling,s=r.firstChild,c=s.nextSibling,a=c.firstChild;return j(i,()=>[$,R,"interval"]),j(a,()=>[$,R,"timeout"]),o})()}const pd=C('<div><div><label>Git Implementation <a href="https://fluxcd.io/flux/components/source/gitrepositories/#git-implementation"><span class="codicon codicon-question"></span></a></label><vscode-radio-group><vscode-radio checked>go-git</vscode-radio><vscode-radio>libgit2</vscode-radio></vscode-radio-group></div><div style="margin-top: 1rem"><vscode-checkbox>Recurse submodules</vscode-checkbox><div><i>When enabled, configures the GitRepository source to initialize and include Git submodules in the artifact it produces</i></div></div><vscode-divider></vscode-divider><div><label>Path to TLS CA file used for validating self-signed certificates</label><input class="long"></div><div><label>Path to a passwordless private key file used <br>for authenticating to the Git SSH server</label><input class="long"></div><div><label>Basic authentication username</label><input class="medium"></div><div><label>Basic authentication password</label><input type="password" class="medium"></div><div><label>The name of an existing secret containing SSH or basic credentials</label><input class="medium"></div></div>');function gd(o){o&&R("gitImplementation","go-git")}function vd(o){o&&R("gitImplementation","libgit2")}function md(){return(()=>{const o=pd.cloneNode(!0),e=o.firstChild,t=e.firstChild,n=t.nextSibling,i=n.firstChild,r=i.nextSibling,s=e.nextSibling,c=s.firstChild,a=s.nextSibling,l=a.nextSibling,d=l.firstChild,u=d.nextSibling,b=l.nextSibling,m=b.firstChild,k=m.nextSibling,A=b.nextSibling,N=A.firstChild,ge=N.nextSibling,U=A.nextSibling,ce=U.firstChild,ue=ce.nextSibling,Te=U.nextSibling,Ro=Te.firstChild,Cr=Ro.nextSibling;return n._$owner=v(),Ve(i,()=>gd),i._$owner=v(),Ve(r,()=>vd),r._$owner=v(),Ve(c,()=>Sr=>R("recurseSubmodules",Sr)),c._$owner=v(),a._$owner=v(),j(u,()=>[$,R,"caFile"]),j(k,()=>[$,R,"privateKeyFile"]),j(ge,()=>[$,R,"username"]),j(ue,()=>[$,R,"password"]),j(Cr,()=>[$,R,"secretRef"]),o})()}const yd=C('<div style="margin-top: 1rem"><div><vscode-checkbox>Create with FluxConfig</vscode-checkbox><div><i>A new <code>FluxConfig</code> resource will be created to manage this <code>Kustomization</code></i></div></div><div style="margin-top: 1.5rem"><label>Scope</label><div><vscode-dropdown><vscode-option>cluster</vscode-option><vscode-option>namespace</vscode-option></vscode-dropdown></div></div></div>');let Yo;const xd=o=>R("azureScope",o);function wd(){return ke(()=>Yo.checked=$.createFluxConfig),(()=>{const o=yd.cloneNode(!0),e=o.firstChild,t=e.firstChild,n=e.nextSibling,i=n.firstChild,r=i.nextSibling,s=r.firstChild,c=s.firstChild,a=c.nextSibling;Ve(t,()=>d=>R("createFluxConfig",d));const l=Yo;return typeof l=="function"?l(t):Yo=t,t._$owner=v(),je(s,()=>xd),s._$owner=v(),c._$owner=v(),a._$owner=v(),o})()}const kd=C('<vscode-panel-tab id="git-azure-tab">Azure</vscode-panel-tab>'),$d=C("<vscode-panel-view></vscode-panel-view>"),Cd=C('<div><vscode-panels activeid="git-intervals-tab" aria-label="Advanced GitRepository source settings"><vscode-panel-tab id="git-intervals-tab">Intervals</vscode-panel-tab><vscode-panel-tab id="git-connection-tab">Connection</vscode-panel-tab><vscode-panel-view></vscode-panel-view><vscode-panel-view></vscode-panel-view></vscode-panels></div>'),Sd=C('<div class="collapsable"><h3 class="collapse-toggle"><span></span> Advanced Settings</h3></div>');function Id(){const[o,e]=Ue(!1);return(()=>{const t=Sd.cloneNode(!0),n=t.firstChild,i=n.firstChild;return n.$$click=()=>e(!o()),y(t,w(yr,{get value(){return o()},class:"collapse-transition",get children(){const r=Cd.cloneNode(!0),s=r.firstChild,c=s.firstChild,a=c.nextSibling,l=a.nextSibling,d=l.nextSibling;return s._$owner=v(),c._$owner=v(),a._$owner=v(),y(s,w(re,{get when(){return z.clusterInfo?.isAzure},get children(){const u=kd.cloneNode(!0);return u._$owner=v(),u}}),l),l._$owner=v(),y(l,w(xr,{})),d._$owner=v(),y(d,w(md,{})),y(s,w(re,{get when(){return z.clusterInfo?.isAzure},get children(){const u=$d.cloneNode(!0);return u._$owner=v(),y(u,w(wd,{})),u}}),null),r}}),null),Ce(r=>{const s=o(),c=`codicon ${o()?"codicon-chevron-down":"codicon-chevron-right"}`;return s!==r._v$&&n.classList.toggle("open",r._v$=s),c!==r._v$2&&(i.className=r._v$2=c),r},{_v$:void 0,_v$2:void 0}),t})()}wo(["click"]);const Td=C('<div><label><code></code> Name</label><input class="medium"></div>');function wr(){return(()=>{const o=Td.cloneNode(!0),e=o.firstChild,t=e.firstChild,n=e.nextSibling;return y(t,()=>$.kind),j(n,()=>[$,R,"name"]),o})()}const Bd=C('<div><label>Namespace</label><div><vscode-dropdown class="medium"></vscode-dropdown></div></div>'),Ad=C("<vscode-option></vscode-option>");let to;const Rd=o=>R("namespace",o);function kr(){return ke(()=>{console.log(to),console.log($.namespace),to.currentValue=$.namespace}),(()=>{const o=Bd.cloneNode(!0),e=o.firstChild,t=e.nextSibling,n=t.firstChild;je(n,()=>Rd);const i=to;return typeof i=="function"?i(n):to=n,n._$owner=v(),y(n,w(Et,{get each(){return z.namespaces},children:(r,s)=>(()=>{const c=Ad.cloneNode(!0);return c._$owner=v(),y(c,r),c})()})),o})()}const Od=C('<div><div><label>Repository URL</label><input class="long"></div><div><label>Reference</label><div class="flex-row"><vscode-dropdown><vscode-option>branch</vscode-option><vscode-option>tag</vscode-option><vscode-option>semver</vscode-option></vscode-dropdown><input style="margin-left: 4px; width: 23rem !important"></div></div></div>'),_d=o=>R("gitRefType",o);function Fd(){return(()=>{const o=Od.cloneNode(!0),e=o.firstChild,t=e.firstChild,n=t.nextSibling,i=e.nextSibling,r=i.firstChild,s=r.nextSibling,c=s.firstChild,a=c.firstChild,l=a.nextSibling,d=l.nextSibling,u=c.nextSibling;return y(o,w(wr,{}),e),y(o,w(kr,{}),e),j(n,()=>[$,R,"gitUrl"]),je(c,()=>_d),c._$owner=v(),a._$owner=v(),l._$owner=v(),d._$owner=v(),j(u,()=>[$,R,"gitRef"]),y(o,w(Id,{}),null),o})()}const Ed=C('<div><div style="margin-bottom: 1rem"><i>Authentication settings for private repositories</i></div><div><label>OCI Provider</label><div class="flex-row"><vscode-dropdown><vscode-option>generic</vscode-option><vscode-option>aws</vscode-option><vscode-option>azure</vscode-option><vscode-option>gcp</vscode-option></vscode-dropdown></div></div><div><label><code>Secret</code> with authentication credentials for the repository <a href="https://fluxcd.io/flux/components/source/ocirepositories/#secret-reference"><span class="codicon codicon-question"></span></a></label><input class="long"></div><div><label><code>ServiceAccount</code> with image pull secrets for authentication</label><input class="long"></div></div>'),Dd=o=>R("ociProvider",o);function Pd(){return(()=>{const o=Ed.cloneNode(!0),e=o.firstChild,t=e.nextSibling,n=t.firstChild,i=n.nextSibling,r=i.firstChild,s=r.firstChild,c=s.nextSibling,a=c.nextSibling,l=a.nextSibling,d=t.nextSibling,u=d.firstChild,b=u.nextSibling,m=d.nextSibling,k=m.firstChild,A=k.nextSibling;return je(r,()=>Dd),r._$owner=v(),s._$owner=v(),c._$owner=v(),a._$owner=v(),l._$owner=v(),j(b,()=>[$,R,"secretRef"]),j(A,()=>[$,R,"serviceAccount"]),o})()}const Ld=C('<div><div style="margin-bottom: 1rem"><vscode-checkbox>Allow insecure (non-TLS) connection to the registry</vscode-checkbox></div><div><label><code>Secret</code> used for TLS certificates <a href="https://fluxcd.io/flux/components/source/ocirepositories/#tls-certificates"><span class="codicon codicon-question"></span></a></label><input class="long"></div></div>');function Hd(){return(()=>{const o=Ld.cloneNode(!0),e=o.firstChild,t=e.firstChild,n=e.nextSibling,i=n.firstChild,r=i.nextSibling;return Ve(t,()=>s=>R("insecure",s)),t._$owner=v(),j(r,()=>[$,R,"certRef"]),o})()}const Nd=C('<div><vscode-panels activeid="oci-intervals-tab" aria-label="Advanced OCIRepository source settings"><vscode-panel-tab id="oci-intervals-tab">Intervals</vscode-panel-tab><vscode-panel-tab id="oci-connection-tab">Connection</vscode-panel-tab><vscode-panel-tab id="oci-tls-tab">TLS</vscode-panel-tab><vscode-panel-view></vscode-panel-view><vscode-panel-view></vscode-panel-view><vscode-panel-view></vscode-panel-view></vscode-panels></div>'),Vd=C('<div class="collapsable"><h3 class="collapse-toggle"><span></span> Advanced Settings</h3></div>');function Md(){const[o,e]=Ue(!1);return(()=>{const t=Vd.cloneNode(!0),n=t.firstChild,i=n.firstChild;return n.$$click=()=>e(!o()),y(t,w(yr,{get value(){return o()},class:"collapse-transition",get children(){const r=Nd.cloneNode(!0),s=r.firstChild,c=s.firstChild,a=c.nextSibling,l=a.nextSibling,d=l.nextSibling,u=d.nextSibling,b=u.nextSibling;return s._$owner=v(),c._$owner=v(),a._$owner=v(),l._$owner=v(),d._$owner=v(),y(d,w(xr,{})),u._$owner=v(),y(u,w(Pd,{})),b._$owner=v(),y(b,w(Hd,{})),r}}),null),Ce(r=>{const s=o(),c=`codicon ${o()?"codicon-chevron-down":"codicon-chevron-right"}`;return s!==r._v$&&n.classList.toggle("open",r._v$=s),c!==r._v$2&&(i.className=r._v$2=c),r},{_v$:void 0,_v$2:void 0}),t})()}wo(["click"]);const zd=C('<div><div><label>Repository URL</label><input class="long"></div><div><label>Reference</label><div class="flex-row"><vscode-dropdown><vscode-option>tag</vscode-option><vscode-option>semver</vscode-option><vscode-option>digest</vscode-option></vscode-dropdown><input style="margin-left: 4px; width: 23rem !important"></div></div></div>'),jd=o=>R("ociRefType",o);function qd(){return(()=>{const o=zd.cloneNode(!0),e=o.firstChild,t=e.firstChild,n=t.nextSibling,i=e.nextSibling,r=i.firstChild,s=r.nextSibling,c=s.firstChild,a=c.firstChild,l=a.nextSibling,d=l.nextSibling,u=c.nextSibling;return y(o,w(wr,{}),e),y(o,w(kr,{}),e),j(n,()=>[$,R,"ociUrl"]),je(c,()=>jd),c._$owner=v(),a._$owner=v(),l._$owner=v(),d._$owner=v(),j(u,()=>[$,R,"ociRef"]),y(o,w(Md,{}),null),o})()}const Ud=C('<div><vscode-panels aria-label="Type of source"><vscode-panel-tab id="GitRepository-tab">GitRepository&nbsp;<a href="https://fluxcd.io/flux/components/source/gitrepositories/"><span class="codicon codicon-question"></span></a></vscode-panel-tab><vscode-panel-tab id="OCIRepository-tab">OCIRepository&nbsp;<a href="https://fluxcd.io/flux/components/source/ocirepositories/"><span class="codicon codicon-question"></span></a></vscode-panel-tab><vscode-panel-view></vscode-panel-view><vscode-panel-view></vscode-panel-view></vscode-panels></div>');let oo;function Gd(){return ke(()=>{oo.addEventListener("change",o=>{const e=oo.activeid.slice(0,-4);R("kind",e)})}),(()=>{const o=Ud.cloneNode(!0),e=o.firstChild,t=e.firstChild,n=t.nextSibling,i=n.nextSibling,r=i.nextSibling,s=oo;return typeof s=="function"?s(e):oo=e,e._$owner=v(),t._$owner=v(),n._$owner=v(),i._$owner=v(),y(i,w(Fd,{})),r._$owner=v(),y(r,w(qd,{})),Ce(()=>e.activeid=`${$.kind}-tab`),o})()}const Wd=C("<vscode-option></vscode-option>"),Qd=C('<div><vscode-dropdown position="below" class="medium"></vscode-dropdown></div>');Ge(()=>{xo(`selectedSource()=${Ye()}`)});function Xd(o,e){return e()===0&&Ye()===""&&Bn(o),(()=>{const t=Wd.cloneNode(!0);return t._$owner=v(),y(t,o),t})()}function Yd(){return(()=>{const o=Qd.cloneNode(!0),e=o.firstChild;return od(e,()=>[Ye,Bn]),e._$owner=v(),y(e,w(Et,{get each(){return z.sources},children:(t,n)=>Xd(t,n)})),o})()}const Jd=C('<vscode-panel-tab id="select-source-tab">Select Source</vscode-panel-tab>'),Zd=C("<vscode-panel-view></vscode-panel-view>"),Kd=C('<div><h2 style="margin-bottom: 0.5rem !important">Source Repository</h2><vscode-panels id="source-panel" aria-label="New or select source?" activeid="new-source-tab"><vscode-panel-tab id="new-source-tab">New Source...</vscode-panel-tab><vscode-panel-view></vscode-panel-view></vscode-panels></div>');let Ze;function eu(){const o=()=>z.sources?.length>0;return ke(()=>{Ze.addEventListener("change",e=>bi(Ze.activeid==="new-source-tab"))}),Ge(()=>{const e=z.selectSourceTab&&z.sources?.length>0?"select-source-tab":"new-source-tab";Ze.activeid=e,bi(Ze.activeid==="new-source-tab")}),(()=>{const e=Kd.cloneNode(!0),t=e.firstChild,n=t.nextSibling,i=n.firstChild,r=i.nextSibling,s=Ze;return typeof s=="function"?s(n):Ze=n,n._$owner=v(),i._$owner=v(),y(n,w(re,{get when(){return o()},get children(){const c=Jd.cloneNode(!0);return c._$owner=v(),c}}),r),r._$owner=v(),y(r,w(Gd,{})),y(n,w(re,{get when(){return o()},get children(){const c=Zd.cloneNode(!0);return c._$owner=v(),y(c,w(Yd,{})),c}}),null),e})()}const tu=C("<p> <code></code> '<!>'</p>"),ou=C("<p>Create new <code>Kustomization</code> '<!>' for the <code></code></p>"),nu=C("<p>No actions selected</p>"),iu=C('<vscode-button class="big"><span class="yaml">YAML</span><span slot="start" class="codicon codicon-output"></span></vscode-button>'),ru=C('<vscode-button class="big"><span class="create">Create</span><span slot="start" class="codicon codicon-add"></span></vscode-button>'),su=C('<main><textarea id="debug" style="display: none; height:220px">---</textarea><h1>Configure GitOps </h1><vscode-divider></vscode-divider><vscode-divider></vscode-divider><vscode-divider></vscode-divider><div class="actions"><h2 style="margin-bottom: 2rem">Actions</h2></div></main>'),cu=C('<p class="error"> missing</p>'),vi=()=>$e()?$.kind:Ye().split("/")[0],au=()=>$e()?$.name:Ye().split("/")[1],lu=()=>$e()?"Create new":"Use existing",Jo=()=>!zt()&&!$e();function du(){const o=go.vsCodeApi?"":"| DEBUG";return(()=>{const e=su.cloneNode(!0),t=e.firstChild,n=t.nextSibling;n.firstChild;const i=n.nextSibling,r=i.nextSibling,s=r.nextSibling,c=s.nextSibling;return c.firstChild,y(n,o,null),i._$owner=v(),y(e,w(eu,{}),r),r._$owner=v(),y(e,w(fd,{}),s),s._$owner=v(),y(c,w(re,{get when(){return!Jo()},get children(){const a=tu.cloneNode(!0),l=a.firstChild,d=l.nextSibling,u=d.nextSibling,b=u.nextSibling;return b.nextSibling,y(a,lu,l),y(d,vi),y(a,au,b),a}}),null),y(c,w(re,{get when(){return zt()},get children(){const a=ou.cloneNode(!0),l=a.firstChild,d=l.nextSibling,u=d.nextSibling,b=u.nextSibling,m=b.nextSibling,k=m.nextSibling;return y(a,()=>_t.name,b),y(k,vi),a}}),null),y(c,w(re,{get when(){return Jo()},get children(){return nu.cloneNode(!0)}}),null),y(c,w(re,{get when(){return jr(()=>!Jo(),!0)()&&$r().length===0},get children(){return[(()=>{const a=iu.cloneNode(!0);return a.$$click=()=>mi("show-yaml"),a._$owner=v(),a})(),(()=>{const a=ru.cloneNode(!0);return a.$$click=()=>mi("create"),a._$owner=v(),a})()]}}),null),y(c,uu,null),e})()}function uu(){const o=$r();return w(re,{get when(){return o.length>0},get children(){return w(Et,{each:o,children:(e,t)=>(()=>{const n=cu.cloneNode(!0),i=n.firstChild;return y(n,e,i),n})()})}})}function $r(){if(!$e())return[];const o=[];switch($.name?.length>0||o.push("Source name"),$.kind){case"GitRepository":$.gitUrl?.length>0||o.push("Repository URL"),$.gitRef?.length>0||o.push("Source branch, tag or semver");break;case"HelmRepository":$.helmUrl?.length>0||o.push("Repository URL");break;case"OCIRepository":$.ociUrl?.length>0||o.push("Repository URL"),$.ociRef?.length>0||o.push("Source tag, semver or digest");break;case"Bucket":$.bucketName?.length>0||o.push("Bucket name"),$.bucketEndpoint?.length>0||o.push("Bucket endpoint"),$.bucketInsecure&&($.bucketAccessKey?.length>0||o.push("Bucket Access Key"),(!($.bucketSecretKey?.length>0)||!($.bucketSecretRef?.length>0))&&o.push("Bucket Secret Key or Secret Ref"));break}return o}wo(["click"]);pa().register(Ul);function hu(){window.addEventListener("message",o=>{const e=o.data;switch(e.type){case"set-params":Kl(e.params);break}})}function mi(o){go.postMessage({action:o,data:pi()}),console.log(pi())}function fu(){return ke(()=>{xo("App mounted"),go.postMessage({action:"init-view"}),hu(),go.vsCodeApi||Zl()}),w(du,{})}Ur(()=>w(fu,{}),document.getElementById("root"));
