import{r as d}from"./index.RH_Wq4ov.js";var i={exports:{}},e={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var a;function p(){if(a)return e;a=1;var n=Symbol.for("react.transitional.element"),u=Symbol.for("react.fragment");function x(l,r,t){var s=null;if(t!==void 0&&(s=""+t),r.key!==void 0&&(s=""+r.key),"key"in r){t={};for(var o in r)o!=="key"&&(t[o]=r[o])}else t=r;return r=t.ref,{$$typeof:n,type:l,key:s,ref:r!==void 0?r:null,props:t}}return e.Fragment=u,e.jsx=x,e.jsxs=x,e}var R;function v(){return R||(R=1,i.exports=p()),i.exports}var E=v();function f(){const[n,u]=d.useState(0);return E.jsxs("button",{onClick:()=>u(n+1),children:["Count: ",n]})}export{f as default};
