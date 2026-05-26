import{l as je}from"./settings-DYZYe1iw.js";const G=200,ze={term:"/api/analyze/terms",sensational:"/api/analyze/sensational",quantitative:"/api/analyze/quantitative",context:"/api/analyze/context"},qe="/api/analyze/briefing",Ve="/api/analyze/oneline",Ye="/api/rewrite/sensational",Je={fact_claim:"사실주장",opinion:"의견/해석",value_judgment:"가치판단",sensational:"자극표현",evidence:"근거제시",causation:"인과주장",prediction:"예측"},Ke=["fact_claim","opinion","value_judgment","sensational","evidence","causation","prediction"],Qe="/api/analyze/character";var Oe={exports:{}};(function(a){function l(e,t){if(t&&t.documentElement)e=t,t=arguments[2];else if(!e||!e.documentElement)throw new Error("First argument to Readability constructor should be a document object.");if(t=t||{},this._doc=e,this._docJSDOMParser=this._doc.firstChild.__JSDOMParser__,this._articleTitle=null,this._articleByline=null,this._articleDir=null,this._articleSiteName=null,this._attempts=[],this._metadata={},this._debug=!!t.debug,this._maxElemsToParse=t.maxElemsToParse||this.DEFAULT_MAX_ELEMS_TO_PARSE,this._nbTopCandidates=t.nbTopCandidates||this.DEFAULT_N_TOP_CANDIDATES,this._charThreshold=t.charThreshold||this.DEFAULT_CHAR_THRESHOLD,this._classesToPreserve=this.CLASSES_TO_PRESERVE.concat(t.classesToPreserve||[]),this._keepClasses=!!t.keepClasses,this._serializer=t.serializer||function(i){return i.innerHTML},this._disableJSONLD=!!t.disableJSONLD,this._allowedVideoRegex=t.allowedVideoRegex||this.REGEXPS.videos,this._linkDensityModifier=t.linkDensityModifier||0,this._flags=this.FLAG_STRIP_UNLIKELYS|this.FLAG_WEIGHT_CLASSES|this.FLAG_CLEAN_CONDITIONALLY,this._debug){let i=function(r){if(r.nodeType==r.TEXT_NODE)return`${r.nodeName} ("${r.textContent}")`;let n=Array.from(r.attributes||[],function(s){return`${s.name}="${s.value}"`}).join(" ");return`<${r.localName} ${n}>`};this.log=function(){if(typeof console<"u"){let n=Array.from(arguments,s=>s&&s.nodeType==this.ELEMENT_NODE?i(s):s);n.unshift("Reader: (Readability)"),console.log(...n)}else if(typeof dump<"u"){var r=Array.prototype.map.call(arguments,function(n){return n&&n.nodeName?i(n):n}).join(" ");dump("Reader: (Readability) "+r+`
`)}}}else this.log=function(){}}l.prototype={FLAG_STRIP_UNLIKELYS:1,FLAG_WEIGHT_CLASSES:2,FLAG_CLEAN_CONDITIONALLY:4,ELEMENT_NODE:1,TEXT_NODE:3,DEFAULT_MAX_ELEMS_TO_PARSE:0,DEFAULT_N_TOP_CANDIDATES:5,DEFAULT_TAGS_TO_SCORE:"section,h2,h3,h4,h5,h6,p,td,pre".toUpperCase().split(","),DEFAULT_CHAR_THRESHOLD:500,REGEXPS:{unlikelyCandidates:/-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,okMaybeItsACandidate:/and|article|body|column|content|main|shadow/i,positive:/article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story/i,negative:/-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|footer|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|widget/i,extraneous:/print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single|utility/i,byline:/byline|author|dateline|writtenby|p-author/i,replaceFonts:/<(\/?)font[^>]*>/gi,normalize:/\s{2,}/g,videos:/\/\/(www\.)?((dailymotion|youtube|youtube-nocookie|player\.vimeo|v\.qq)\.com|(archive|upload\.wikimedia)\.org|player\.twitch\.tv)/i,shareElements:/(\b|_)(share|sharedaddy)(\b|_)/i,nextLink:/(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i,prevLink:/(prev|earl|old|new|<|«)/i,tokenize:/\W+/g,whitespace:/^\s*$/,hasContent:/\S$/,hashUrl:/^#.+/,srcsetUrl:/(\S+)(\s+[\d.]+[xw])?(\s*(?:,|$))/g,b64DataUrl:/^data:\s*([^\s;,]+)\s*;\s*base64\s*,/i,commas:/\u002C|\u060C|\uFE50|\uFE10|\uFE11|\u2E41|\u2E34|\u2E32|\uFF0C/g,jsonLdArticleTypes:/^Article|AdvertiserContentArticle|NewsArticle|AnalysisNewsArticle|AskPublicNewsArticle|BackgroundNewsArticle|OpinionNewsArticle|ReportageNewsArticle|ReviewNewsArticle|Report|SatiricalArticle|ScholarlyArticle|MedicalScholarlyArticle|SocialMediaPosting|BlogPosting|LiveBlogPosting|DiscussionForumPosting|TechArticle|APIReference$/,adWords:/^(ad(vertising|vertisement)?|pub(licité)?|werb(ung)?|广告|Реклама|Anuncio)$/iu,loadingWords:/^((loading|正在加载|Загрузка|chargement|cargando)(…|\.\.\.)?)$/iu},UNLIKELY_ROLES:["menu","menubar","complementary","navigation","alert","alertdialog","dialog"],DIV_TO_P_ELEMS:new Set(["BLOCKQUOTE","DL","DIV","IMG","OL","P","PRE","TABLE","UL"]),ALTER_TO_DIV_EXCEPTIONS:["DIV","ARTICLE","SECTION","P","OL","UL"],PRESENTATIONAL_ATTRIBUTES:["align","background","bgcolor","border","cellpadding","cellspacing","frame","hspace","rules","style","valign","vspace"],DEPRECATED_SIZE_ATTRIBUTE_ELEMS:["TABLE","TH","TD","HR","PRE"],PHRASING_ELEMS:["ABBR","AUDIO","B","BDO","BR","BUTTON","CITE","CODE","DATA","DATALIST","DFN","EM","EMBED","I","IMG","INPUT","KBD","LABEL","MARK","MATH","METER","NOSCRIPT","OBJECT","OUTPUT","PROGRESS","Q","RUBY","SAMP","SCRIPT","SELECT","SMALL","SPAN","STRONG","SUB","SUP","TEXTAREA","TIME","VAR","WBR"],CLASSES_TO_PRESERVE:["page"],HTML_ESCAPE_MAP:{lt:"<",gt:">",amp:"&",quot:'"',apos:"'"},_postProcessContent(e){this._fixRelativeUris(e),this._simplifyNestedElements(e),this._keepClasses||this._cleanClasses(e)},_removeNodes(e,t){if(this._docJSDOMParser&&e._isLiveNodeList)throw new Error("Do not pass live node lists to _removeNodes");for(var i=e.length-1;i>=0;i--){var r=e[i],n=r.parentNode;n&&(!t||t.call(this,r,i,e))&&n.removeChild(r)}},_replaceNodeTags(e,t){if(this._docJSDOMParser&&e._isLiveNodeList)throw new Error("Do not pass live node lists to _replaceNodeTags");for(const i of e)this._setNodeTag(i,t)},_forEachNode(e,t){Array.prototype.forEach.call(e,t,this)},_findNode(e,t){return Array.prototype.find.call(e,t,this)},_someNode(e,t){return Array.prototype.some.call(e,t,this)},_everyNode(e,t){return Array.prototype.every.call(e,t,this)},_getAllNodesWithTag(e,t){return e.querySelectorAll?e.querySelectorAll(t.join(",")):[].concat.apply([],t.map(function(i){var r=e.getElementsByTagName(i);return Array.isArray(r)?r:Array.from(r)}))},_cleanClasses(e){var t=this._classesToPreserve,i=(e.getAttribute("class")||"").split(/\s+/).filter(r=>t.includes(r)).join(" ");for(i?e.setAttribute("class",i):e.removeAttribute("class"),e=e.firstElementChild;e;e=e.nextElementSibling)this._cleanClasses(e)},_isUrl(e){try{return new URL(e),!0}catch{return!1}},_fixRelativeUris(e){var t=this._doc.baseURI,i=this._doc.documentURI;function r(o){if(t==i&&o.charAt(0)=="#")return o;try{return new URL(o,t).href}catch{}return o}var n=this._getAllNodesWithTag(e,["a"]);this._forEachNode(n,function(o){var h=o.getAttribute("href");if(h)if(h.indexOf("javascript:")===0)if(o.childNodes.length===1&&o.childNodes[0].nodeType===this.TEXT_NODE){var d=this._doc.createTextNode(o.textContent);o.parentNode.replaceChild(d,o)}else{for(var c=this._doc.createElement("span");o.firstChild;)c.appendChild(o.firstChild);o.parentNode.replaceChild(c,o)}else o.setAttribute("href",r(h))});var s=this._getAllNodesWithTag(e,["img","picture","figure","video","audio","source"]);this._forEachNode(s,function(o){var h=o.getAttribute("src"),d=o.getAttribute("poster"),c=o.getAttribute("srcset");if(h&&o.setAttribute("src",r(h)),d&&o.setAttribute("poster",r(d)),c){var u=c.replace(this.REGEXPS.srcsetUrl,function(g,f,b,k){return r(f)+(b||"")+k});o.setAttribute("srcset",u)}})},_simplifyNestedElements(e){for(var t=e;t;){if(t.parentNode&&["DIV","SECTION"].includes(t.tagName)&&!(t.id&&t.id.startsWith("readability"))){if(this._isElementWithoutContent(t)){t=this._removeAndGetNext(t);continue}else if(this._hasSingleTagInsideElement(t,"DIV")||this._hasSingleTagInsideElement(t,"SECTION")){for(var i=t.children[0],r=0;r<t.attributes.length;r++)i.setAttributeNode(t.attributes[r].cloneNode());t.parentNode.replaceChild(i,t),t=i;continue}}t=this._getNextNode(t)}},_getArticleTitle(){var e=this._doc,t="",i="";try{t=i=e.title.trim(),typeof t!="string"&&(t=i=this._getInnerText(e.getElementsByTagName("title")[0]))}catch{}var r=!1;function n(u){return u.split(/\s+/).length}if(/ [\|\-\\\/>»] /.test(t)){r=/ [\\\/>»] /.test(t);let u=Array.from(i.matchAll(/ [\|\-\\\/>»] /gi));t=i.substring(0,u.pop().index),n(t)<3&&(t=i.replace(/^[^\|\-\\\/>»]*[\|\-\\\/>»]/gi,""))}else if(t.includes(": ")){var s=this._getAllNodesWithTag(e,["h1","h2"]),o=t.trim(),h=this._someNode(s,function(u){return u.textContent.trim()===o});h||(t=i.substring(i.lastIndexOf(":")+1),n(t)<3?t=i.substring(i.indexOf(":")+1):n(i.substr(0,i.indexOf(":")))>5&&(t=i))}else if(t.length>150||t.length<15){var d=e.getElementsByTagName("h1");d.length===1&&(t=this._getInnerText(d[0]))}t=t.trim().replace(this.REGEXPS.normalize," ");var c=n(t);return c<=4&&(!r||c!=n(i.replace(/[\|\-\\\/>»]+/g,""))-1)&&(t=i),t},_prepDocument(){var e=this._doc;this._removeNodes(this._getAllNodesWithTag(e,["style"])),e.body&&this._replaceBrs(e.body),this._replaceNodeTags(this._getAllNodesWithTag(e,["font"]),"SPAN")},_nextNode(e){for(var t=e;t&&t.nodeType!=this.ELEMENT_NODE&&this.REGEXPS.whitespace.test(t.textContent);)t=t.nextSibling;return t},_replaceBrs(e){this._forEachNode(this._getAllNodesWithTag(e,["br"]),function(t){for(var i=t.nextSibling,r=!1;(i=this._nextNode(i))&&i.tagName=="BR";){r=!0;var n=i.nextSibling;i.remove(),i=n}if(r){var s=this._doc.createElement("p");for(t.parentNode.replaceChild(s,t),i=s.nextSibling;i;){if(i.tagName=="BR"){var o=this._nextNode(i.nextSibling);if(o&&o.tagName=="BR")break}if(!this._isPhrasingContent(i))break;var h=i.nextSibling;s.appendChild(i),i=h}for(;s.lastChild&&this._isWhitespace(s.lastChild);)s.lastChild.remove();s.parentNode.tagName==="P"&&this._setNodeTag(s.parentNode,"DIV")}})},_setNodeTag(e,t){if(this.log("_setNodeTag",e,t),this._docJSDOMParser)return e.localName=t.toLowerCase(),e.tagName=t.toUpperCase(),e;for(var i=e.ownerDocument.createElement(t);e.firstChild;)i.appendChild(e.firstChild);e.parentNode.replaceChild(i,e),e.readability&&(i.readability=e.readability);for(var r=0;r<e.attributes.length;r++)i.setAttributeNode(e.attributes[r].cloneNode());return i},_prepArticle(e){this._cleanStyles(e),this._markDataTables(e),this._fixLazyImages(e),this._cleanConditionally(e,"form"),this._cleanConditionally(e,"fieldset"),this._clean(e,"object"),this._clean(e,"embed"),this._clean(e,"footer"),this._clean(e,"link"),this._clean(e,"aside");var t=this.DEFAULT_CHAR_THRESHOLD;this._forEachNode(e.children,function(i){this._cleanMatchedNodes(i,function(r,n){return this.REGEXPS.shareElements.test(n)&&r.textContent.length<t})}),this._clean(e,"iframe"),this._clean(e,"input"),this._clean(e,"textarea"),this._clean(e,"select"),this._clean(e,"button"),this._cleanHeaders(e),this._cleanConditionally(e,"table"),this._cleanConditionally(e,"ul"),this._cleanConditionally(e,"div"),this._replaceNodeTags(this._getAllNodesWithTag(e,["h1"]),"h2"),this._removeNodes(this._getAllNodesWithTag(e,["p"]),function(i){var r=this._getAllNodesWithTag(i,["img","embed","object","iframe"]).length;return r===0&&!this._getInnerText(i,!1)}),this._forEachNode(this._getAllNodesWithTag(e,["br"]),function(i){var r=this._nextNode(i.nextSibling);r&&r.tagName=="P"&&i.remove()}),this._forEachNode(this._getAllNodesWithTag(e,["table"]),function(i){var r=this._hasSingleTagInsideElement(i,"TBODY")?i.firstElementChild:i;if(this._hasSingleTagInsideElement(r,"TR")){var n=r.firstElementChild;if(this._hasSingleTagInsideElement(n,"TD")){var s=n.firstElementChild;s=this._setNodeTag(s,this._everyNode(s.childNodes,this._isPhrasingContent)?"P":"DIV"),i.parentNode.replaceChild(s,i)}}})},_initializeNode(e){switch(e.readability={contentScore:0},e.tagName){case"DIV":e.readability.contentScore+=5;break;case"PRE":case"TD":case"BLOCKQUOTE":e.readability.contentScore+=3;break;case"ADDRESS":case"OL":case"UL":case"DL":case"DD":case"DT":case"LI":case"FORM":e.readability.contentScore-=3;break;case"H1":case"H2":case"H3":case"H4":case"H5":case"H6":case"TH":e.readability.contentScore-=5;break}e.readability.contentScore+=this._getClassWeight(e)},_removeAndGetNext(e){var t=this._getNextNode(e,!0);return e.remove(),t},_getNextNode(e,t){if(!t&&e.firstElementChild)return e.firstElementChild;if(e.nextElementSibling)return e.nextElementSibling;do e=e.parentNode;while(e&&!e.nextElementSibling);return e&&e.nextElementSibling},_textSimilarity(e,t){var i=e.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean),r=t.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);if(!i.length||!r.length)return 0;var n=r.filter(o=>!i.includes(o)),s=n.join(" ").length/r.join(" ").length;return 1-s},_isValidByline(e,t){var i=e.getAttribute("rel"),r=e.getAttribute("itemprop"),n=e.textContent.trim().length;return(i==="author"||r&&r.includes("author")||this.REGEXPS.byline.test(t))&&!!n&&n<100},_getNodeAncestors(e,t){t=t||0;for(var i=0,r=[];e.parentNode&&(r.push(e.parentNode),!(t&&++i===t));)e=e.parentNode;return r},_grabArticle(e){this.log("**** grabArticle ****");var t=this._doc,i=e!==null;if(e=e||this._doc.body,!e)return this.log("No body found in document. Abort."),null;for(var r=e.innerHTML;;){this.log("Starting grabArticle loop");var n=this._flagIsActive(this.FLAG_STRIP_UNLIKELYS),s=[],o=this._doc.documentElement;let xe=!0;for(;o;){o.tagName==="HTML"&&(this._articleLang=o.getAttribute("lang"));var h=o.className+" "+o.id;if(!this._isProbablyVisible(o)){this.log("Removing hidden node - "+h),o=this._removeAndGetNext(o);continue}if(o.getAttribute("aria-modal")=="true"&&o.getAttribute("role")=="dialog"){o=this._removeAndGetNext(o);continue}if(!this._articleByline&&!this._metadata.byline&&this._isValidByline(o,h)){for(var d=this._getNextNode(o,!0),c=this._getNextNode(o),u=null;c&&c!=d;){var g=c.getAttribute("itemprop");if(g&&g.includes("name")){u=c;break}else c=this._getNextNode(c)}this._articleByline=(u??o).textContent.trim(),o=this._removeAndGetNext(o);continue}if(xe&&this._headerDuplicatesTitle(o)){this.log("Removing header: ",o.textContent.trim(),this._articleTitle.trim()),xe=!1,o=this._removeAndGetNext(o);continue}if(n){if(this.REGEXPS.unlikelyCandidates.test(h)&&!this.REGEXPS.okMaybeItsACandidate.test(h)&&!this._hasAncestorTag(o,"table")&&!this._hasAncestorTag(o,"code")&&o.tagName!=="BODY"&&o.tagName!=="A"){this.log("Removing unlikely candidate - "+h),o=this._removeAndGetNext(o);continue}if(this.UNLIKELY_ROLES.includes(o.getAttribute("role"))){this.log("Removing content with role "+o.getAttribute("role")+" - "+h),o=this._removeAndGetNext(o);continue}}if((o.tagName==="DIV"||o.tagName==="SECTION"||o.tagName==="HEADER"||o.tagName==="H1"||o.tagName==="H2"||o.tagName==="H3"||o.tagName==="H4"||o.tagName==="H5"||o.tagName==="H6")&&this._isElementWithoutContent(o)){o=this._removeAndGetNext(o);continue}if(this.DEFAULT_TAGS_TO_SCORE.includes(o.tagName)&&s.push(o),o.tagName==="DIV"){for(var f=null,b=o.firstChild;b;){var k=b.nextSibling;if(this._isPhrasingContent(b))f!==null?f.appendChild(b):this._isWhitespace(b)||(f=t.createElement("p"),o.replaceChild(f,b),f.appendChild(b));else if(f!==null){for(;f.lastChild&&this._isWhitespace(f.lastChild);)f.lastChild.remove();f=null}b=k}if(this._hasSingleTagInsideElement(o,"P")&&this._getLinkDensity(o)<.25){var R=o.children[0];o.parentNode.replaceChild(R,o),o=R,s.push(o)}else this._hasChildBlockElement(o)||(o=this._setNodeTag(o,"P"),s.push(o))}o=this._getNextNode(o)}var w=[];this._forEachNode(s,function(D){if(!(!D.parentNode||typeof D.parentNode.tagName>"u")){var P=this._getInnerText(D);if(!(P.length<25)){var Te=this._getNodeAncestors(D,5);if(Te.length!==0){var Y=0;Y+=1,Y+=P.split(this.REGEXPS.commas).length,Y+=Math.min(Math.floor(P.length/100),3),this._forEachNode(Te,function(O,le){if(!(!O.tagName||!O.parentNode||typeof O.parentNode.tagName>"u")){if(typeof O.readability>"u"&&(this._initializeNode(O),w.push(O)),le===0)var oe=1;else le===1?oe=2:oe=le*3;O.readability.contentScore+=Y/oe}})}}}});for(var x=[],_=0,C=w.length;_<C;_+=1){var N=w[_],W=N.readability.contentScore*(1-this._getLinkDensity(N));N.readability.contentScore=W,this.log("Candidate:",N,"with score "+W);for(var B=0;B<this._nbTopCandidates;B++){var F=x[B];if(!F||W>F.readability.contentScore){x.splice(B,0,N),x.length>this._nbTopCandidates&&x.pop();break}}}var p=x[0]||null,H=!1,m;if(p===null||p.tagName==="BODY"){for(p=t.createElement("DIV"),H=!0;e.firstChild;)this.log("Moving child out:",e.firstChild),p.appendChild(e.firstChild);e.appendChild(p),this._initializeNode(p)}else if(p){for(var E=[],X=1;X<x.length;X++)x[X].readability.contentScore/p.readability.contentScore>=.75&&E.push(this._getNodeAncestors(x[X]));var ee=3;if(E.length>=ee)for(m=p.parentNode;m.tagName!=="BODY";){for(var te=0,ie=0;ie<E.length&&te<ee;ie++)te+=Number(E[ie].includes(m));if(te>=ee){p=m;break}m=m.parentNode}p.readability||this._initializeNode(p),m=p.parentNode;for(var re=p.readability.contentScore,We=re/3;m.tagName!=="BODY";){if(!m.readability){m=m.parentNode;continue}var be=m.readability.contentScore;if(be<We)break;if(be>re){p=m;break}re=m.readability.contentScore,m=m.parentNode}for(m=p.parentNode;m.tagName!="BODY"&&m.children.length==1;)p=m,m=p.parentNode;p.readability||this._initializeNode(p)}var A=t.createElement("DIV");i&&(A.id="readability-content");var Fe=Math.max(10,p.readability.contentScore*.2);m=p.parentNode;for(var se=m.children,q=0,_e=se.length;q<_e;q++){var v=se[q],j=!1;if(this.log("Looking at sibling node:",v,v.readability?"with score "+v.readability.contentScore:""),this.log("Sibling has score",v.readability?v.readability.contentScore:"Unknown"),v===p)j=!0;else{var ye=0;if(v.className===p.className&&p.className!==""&&(ye+=p.readability.contentScore*.2),v.readability&&v.readability.contentScore+ye>=Fe)j=!0;else if(v.nodeName==="P"){var ve=this._getLinkDensity(v),Ee=this._getInnerText(v),ae=Ee.length;(ae>80&&ve<.25||ae<80&&ae>0&&ve===0&&Ee.search(/\.( |$)/)!==-1)&&(j=!0)}}j&&(this.log("Appending node:",v),this.ALTER_TO_DIV_EXCEPTIONS.includes(v.nodeName)||(this.log("Altering sibling:",v,"to div."),v=this._setNodeTag(v,"DIV")),A.appendChild(v),se=m.children,q-=1,_e-=1)}if(this._debug&&this.log("Article content pre-prep: "+A.innerHTML),this._prepArticle(A),this._debug&&this.log("Article content post-prep: "+A.innerHTML),H)p.id="readability-page-1",p.className="page";else{var V=t.createElement("DIV");for(V.id="readability-page-1",V.className="page";A.firstChild;)V.appendChild(A.firstChild);A.appendChild(V)}this._debug&&this.log("Article content after paging: "+A.innerHTML);var ne=!0,Ne=this._getInnerText(A,!0).length;if(Ne<this._charThreshold)if(ne=!1,e.innerHTML=r,this._attempts.push({articleContent:A,textLength:Ne}),this._flagIsActive(this.FLAG_STRIP_UNLIKELYS))this._removeFlag(this.FLAG_STRIP_UNLIKELYS);else if(this._flagIsActive(this.FLAG_WEIGHT_CLASSES))this._removeFlag(this.FLAG_WEIGHT_CLASSES);else if(this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY))this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY);else{if(this._attempts.sort(function(D,P){return P.textLength-D.textLength}),!this._attempts[0].textLength)return null;A=this._attempts[0].articleContent,ne=!0}if(ne){var Xe=[m,p].concat(this._getNodeAncestors(m));return this._someNode(Xe,function(D){if(!D.tagName)return!1;var P=D.getAttribute("dir");return P?(this._articleDir=P,!0):!1}),A}}},_unescapeHtmlEntities(e){if(!e)return e;var t=this.HTML_ESCAPE_MAP;return e.replace(/&(quot|amp|apos|lt|gt);/g,function(i,r){return t[r]}).replace(/&#(?:x([0-9a-f]+)|([0-9]+));/gi,function(i,r,n){var s=parseInt(r||n,r?16:10);return(s==0||s>1114111||s>=55296&&s<=57343)&&(s=65533),String.fromCodePoint(s)})},_getJSONLD(e){var t=this._getAllNodesWithTag(e,["script"]),i;return this._forEachNode(t,function(r){if(!i&&r.getAttribute("type")==="application/ld+json")try{var n=r.textContent.replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g,""),s=JSON.parse(n);if(Array.isArray(s)&&(s=s.find(g=>g["@type"]&&g["@type"].match(this.REGEXPS.jsonLdArticleTypes)),!s))return;var o=/^https?\:\/\/schema\.org\/?$/,h=typeof s["@context"]=="string"&&s["@context"].match(o)||typeof s["@context"]=="object"&&typeof s["@context"]["@vocab"]=="string"&&s["@context"]["@vocab"].match(o);if(!h||(!s["@type"]&&Array.isArray(s["@graph"])&&(s=s["@graph"].find(g=>(g["@type"]||"").match(this.REGEXPS.jsonLdArticleTypes))),!s||!s["@type"]||!s["@type"].match(this.REGEXPS.jsonLdArticleTypes)))return;if(i={},typeof s.name=="string"&&typeof s.headline=="string"&&s.name!==s.headline){var d=this._getArticleTitle(),c=this._textSimilarity(s.name,d)>.75,u=this._textSimilarity(s.headline,d)>.75;u&&!c?i.title=s.headline:i.title=s.name}else typeof s.name=="string"?i.title=s.name.trim():typeof s.headline=="string"&&(i.title=s.headline.trim());s.author&&(typeof s.author.name=="string"?i.byline=s.author.name.trim():Array.isArray(s.author)&&s.author[0]&&typeof s.author[0].name=="string"&&(i.byline=s.author.filter(function(g){return g&&typeof g.name=="string"}).map(function(g){return g.name.trim()}).join(", "))),typeof s.description=="string"&&(i.excerpt=s.description.trim()),s.publisher&&typeof s.publisher.name=="string"&&(i.siteName=s.publisher.name.trim()),typeof s.datePublished=="string"&&(i.datePublished=s.datePublished.trim())}catch(g){this.log(g.message)}}),i||{}},_getArticleMetadata(e){var t={},i={},r=this._doc.getElementsByTagName("meta"),n=/\s*(article|dc|dcterm|og|twitter)\s*:\s*(author|creator|description|published_time|title|site_name)\s*/gi,s=/^\s*(?:(dc|dcterm|og|twitter|parsely|weibo:(article|webpage))\s*[-\.:]\s*)?(author|creator|pub-date|description|title|site_name)\s*$/i;this._forEachNode(r,function(h){var d=h.getAttribute("name"),c=h.getAttribute("property"),u=h.getAttribute("content");if(u){var g=null,f=null;c&&(g=c.match(n),g&&(f=g[0].toLowerCase().replace(/\s/g,""),i[f]=u.trim())),!g&&d&&s.test(d)&&(f=d,u&&(f=f.toLowerCase().replace(/\s/g,"").replace(/\./g,":"),i[f]=u.trim()))}}),t.title=e.title||i["dc:title"]||i["dcterm:title"]||i["og:title"]||i["weibo:article:title"]||i["weibo:webpage:title"]||i.title||i["twitter:title"]||i["parsely-title"],t.title||(t.title=this._getArticleTitle());const o=typeof i["article:author"]=="string"&&!this._isUrl(i["article:author"])?i["article:author"]:void 0;return t.byline=e.byline||i["dc:creator"]||i["dcterm:creator"]||i.author||i["parsely-author"]||o,t.excerpt=e.excerpt||i["dc:description"]||i["dcterm:description"]||i["og:description"]||i["weibo:article:description"]||i["weibo:webpage:description"]||i.description||i["twitter:description"],t.siteName=e.siteName||i["og:site_name"],t.publishedTime=e.datePublished||i["article:published_time"]||i["parsely-pub-date"]||null,t.title=this._unescapeHtmlEntities(t.title),t.byline=this._unescapeHtmlEntities(t.byline),t.excerpt=this._unescapeHtmlEntities(t.excerpt),t.siteName=this._unescapeHtmlEntities(t.siteName),t.publishedTime=this._unescapeHtmlEntities(t.publishedTime),t},_isSingleImage(e){for(;e;){if(e.tagName==="IMG")return!0;if(e.children.length!==1||e.textContent.trim()!=="")return!1;e=e.children[0]}return!1},_unwrapNoscriptImages(e){var t=Array.from(e.getElementsByTagName("img"));this._forEachNode(t,function(r){for(var n=0;n<r.attributes.length;n++){var s=r.attributes[n];switch(s.name){case"src":case"srcset":case"data-src":case"data-srcset":return}if(/\.(jpg|jpeg|png|webp)/i.test(s.value))return}r.remove()});var i=Array.from(e.getElementsByTagName("noscript"));this._forEachNode(i,function(r){if(this._isSingleImage(r)){var n=e.createElement("div");n.innerHTML=r.innerHTML;var s=r.previousElementSibling;if(s&&this._isSingleImage(s)){var o=s;o.tagName!=="IMG"&&(o=s.getElementsByTagName("img")[0]);for(var h=n.getElementsByTagName("img")[0],d=0;d<o.attributes.length;d++){var c=o.attributes[d];if(c.value!==""&&(c.name==="src"||c.name==="srcset"||/\.(jpg|jpeg|png|webp)/i.test(c.value))){if(h.getAttribute(c.name)===c.value)continue;var u=c.name;h.hasAttribute(u)&&(u="data-old-"+u),h.setAttribute(u,c.value)}}r.parentNode.replaceChild(n.firstElementChild,s)}}})},_removeScripts(e){this._removeNodes(this._getAllNodesWithTag(e,["script","noscript"]))},_hasSingleTagInsideElement(e,t){return e.children.length!=1||e.children[0].tagName!==t?!1:!this._someNode(e.childNodes,function(i){return i.nodeType===this.TEXT_NODE&&this.REGEXPS.hasContent.test(i.textContent)})},_isElementWithoutContent(e){return e.nodeType===this.ELEMENT_NODE&&!e.textContent.trim().length&&(!e.children.length||e.children.length==e.getElementsByTagName("br").length+e.getElementsByTagName("hr").length)},_hasChildBlockElement(e){return this._someNode(e.childNodes,function(t){return this.DIV_TO_P_ELEMS.has(t.tagName)||this._hasChildBlockElement(t)})},_isPhrasingContent(e){return e.nodeType===this.TEXT_NODE||this.PHRASING_ELEMS.includes(e.tagName)||(e.tagName==="A"||e.tagName==="DEL"||e.tagName==="INS")&&this._everyNode(e.childNodes,this._isPhrasingContent)},_isWhitespace(e){return e.nodeType===this.TEXT_NODE&&e.textContent.trim().length===0||e.nodeType===this.ELEMENT_NODE&&e.tagName==="BR"},_getInnerText(e,t){t=typeof t>"u"?!0:t;var i=e.textContent.trim();return t?i.replace(this.REGEXPS.normalize," "):i},_getCharCount(e,t){return t=t||",",this._getInnerText(e).split(t).length-1},_cleanStyles(e){if(!(!e||e.tagName.toLowerCase()==="svg")){for(var t=0;t<this.PRESENTATIONAL_ATTRIBUTES.length;t++)e.removeAttribute(this.PRESENTATIONAL_ATTRIBUTES[t]);this.DEPRECATED_SIZE_ATTRIBUTE_ELEMS.includes(e.tagName)&&(e.removeAttribute("width"),e.removeAttribute("height"));for(var i=e.firstElementChild;i!==null;)this._cleanStyles(i),i=i.nextElementSibling}},_getLinkDensity(e){var t=this._getInnerText(e).length;if(t===0)return 0;var i=0;return this._forEachNode(e.getElementsByTagName("a"),function(r){var n=r.getAttribute("href"),s=n&&this.REGEXPS.hashUrl.test(n)?.3:1;i+=this._getInnerText(r).length*s}),i/t},_getClassWeight(e){if(!this._flagIsActive(this.FLAG_WEIGHT_CLASSES))return 0;var t=0;return typeof e.className=="string"&&e.className!==""&&(this.REGEXPS.negative.test(e.className)&&(t-=25),this.REGEXPS.positive.test(e.className)&&(t+=25)),typeof e.id=="string"&&e.id!==""&&(this.REGEXPS.negative.test(e.id)&&(t-=25),this.REGEXPS.positive.test(e.id)&&(t+=25)),t},_clean(e,t){var i=["object","embed","iframe"].includes(t);this._removeNodes(this._getAllNodesWithTag(e,[t]),function(r){if(i){for(var n=0;n<r.attributes.length;n++)if(this._allowedVideoRegex.test(r.attributes[n].value))return!1;if(r.tagName==="object"&&this._allowedVideoRegex.test(r.innerHTML))return!1}return!0})},_hasAncestorTag(e,t,i,r){i=i||3,t=t.toUpperCase();for(var n=0;e.parentNode;){if(i>0&&n>i)return!1;if(e.parentNode.tagName===t&&(!r||r(e.parentNode)))return!0;e=e.parentNode,n++}return!1},_getRowAndColumnCount(e){for(var t=0,i=0,r=e.getElementsByTagName("tr"),n=0;n<r.length;n++){var s=r[n].getAttribute("rowspan")||0;s&&(s=parseInt(s,10)),t+=s||1;for(var o=0,h=r[n].getElementsByTagName("td"),d=0;d<h.length;d++){var c=h[d].getAttribute("colspan")||0;c&&(c=parseInt(c,10)),o+=c||1}i=Math.max(i,o)}return{rows:t,columns:i}},_markDataTables(e){for(var t=e.getElementsByTagName("table"),i=0;i<t.length;i++){var r=t[i],n=r.getAttribute("role");if(n=="presentation"){r._readabilityDataTable=!1;continue}var s=r.getAttribute("datatable");if(s=="0"){r._readabilityDataTable=!1;continue}var o=r.getAttribute("summary");if(o){r._readabilityDataTable=!0;continue}var h=r.getElementsByTagName("caption")[0];if(h&&h.childNodes.length){r._readabilityDataTable=!0;continue}var d=["col","colgroup","tfoot","thead","th"],c=function(g){return!!r.getElementsByTagName(g)[0]};if(d.some(c)){this.log("Data table because found data-y descendant"),r._readabilityDataTable=!0;continue}if(r.getElementsByTagName("table")[0]){r._readabilityDataTable=!1;continue}var u=this._getRowAndColumnCount(r);if(u.columns==1||u.rows==1){r._readabilityDataTable=!1;continue}if(u.rows>=10||u.columns>4){r._readabilityDataTable=!0;continue}r._readabilityDataTable=u.rows*u.columns>10}},_fixLazyImages(e){this._forEachNode(this._getAllNodesWithTag(e,["img","picture","figure"]),function(t){if(t.src&&this.REGEXPS.b64DataUrl.test(t.src)){var i=this.REGEXPS.b64DataUrl.exec(t.src);if(i[1]==="image/svg+xml")return;for(var r=!1,n=0;n<t.attributes.length;n++){var s=t.attributes[n];if(s.name!=="src"&&/\.(jpg|jpeg|png|webp)/i.test(s.value)){r=!0;break}}if(r){var o=i[0].length,h=t.src.length-o;h<133&&t.removeAttribute("src")}}if(!((t.src||t.srcset&&t.srcset!="null")&&!t.className.toLowerCase().includes("lazy"))){for(var d=0;d<t.attributes.length;d++)if(s=t.attributes[d],!(s.name==="src"||s.name==="srcset"||s.name==="alt")){var c=null;if(/\.(jpg|jpeg|png|webp)\s+\d/.test(s.value)?c="srcset":/^\s*\S+\.(jpg|jpeg|png|webp)\S*\s*$/.test(s.value)&&(c="src"),c){if(t.tagName==="IMG"||t.tagName==="PICTURE")t.setAttribute(c,s.value);else if(t.tagName==="FIGURE"&&!this._getAllNodesWithTag(t,["img","picture"]).length){var u=this._doc.createElement("img");u.setAttribute(c,s.value),t.appendChild(u)}}}}})},_getTextDensity(e,t){var i=this._getInnerText(e,!0).length;if(i===0)return 0;var r=0,n=this._getAllNodesWithTag(e,t);return this._forEachNode(n,s=>r+=this._getInnerText(s,!0).length),r/i},_cleanConditionally(e,t){this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)&&this._removeNodes(this._getAllNodesWithTag(e,[t]),function(i){var r=function(m){return m._readabilityDataTable},n=t==="ul"||t==="ol";if(!n){var s=0,o=this._getAllNodesWithTag(i,["ul","ol"]);this._forEachNode(o,m=>s+=this._getInnerText(m).length),n=s/this._getInnerText(i).length>.9}if(t==="table"&&r(i)||this._hasAncestorTag(i,"table",-1,r)||this._hasAncestorTag(i,"code")||[...i.getElementsByTagName("table")].some(m=>m._readabilityDataTable))return!1;var h=this._getClassWeight(i);this.log("Cleaning Conditionally",i);var d=0;if(h+d<0)return!0;if(this._getCharCount(i,",")<10){for(var c=i.getElementsByTagName("p").length,u=i.getElementsByTagName("img").length,g=i.getElementsByTagName("li").length-100,f=i.getElementsByTagName("input").length,b=this._getTextDensity(i,["h1","h2","h3","h4","h5","h6"]),k=0,R=this._getAllNodesWithTag(i,["object","embed","iframe"]),w=0;w<R.length;w++){for(var x=0;x<R[w].attributes.length;x++)if(this._allowedVideoRegex.test(R[w].attributes[x].value))return!1;if(R[w].tagName==="object"&&this._allowedVideoRegex.test(R[w].innerHTML))return!1;k++}var _=this._getInnerText(i);if(this.REGEXPS.adWords.test(_)||this.REGEXPS.loadingWords.test(_))return!0;var C=_.length,N=this._getLinkDensity(i),W=["SPAN","LI","TD"].concat(Array.from(this.DIV_TO_P_ELEMS)),B=this._getTextDensity(i,W),F=this._hasAncestorTag(i,"figure"),p=(()=>{const E=[];return!F&&u>1&&c/u<.5&&E.push(`Bad p to img ratio (img=${u}, p=${c})`),!n&&g>c&&E.push(`Too many li's outside of a list. (li=${g} > p=${c})`),f>Math.floor(c/3)&&E.push(`Too many inputs per p. (input=${f}, p=${c})`),!n&&!F&&b<.9&&C<25&&(u===0||u>2)&&N>0&&E.push(`Suspiciously short. (headingDensity=${b}, img=${u}, linkDensity=${N})`),!n&&h<25&&N>.2+this._linkDensityModifier&&E.push(`Low weight and a little linky. (linkDensity=${N})`),h>=25&&N>.5+this._linkDensityModifier&&E.push(`High weight and mostly links. (linkDensity=${N})`),(k===1&&C<75||k>1)&&E.push(`Suspicious embed. (embedCount=${k}, contentLength=${C})`),u===0&&B===0&&E.push(`No useful content. (img=${u}, textDensity=${B})`),E.length?(this.log("Checks failed",E),!0):!1})();if(n&&p){for(var H=0;H<i.children.length;H++)if(i.children[H].children.length>1)return p;let E=i.getElementsByTagName("li").length;if(u==E)return!1}return p}return!1})},_cleanMatchedNodes(e,t){for(var i=this._getNextNode(e,!0),r=this._getNextNode(e);r&&r!=i;)t.call(this,r,r.className+" "+r.id)?r=this._removeAndGetNext(r):r=this._getNextNode(r)},_cleanHeaders(e){let t=this._getAllNodesWithTag(e,["h1","h2"]);this._removeNodes(t,function(i){let r=this._getClassWeight(i)<0;return r&&this.log("Removing header with low class weight:",i),r})},_headerDuplicatesTitle(e){if(e.tagName!="H1"&&e.tagName!="H2")return!1;var t=this._getInnerText(e,!1);return this.log("Evaluating similarity of header:",t,this._articleTitle),this._textSimilarity(this._articleTitle,t)>.75},_flagIsActive(e){return(this._flags&e)>0},_removeFlag(e){this._flags=this._flags&~e},_isProbablyVisible(e){return(!e.style||e.style.display!="none")&&(!e.style||e.style.visibility!="hidden")&&!e.hasAttribute("hidden")&&(!e.hasAttribute("aria-hidden")||e.getAttribute("aria-hidden")!="true"||e.className&&e.className.includes&&e.className.includes("fallback-image"))},parse(){if(this._maxElemsToParse>0){var e=this._doc.getElementsByTagName("*").length;if(e>this._maxElemsToParse)throw new Error("Aborting parsing document; "+e+" elements found")}this._unwrapNoscriptImages(this._doc);var t=this._disableJSONLD?{}:this._getJSONLD(this._doc);this._removeScripts(this._doc),this._prepDocument();var i=this._getArticleMetadata(t);this._metadata=i,this._articleTitle=i.title;var r=this._grabArticle();if(!r)return null;if(this.log("Grabbed: "+r.innerHTML),this._postProcessContent(r),!i.excerpt){var n=r.getElementsByTagName("p");n.length&&(i.excerpt=n[0].textContent.trim())}var s=r.textContent;return{title:this._articleTitle,byline:i.byline||this._articleByline,dir:this._articleDir,lang:this._articleLang,content:this._serializer(r),textContent:s,length:s.length,excerpt:i.excerpt,siteName:i.siteName||this._articleSiteName,publishedTime:i.publishedTime}}},a.exports=l})(Oe);var Ze=Oe.exports,et={exports:{}};(function(a){var l={unlikelyCandidates:/-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,okMaybeItsACandidate:/and|article|body|column|content|main|shadow/i};function e(i){return(!i.style||i.style.display!="none")&&!i.hasAttribute("hidden")&&(!i.hasAttribute("aria-hidden")||i.getAttribute("aria-hidden")!="true"||i.className&&i.className.includes&&i.className.includes("fallback-image"))}function t(i,r={}){typeof r=="function"&&(r={visibilityChecker:r});var n={minScore:20,minContentLength:140,visibilityChecker:e};r=Object.assign(n,r);var s=i.querySelectorAll("p, pre, article"),o=i.querySelectorAll("div > br");if(o.length){var h=new Set(s);[].forEach.call(o,function(c){h.add(c.parentNode)}),s=Array.from(h)}var d=0;return[].some.call(s,function(c){if(!r.visibilityChecker(c))return!1;var u=c.className+" "+c.id;if(l.unlikelyCandidates.test(u)&&!l.okMaybeItsACandidate.test(u)||c.matches("li p"))return!1;var g=c.textContent.trim().length;return g<r.minContentLength?!1:(d+=Math.sqrt(g-r.minContentLength),d>r.minScore)})}a.exports=t})(et);var tt=Ze,it={Readability:tt};const z={"news.naver.com":["#dic_area","#newsct_article","#articleBodyContents"],"n.news.naver.com":["#dic_area","#newsct_article"],"news.daum.net":["#harmonyContainer",".article_view"],"v.daum.net":["#harmonyContainer",".article_view"],"chosun.com":[".article-body","#news_body_id",".news_text"],"joongang.co.kr":["#article_body",".article_body"],"donga.com":[".article_txt",".news_view"],"hani.co.kr":[".article-text",".text"],"khan.co.kr":["#articleBody",".art_body"],"hankookilbo.com":[".article-story"],"seoul.co.kr":["#articleContent",".viewContent"],"kmib.co.kr":["#articleBody"],"segye.com":["#article_txt"],"hankyung.com":["#articletxt",".article-body"],"mk.co.kr":[".view_txt","#artText"],"mt.co.kr":["#textBody",".view_txt"],"edaily.co.kr":[".news_body","#newsBody"],"fnnews.com":["#article_content"],"asiae.co.kr":["#txt_area",".article"],"news.kbs.co.kr":["#cont_newstext",".detail-body"],"news.sbs.co.kr":[".text_area","#etv_news_content_div"],"imnews.imbc.com":[".news_txt"],"ytn.co.kr":[".paragraph","#CmAdContent"],"jtbc.co.kr":["#articlebody .article_content"],"yna.co.kr":[".story-news","#articleWrap"],"ohmynews.com":[".at_contents"],"nocutnews.co.kr":["#pnlContent"],"pressian.com":["#article_body"],"newstapa.org":[".bodytext"]},K=['[itemprop="articleBody"]',"article","main article","main"];function He(a){const l=a.toLowerCase(),e=z[l];if(e)return[...e,...K];for(const t of Object.keys(z))if(l.endsWith(t))return[...z[t],...K];return K}const rt=6e3;function st(a,l){const e=new URL(l).hostname.toLowerCase();if(at(e)){const t=He(e);for(const i of t){const r=a.querySelector(i);if(!r)continue;const n=ue(r.textContent??"");if(n.length>=G){if(n.length>rt){const s=Ae(a);if(s&&s.length>=G)return{text:s,host:e,selectorUsed:i,source:"readability"}}return{text:n,host:e,selectorUsed:i,source:"selector"}}}}else{const t=Ae(a);if(t&&t.length>=G)return{text:t,host:e,selectorUsed:null,source:"readability"};for(const i of K){const r=a.querySelector(i);if(!r)continue;const n=ue(r.textContent??"");if(n.length>=G)return{text:n,host:e,selectorUsed:i,source:"selector"}}}return{text:"",host:e,selectorUsed:null,source:"selector"}}function Ae(a){try{const l=a.cloneNode(!0),e=new it.Readability(l).parse();return!e||!e.textContent?null:ue(e.textContent)}catch{return null}}function at(a){if(z[a])return!0;for(const l of Object.keys(z))if(a.endsWith(l))return!0;return!1}function ue(a){return a.replace(/\s+/g," ").trim()}class nt{constructor(l){this.opts=l}async detectArticle(l,e){return this.post("/api/detect-article",{text:l,url:e})}async analyze(l,e){return this.post(ze[l],{text:e,lang:"ko"})}async analyzeAll(l){const e=["term","sensational","quantitative","context"],t=await Promise.allSettled(e.map(r=>this.analyze(r,l))),i={};return e.forEach((r,n)=>{i[r]=t[n]}),i}async briefing(l){return this.post(qe,{text:l,lang:"ko"})}async oneline(l){return this.post(Ve,{text:l,lang:"ko"})}async character(l){return this.post(Qe,{text:l,lang:"ko"})}async rewriteSensational(l,e){return this.post(Ye,{text:l,reason:e})}async post(l,e){const i=await(this.opts.fetch??fetch)(`${this.opts.baseUrl}${l}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(e),signal:this.opts.signal});if(!i.ok)throw new Error(`${l} ${i.status}`);return await i.json()}}const we={term:0,quantitative:1,sensational:2},lt={term:"nts-term",sensational:"nts-sensational",quantitative:"nts-quantitative",context:"nts-context"};function ot(a){const l=a.filter(e=>e.kind==="term");return l.length===0?a:a.filter(e=>{if(e.kind!=="quantitative")return!0;for(const t of l)if(e.start<t.end&&e.end>t.start)return!1;return!0})}function Se(a){if(a.length===0)return[];const l=[...a].sort((t,i)=>t.start-i.start||t.end-i.end),e=[];for(const t of l){const i=e[e.length-1];if(i&&t.start<i.end){if(i.end=Math.max(i.end,t.end),i.all.push(t),t.kind!=="context"&&i.primary!=="context"){const r=we[t.kind],n=we[i.primary];r<n&&(i.primary=t.kind)}}else e.push({start:t.start,end:t.end,primary:t.kind,all:[t]})}return e}function Le(a){const l=[];let e=0;const t=document.createTreeWalker(a,NodeFilter.SHOW_TEXT,{acceptNode:r=>r.nodeValue&&r.nodeValue.length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});let i=t.nextNode();for(;i;){const r=i.nodeValue??"",n=Array.from(r).length;l.push({node:i,start:e,end:e+n}),e+=n,i=t.nextNode()}return{pieces:l,total:e}}function ct(a,l,e){let t=0,i=0,r=0;for(let n=0;n<a.length;){if(r===l&&(t=n),r===e)return i=n,{start:t,end:i};const s=a.codePointAt(n);n+=s>65535?2:1,r++}return r===e&&(i=a.length),r===l&&(t=a.length),{start:t,end:i}}function ht(a,l){const e=l.filter(i=>i.kind==="context"),t=ot(l.filter(i=>i.kind!=="context"));if(e.length>0){const i=Se(e),{pieces:r}=Le(a);for(const n of i.slice().reverse())ke(r,n)}if(t.length>0){const i=Se(t),{pieces:r}=Le(a);for(const n of i.slice().reverse())ke(r,n)}}function ke(a,l){const e=a.filter(t=>t.start<l.end&&t.end>l.start);if(e.length!==0)for(const t of e){const i=Math.max(0,l.start-t.start),r=Math.min(t.end-t.start,l.end-t.start);if(r<=i)continue;const n=t.node.nodeValue??"",{start:s,end:o}=ct(n,i,r);if(o<=s)continue;const h=document.createRange();try{h.setStart(t.node,s),h.setEnd(t.node,o)}catch{continue}const d=document.createElement("nts-mark");d.className=lt[l.primary],d.dataset.kinds=Array.from(new Set(l.all.map(c=>c.kind))).join(","),d.dataset.payload=JSON.stringify(l.all);try{h.surroundContents(d)}catch{}}}const ut=`
nts-mark {
  display: inline;
  border-radius: 2px;
  padding: 0 1px;
}
nts-mark.nts-context {
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  text-decoration-color: #000;
  text-decoration-skip-ink: none;
}
nts-mark.nts-sensational {
  background: rgba(255, 90, 90, 0.32);
  box-shadow: inset 0 -1px 0 rgba(220, 0, 0, 0.55);
  cursor: pointer;
}
nts-mark.nts-quantitative {
  background: rgba(80, 200, 120, 0.32);
  box-shadow: inset 0 -1px 0 rgba(0, 140, 60, 0.55);
  cursor: pointer;
}
nts-mark.nts-term {
  background: rgba(90, 150, 255, 0.32);
  box-shadow: inset 0 -1px 0 rgba(20, 80, 200, 0.55);
  cursor: pointer;
}
/* context 안에 들어가는 다른 색은 자체 배경 + bold/밑줄 상속. */
nts-mark.nts-context nts-mark { font-weight: inherit; }
`;function dt(){if(document.getElementById("nts-styles"))return;const a=document.createElement("style");a.id="nts-styles",a.textContent=ut,document.head.appendChild(a)}const L="nts-badge";let J=null;function I(a){J&&(clearTimeout(J),J=null);const l=ft(),e=a.message??gt(a);l.dataset.phase=a.phase,l.querySelector(".nts-badge-label").textContent=e,l.style.display="flex",(a.phase==="ok"||a.phase==="skip")&&(J=setTimeout(()=>fe(),3e3))}function fe(){const a=document.getElementById(L);a&&(a.style.display="none")}function gt(a){switch(a.phase){case"running":return`분석 중 ${a.done}/${a.total}`;case"ok":return`완료 (${a.done}/${a.total})`;case"error":return`오류 (${a.done}/${a.total})`;case"skip":return"기사 아님 — 분석 건너뜀"}}function ft(){const a=document.getElementById(L);if(a)return a;const l=document.createElement("style");l.id="nts-badge-styles",l.textContent=`
    #${L} {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      font: 12px/1.3 system-ui, -apple-system, "Pretendard", sans-serif;
      color: #fff;
      background: rgba(20, 20, 24, 0.86);
      border-radius: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      cursor: default;
      user-select: none;
      pointer-events: auto;
    }
    #${L}[data-phase="ok"] { background: rgba(20, 100, 60, 0.92); }
    #${L}[data-phase="error"] { background: rgba(180, 40, 40, 0.92); }
    #${L}[data-phase="skip"] { background: rgba(80, 80, 90, 0.86); }
    #${L} .nts-badge-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #fff;
      opacity: 0.9;
    }
    #${L}[data-phase="running"] .nts-badge-dot {
      animation: nts-pulse 1.2s ease-in-out infinite;
    }
    #${L} .nts-badge-close {
      margin-left: 4px;
      width: 14px; height: 14px;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 50%;
      cursor: pointer;
      opacity: 0.6;
    }
    #${L} .nts-badge-close:hover { opacity: 1; background: rgba(255,255,255,0.18); }
    @keyframes nts-pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
  `,document.head.appendChild(l);const e=document.createElement("div");return e.id=L,e.innerHTML=`
    <span class="nts-badge-dot"></span>
    <span class="nts-badge-label"></span>
    <span class="nts-badge-close" title="닫기">×</span>
  `,e.querySelector(".nts-badge-close").addEventListener("click",fe),document.body.appendChild(e),e}const y="nts-popover",Re="nts-popover-styles";let Z=null;const Ie={term:0,quantitative:1,sensational:2};let pe=null;function pt(a,l){Z=l,vt(),a.removeEventListener("click",Ce),a.addEventListener("click",Ce),document.removeEventListener("click",De),document.addEventListener("click",De)}function Ce(a){var e,t;const l=(t=(e=a.target)==null?void 0:e.closest)==null?void 0:t.call(e,"nts-mark");if(l){if(a.stopPropagation(),a.preventDefault(),pe===l){M();return}mt(l)}}function De(a){const l=a.target;l&&(l.closest("nts-mark")||l.closest(`#${y}`)||M())}function mt(a){const l=a.dataset.payload;if(!l){M();return}let e=[];try{e=JSON.parse(l)}catch{M();return}const t=e.filter(n=>n.kind!=="context");if(t.length===0){M();return}const i=[...t].sort((n,s)=>Ie[n.kind]-Ie[s.kind])[0],r=yt();if(r.innerHTML=_t(i),r.style.display="block",Ge(r,a),pe=a,r.querySelectorAll("[data-search]").forEach(n=>{n.addEventListener("click",s=>{s.stopPropagation();const o=n.dataset.search;window.open(`https://www.google.com/search?q=${encodeURIComponent(o)}`,"_blank","noopener")})}),i.kind==="sensational"){const n=r.querySelector(".nts-pop-rewrite");n&&Z&&n.addEventListener("click",async s=>{s.stopPropagation(),await bt(r,n,a,i.payload.reason)})}}async function bt(a,l,e,t){if(!Z)return;const i=(e.textContent??"").trim();if(!i)return;l.disabled=!0,l.textContent="변환 중...";const r=document.createElement("div");r.className="nts-pop-rewrite-result",r.innerHTML='<div class="nts-pop-rewrite-label">온화한 표현</div><div class="nts-pop-rewrite-body">변환 중...</div>',l.insertAdjacentElement("afterend",r);try{const n=await Z.rewriteSensational(i,t),s=r.querySelector(".nts-pop-rewrite-body");s&&(s.textContent=n||"(변환 결과 없음)"),l.remove()}catch{const n=r.querySelector(".nts-pop-rewrite-body");n&&(n.textContent="변환 실패 — 잠시 후 다시 시도해 주세요."),l.disabled=!1,l.textContent="온화한 표현으로 보기"}finally{Ge(a,e)}}function _t(a){switch(a.kind){case"term":return`<div class="nts-pop-section nts-pop-term">
        <div class="nts-pop-label">용어</div>
        <div class="nts-pop-body">${Q(a.payload.explanation)}</div>
      </div>`;case"sensational":return`<div class="nts-pop-section nts-pop-sensational">
        <div class="nts-pop-label">⚠ 자극적 표현</div>
        <div class="nts-pop-body">${Q(a.payload.reason)}</div>
        <button type="button" class="nts-pop-rewrite">온화한 표현으로 보기</button>
      </div>`;case"quantitative":{const l=a.payload.searchQuery;return`<div class="nts-pop-section nts-pop-quantitative">
        <div class="nts-pop-label">수치</div>
        <button type="button" class="nts-pop-search" data-search="${Et(l)}">Google에서 "${Q(l)}" 검색</button>
      </div>`}case"context":return""}}function M(){const a=document.getElementById(y);a&&(a.style.display="none"),pe=null}function Ge(a,l){const e=l.getBoundingClientRect();a.style.visibility="hidden",a.style.display="block",a.style.left="0px",a.style.top="0px";const t=a.getBoundingClientRect(),i=window.innerWidth,r=window.innerHeight;let n=e.left+window.scrollX,s=e.bottom+window.scrollY+6;n+t.width+8>window.scrollX+i&&(n=window.scrollX+i-t.width-8),n<window.scrollX+8&&(n=window.scrollX+8),e.bottom+t.height+12>r&&(s=e.top+window.scrollY-t.height-6),a.style.left=`${n}px`,a.style.top=`${s}px`,a.style.visibility="visible"}function yt(){const a=document.getElementById(y);if(a)return a;const l=document.createElement("div");return l.id=y,document.body.appendChild(l),l}function vt(){if(document.getElementById(Re))return;const a=document.createElement("style");a.id=Re,a.textContent=`
    #${y} {
      position: absolute;
      z-index: 2147483646;
      display: none;
      max-width: 320px;
      padding: 10px 12px;
      background: rgba(28, 28, 32, 0.97);
      color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.28);
      font: 13px/1.45 system-ui, -apple-system, "Pretendard", sans-serif;
      pointer-events: auto;
    }
    #${y} .nts-pop-label {
      font-size: 11px;
      letter-spacing: 0.04em;
      opacity: 0.7;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    #${y} .nts-pop-body { word-break: keep-all; }
    #${y} .nts-pop-sep {
      height: 1px;
      background: rgba(255,255,255,0.12);
      margin: 8px -12px;
    }
    #${y} .nts-pop-sensational .nts-pop-label { color: #ff8a8a; }
    #${y} .nts-pop-quantitative .nts-pop-label { color: #6fdb96; }
    #${y} .nts-pop-term .nts-pop-label { color: #8aafff; }
    #${y} .nts-pop-search {
      display: block;
      width: 100%;
      margin-top: 4px;
      padding: 6px 10px;
      background: rgba(80, 200, 120, 0.22);
      color: #fff;
      border: 1px solid rgba(80, 200, 120, 0.5);
      border-radius: 6px;
      font: inherit;
      cursor: pointer;
      text-align: left;
    }
    #${y} .nts-pop-search:hover {
      background: rgba(80, 200, 120, 0.32);
    }
    #${y} .nts-pop-rewrite {
      display: block;
      width: 100%;
      margin-top: 8px;
      padding: 6px 10px;
      background: rgba(255, 138, 138, 0.18);
      color: #fff;
      border: 1px solid rgba(255, 138, 138, 0.45);
      border-radius: 6px;
      font: inherit;
      cursor: pointer;
      text-align: center;
    }
    #${y} .nts-pop-rewrite:hover {
      background: rgba(255, 138, 138, 0.3);
    }
    #${y} .nts-pop-rewrite:disabled {
      cursor: progress; opacity: 0.7;
    }
    #${y} .nts-pop-rewrite-result {
      margin-top: 8px;
      padding: 8px 10px;
      background: rgba(120, 180, 255, 0.12);
      border-left: 3px solid rgba(120, 180, 255, 0.7);
      border-radius: 4px;
    }
    #${y} .nts-pop-rewrite-label {
      font-size: 10px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #8ec5ff;
      font-weight: 700;
      margin-bottom: 4px;
    }
    #${y} .nts-pop-rewrite-body {
      font-size: 13px;
      color: #f1f4ff;
      word-break: keep-all;
    }
  `,document.head.appendChild(a)}function Q(a){return a.replace(/[&<>"']/g,l=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[l])}function Et(a){return Q(a)}const Nt=async(a,l)=>{const e=typeof a=="string"||a instanceof URL?a.toString():a.url,t=(l==null?void 0:l.method)??(typeof a!="string"&&!(a instanceof URL)?a.method:"GET"),i=l==null?void 0:l.headers,r=l==null?void 0:l.body;let n;typeof r=="string"?n=r:r==null?n=void 0:n=await new Response(r).text();const s=await chrome.runtime.sendMessage({type:"nts-fetch",payload:{url:e,method:t,headers:i,body:n}});if(!s)throw new Error("background_no_reply");if(s.error)throw new Error(s.error);const o=s.data==null?null:JSON.stringify(s.data);return new Response(o,{status:s.status,headers:{"content-type":"application/json"}})},S="nts-cards",U="nts-oneline",Pe="nts-summary-styles";function xt(a,l){var t;Me(),(t=document.getElementById(S))==null||t.remove();const e=document.createElement("section");e.id=S,e.innerHTML=`
    <div class="nts-cards-head">
      <span class="nts-cards-eyebrow">읽기 전 맥락</span>
      <span class="nts-cards-hint">기사 이해를 돕는 배경 3가지</span>
    </div>
    <div class="nts-cards-grid">
      ${l.cards.map(wt).join("")}
    </div>
  `,a.insertAdjacentElement("beforebegin",e)}function Tt(a,l){var t;Me(),(t=document.getElementById(U))==null||t.remove();const e=document.createElement("section");e.id=U,e.innerHTML=`
    <span class="nts-oneline-label">이 기사 한 줄</span>
    <p class="nts-oneline-body">${de(l.oneLine)}</p>
  `,a.insertAdjacentElement("afterend",e)}function At(){var a,l;(a=document.getElementById(S))==null||a.remove(),(l=document.getElementById(U))==null||l.remove()}function wt(a,l){return`
    <article class="nts-card">
      <span class="nts-card-num">${l+1}</span>
      <h3 class="nts-card-title">${de(a.title)}</h3>
      <p class="nts-card-body">${de(a.body)}</p>
    </article>
  `}function Me(){if(document.getElementById(Pe))return;const a=document.createElement("style");a.id=Pe,a.textContent=`
    #${S} {
      box-sizing: border-box;
      margin: 16px 0 20px;
      padding: 14px 16px 16px;
      background: linear-gradient(180deg, rgba(245,247,252,0.92) 0%, rgba(238,242,250,0.92) 100%);
      border: 1px solid rgba(80, 110, 200, 0.18);
      border-radius: 10px;
      font: 13px/1.5 system-ui, -apple-system, "Pretendard", "Apple SD Gothic Neo", sans-serif;
      color: #1c2230;
    }
    #${S} .nts-cards-head {
      display: flex; align-items: baseline; gap: 10px;
      margin-bottom: 10px;
    }
    #${S} .nts-cards-eyebrow {
      font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
      color: #4a5b8a; font-weight: 700;
    }
    #${S} .nts-cards-hint {
      font-size: 12px; color: #6a7290;
    }
    #${S} .nts-cards-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    #${S} .nts-card {
      position: relative;
      background: #fff;
      border: 1px solid rgba(60, 80, 140, 0.12);
      border-radius: 8px;
      padding: 12px 12px 12px 14px;
      box-shadow: 0 1px 2px rgba(20, 30, 60, 0.04);
    }
    #${S} .nts-card-num {
      position: absolute; top: 10px; right: 12px;
      font-size: 11px; font-weight: 700; color: #b8c1d8;
    }
    #${S} .nts-card-title {
      margin: 0 22px 6px 0;
      font-size: 13px; font-weight: 700; color: #1c2538; line-height: 1.4;
    }
    #${S} .nts-card-body {
      margin: 0;
      font-size: 12.5px; color: #3b4258; line-height: 1.55;
      word-break: keep-all;
    }
    #${U} {
      box-sizing: border-box;
      margin: 24px 0 8px;
      padding: 14px 18px;
      background: rgba(255, 244, 220, 0.78);
      border-left: 4px solid #f0b400;
      border-radius: 4px;
      font: 14px/1.55 system-ui, -apple-system, "Pretendard", "Apple SD Gothic Neo", sans-serif;
      color: #2a2418;
      display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;
    }
    #${U} .nts-oneline-label {
      flex: 0 0 auto;
      font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
      color: #8a6d10; font-weight: 700;
    }
    #${U} .nts-oneline-body {
      flex: 1 1 auto;
      margin: 0;
      font-size: 14.5px; font-weight: 500; color: #2a2418; word-break: keep-all;
    }
  `,document.head.appendChild(a)}function de(a){return a.replace(/[&<>"']/g,l=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[l])}const T="nts-character",$e="nts-character-styles";let ge=!1;const St={fact_claim:{track:"rgba(90, 150, 255, 0.18)",fill:"#5a96ff"},opinion:{track:"rgba(180, 130, 230, 0.18)",fill:"#b482e6"},value_judgment:{track:"rgba(230, 140, 200, 0.18)",fill:"#e68cc8"},sensational:{track:"rgba(255, 110, 110, 0.18)",fill:"#ff6e6e"},evidence:{track:"rgba(110, 210, 140, 0.18)",fill:"#6ed28c"},causation:{track:"rgba(90, 200, 210, 0.18)",fill:"#5ac8d2"},prediction:{track:"rgba(245, 200, 90, 0.18)",fill:"#f5c85a"}};function Lt(a){var e;if(ge)return;Ct();const l=It();l.innerHTML=`
    <header class="nts-char-head">
      <span class="nts-char-eyebrow">글 성격</span>
      <button class="nts-char-close" type="button" aria-label="닫기">×</button>
    </header>
    <ul class="nts-char-list">
      ${Ke.map(t=>Rt(t,a.signals[t])).join("")}
    </ul>
  `,l.style.display="block",(e=l.querySelector(".nts-char-close"))==null||e.addEventListener("click",()=>{ge=!0,Ue()})}function Ue(){const a=document.getElementById(T);a&&(a.style.display="none")}function kt(){ge=!1,Ue()}function Rt(a,l){const e=l===1?33:l===2?66:100,t=St[a];return`
    <li class="nts-char-row">
      <span class="nts-char-label">${Je[a]}</span>
      <span class="nts-char-gauge" style="background:${t.track}">
        <span class="nts-char-gauge-fill" style="width:${e}%;background:${t.fill}"></span>
      </span>
    </li>
  `}function It(){const a=document.getElementById(T);if(a)return a;const l=document.createElement("aside");return l.id=T,document.body.appendChild(l),l}function Ct(){if(document.getElementById($e))return;const a=document.createElement("style");a.id=$e,a.textContent=`
    #${T} {
      position: fixed;
      top: 80px;
      right: 16px;
      z-index: 2147483645;
      width: 240px;
      padding: 14px 16px 14px;
      background: rgba(28, 30, 38, 0.94);
      color: #f1f3f8;
      border-radius: 12px;
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.24);
      font: 12px/1.4 system-ui, -apple-system, "Pretendard", "Apple SD Gothic Neo", sans-serif;
      display: none;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    @media (max-width: 1100px) {
      #${T} { display: none !important; }
    }
    #${T} .nts-char-head {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 10px;
    }
    #${T} .nts-char-eyebrow {
      font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
      color: #d0d6e8; font-weight: 700;
    }
    #${T} .nts-char-close {
      background: transparent; border: 0; color: #b8c1da;
      font-size: 16px; line-height: 1; cursor: pointer;
      padding: 2px 6px; border-radius: 4px;
    }
    #${T} .nts-char-close:hover { background: rgba(255,255,255,0.1); color:#fff; }
    #${T} .nts-char-list {
      list-style: none; padding: 0; margin: 0;
      display: flex; flex-direction: column; gap: 8px;
    }
    #${T} .nts-char-row {
      display: grid;
      grid-template-columns: 64px 1fr;
      align-items: center;
      gap: 10px;
    }
    #${T} .nts-char-label {
      font-size: 12px; color: #e6e9f2;
      white-space: nowrap;
    }
    #${T} .nts-char-gauge {
      display: block;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }
    #${T} .nts-char-gauge-fill {
      display: block;
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `,document.head.appendChild(a)}console.log("[newtrospect] content script loaded",location.href);let $=null,Be=location.href,ce=null;async function me(a=!1){console.log("[newtrospect] run() called",{introspectMode:a,url:location.href}),$==null||$.abort(),$=new AbortController;const l=$,e=await je();if(console.log("[newtrospect] settings",e),!a&&!e.autoDetect){console.log("[newtrospect] autoDetect off — skipping (use toolbar)");return}const{text:t,host:i,selectorUsed:r,source:n}=st(document,location.href);if(console.log("[newtrospect] extracted",{host:i,selectorUsed:r,source:n,textLen:t.length}),t.length<G){console.log("[newtrospect] text too short, skipping"),a&&I({phase:"skip",done:0,total:0});return}dt();const s=new nt({baseUrl:e.apiBaseUrl,signal:l.signal,fetch:Nt}),o=Object.keys(e.enabled).filter(_=>e.enabled[_]);if(o.length===0){a&&I({phase:"skip",done:0,total:0,message:"표시할 분석이 없음"});return}a&&I({phase:"running",done:0,total:o.length,message:"기사 판정 중..."});const h=await s.detectArticle(t,location.href).catch(()=>null);if(l.signal.aborted)return;if(!(h!=null&&h.isArticle)){a&&I({phase:"skip",done:0,total:o.length});return}const d=Pt();if(!d){a&&I({phase:"error",done:0,total:o.length,message:"본문 요소 찾을 수 없음"});return}pt(d,{rewriteSensational:async(_,C)=>(await s.rewriteSensational(_,C)).rewritten});const c=h.cleanedText,u=o.length+3;I({phase:"running",done:0,total:u});let g=0,f=0;const b=_=>{_&&f++,g++,l.signal.aborted||I({phase:"running",done:g,total:u})},k=o.map(async _=>{try{const C=await s.analyze(_,c);if(l.signal.aborted)return;const N=Dt(C.spans,c,d);ht(d,N),b(!1)}catch{b(!0)}}),R=s.briefing(c).then(_=>{l.signal.aborted||(xt(d,_),b(!1))}).catch(()=>b(!0)),w=s.oneline(c).then(_=>{l.signal.aborted||(Tt(d,_),b(!1))}).catch(()=>b(!0)),x=s.character(c).then(_=>{l.signal.aborted||(Lt(_),b(!1))}).catch(()=>b(!0));await Promise.allSettled([...k,R,w,x]),!l.signal.aborted&&(f===u?I({phase:"error",done:g,total:u,message:"서버 응답 실패 — 옵션 확인"}):f>0?I({phase:"ok",done:g-f,total:u,message:`완료(부분 실패 ${f})`}):I({phase:"ok",done:g,total:u}))}function Dt(a,l,e){const t=e.textContent??"",i=Array.from(l),r=[];for(const n of a){const s=i.slice(n.start,n.end).join("");if(!s)continue;let o=t.indexOf(s),h=s.length;if(o<0){const u=s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/\s+/g,"\\s+"),g=new RegExp(u),f=t.match(g);if(!f||f.index===void 0)continue;o=f.index,h=f[0].length}const d=Array.from(t.slice(0,o)).length,c=d+Array.from(t.slice(o,o+h)).length;r.push({...n,start:d,end:c})}return r}function Pt(){const a=location.hostname;for(const l of He(a)){const e=document.querySelector(l);if(e&&(e.textContent??"").length>=G)return e}return null}function $t(){const a=history.pushState;history.pushState=function(...e){a.apply(this,e),he()};const l=history.replaceState;history.replaceState=function(...e){l.apply(this,e),he()},window.addEventListener("popstate",he)}function he(){location.href!==Be&&(Be=location.href,$==null||$.abort(),fe(),M(),At(),kt(),ce&&clearTimeout(ce),ce=setTimeout(()=>{me().catch(()=>{})},250))}chrome.runtime.onMessage.addListener(a=>{(a==null?void 0:a.type)==="introspect"&&me(!0).catch(()=>{})});$t();me().catch(()=>{});
