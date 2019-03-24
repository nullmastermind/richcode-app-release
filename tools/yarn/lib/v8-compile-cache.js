"use strict";const Module=require("module"),crypto=require("crypto"),fs=require("fs"),path=require("path"),vm=require("vm"),os=require("os"),hasOwnProperty=Object.prototype.hasOwnProperty;class FileSystemBlobStore{constructor(e,t){const s=t?slashEscape(t+"."):"";this._blobFilename=path.join(e,s+"BLOB"),this._mapFilename=path.join(e,s+"MAP"),this._lockFilename=path.join(e,s+"LOCK"),this._directory=e,this._load()}has(e,t){return hasOwnProperty.call(this._memoryBlobs,e)?this._invalidationKeys[e]===t:!!hasOwnProperty.call(this._storedMap,e)&&this._storedMap[e][0]===t}get(e,t){if(hasOwnProperty.call(this._memoryBlobs,e)){if(this._invalidationKeys[e]===t)return this._memoryBlobs[e]}else if(hasOwnProperty.call(this._storedMap,e)){const s=this._storedMap[e];if(s[0]===t)return this._storedBlob.slice(s[1],s[2])}}set(e,t,s){this._invalidationKeys[e]=t,this._memoryBlobs[e]=s,this._dirty=!0}delete(e){hasOwnProperty.call(this._memoryBlobs,e)&&(this._dirty=!0,delete this._memoryBlobs[e]),hasOwnProperty.call(this._invalidationKeys,e)&&(this._dirty=!0,delete this._invalidationKeys[e]),hasOwnProperty.call(this._storedMap,e)&&(this._dirty=!0,delete this._storedMap[e])}isDirty(){return this._dirty}save(){const e=this._getDump(),t=Buffer.concat(e[0]),s=JSON.stringify(e[1]);try{mkdirpSync(this._directory),fs.writeFileSync(this._lockFilename,"LOCK",{flag:"wx"})}catch(e){return!1}try{fs.writeFileSync(this._blobFilename,t),fs.writeFileSync(this._mapFilename,s)}catch(e){throw e}finally{fs.unlinkSync(this._lockFilename)}return!0}_load(){try{this._storedBlob=fs.readFileSync(this._blobFilename),this._storedMap=JSON.parse(fs.readFileSync(this._mapFilename))}catch(e){this._storedBlob=Buffer.alloc(0),this._storedMap={}}this._dirty=!1,this._memoryBlobs={},this._invalidationKeys={}}_getDump(){const e=[],t={};let s=0;function r(r,i,o){e.push(o),t[r]=[i,s,s+o.length],s+=o.length}for(const e of Object.keys(this._memoryBlobs)){const t=this._memoryBlobs[e];r(e,this._invalidationKeys[e],t)}for(const e of Object.keys(this._storedMap)){if(hasOwnProperty.call(t,e))continue;const s=this._storedMap[e],i=this._storedBlob.slice(s[1],s[2]);r(e,s[0],i)}return[e,t]}}class NativeCompileCache{constructor(){this._cacheStore=null,this._previousModuleCompile=null}setCacheStore(e){this._cacheStore=e}install(){const e=this;this._previousModuleCompile=Module.prototype._compile,Module.prototype._compile=function(t,s){const r=this;function i(e){return r.require(e)}i.resolve=function(e){return Module._resolveFilename(e,r)},i.main=process.mainModule,i.extensions=Module._extensions,i.cache=Module._cache;const o=path.dirname(s),a=e._moduleCompile(s,t),c=[r.exports,i,r,s,o,process,global];return a.apply(r.exports,c)}}uninstall(){Module.prototype._compile=this._previousModuleCompile}_moduleCompile(e,t){var s=t.length;if(s>=2&&35===t.charCodeAt(0)&&33/*!*/===t.charCodeAt(1))if(2===s)t="";else{for(var r=2;r<s;++r){var i=t.charCodeAt(r);if(10===i||13===i)break}t=r===s?"":t.slice(r)}var o=Module.wrap(t),a=crypto.createHash("sha1").update(t,"utf8").digest("hex"),c=this._cacheStore.get(e,a),n=new vm.Script(o,{filename:e,lineOffset:0,displayErrors:!0,cachedData:c,produceCachedData:!0});return n.cachedDataProduced?this._cacheStore.set(e,a,n.cachedData):n.cachedDataRejected&&this._cacheStore.delete(e),n.runInThisContext({filename:e,lineOffset:0,columnOffset:0,displayErrors:!0})}}function mkdirpSync(e){_mkdirpSync(path.resolve(e),parseInt("0777",8)&~process.umask())}function _mkdirpSync(e,t){try{fs.mkdirSync(e,t)}catch(t){if("ENOENT"===t.code)_mkdirpSync(path.dirname(e)),_mkdirpSync(e);else try{if(!fs.statSync(e).isDirectory())throw t}catch(e){throw t}}}function slashEscape(e){const t={"\\":"zB",":":"zC","/":"zS","\0":"z0",z:"zZ"};return e.replace(/[\\:\/\x00z]/g,e=>t[e])}function supportsCachedData(){return!0===new vm.Script('""',{produceCachedData:!0}).cachedDataProduced}function getCacheDir(){const e="function"==typeof process.getuid?"v8-compile-cache-"+process.getuid():"v8-compile-cache",t="string"==typeof process.versions.v8?process.versions.v8:"string"==typeof process.versions.chakracore?"chakracore-"+process.versions.chakracore:"node-"+process.version;return path.join(os.tmpdir(),e,t)}function getParentName(){return module.parent&&"string"==typeof module.parent.filename?module.parent.filename:process.cwd()}if(!process.env.DISABLE_V8_COMPILE_CACHE&&supportsCachedData()){const e=new FileSystemBlobStore(getCacheDir(),getParentName()),t=new NativeCompileCache;t.setCacheStore(e),t.install(),process.once("exit",s=>{e.isDirty()&&e.save(),t.uninstall()})}module.exports.__TEST__={FileSystemBlobStore:FileSystemBlobStore,NativeCompileCache:NativeCompileCache,mkdirpSync:mkdirpSync,slashEscape:slashEscape,supportsCachedData:supportsCachedData,getCacheDir:getCacheDir,getParentName:getParentName};
