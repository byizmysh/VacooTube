'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const platform=require('../server/streaming/lib/platform.cjs'),os=require('node:os'),root=platform.root,wait=ms=>new Promise(r=>setTimeout(r,ms));
for(const [folder,lib]of [['VacooTube', 'server/streaming/lib']]){
 test(folder+' survives RPC latency longer than the old PCM block without an unbounded backlog',async t=>{
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'audio-jitter-'));t.after(()=>fs.rm(directory,{recursive:true,force:true}));
  const source=new(platform.require('core/services/pcm-queue.cjs').PcmQueue)(),symbols=platform.require('core/console/abi/audio-symbols.json'),sdk=0x10000000,base=0x20000000,regions=new Map(),descriptors=new Map(),owned=new Map(),gaps=[];let started=false,lastEnd=0,maxOwned=0;
  const put=(at,b)=>regions.set(at,Buffer.from(b)),read=(at,n)=>{for(const [a,b]of [...regions].reverse())if(at>=a&&at+n<=a+b.length)return Buffer.from(b.subarray(at-a,at-a+n));return Buffer.alloc(n);};
  async function call(address,args){const name=symbols.find(s=>sdk+s.offset===address)?.name||'';
   if(name.includes('GetActiveAudioOutputDeviceName')){put(args[0],Buffer.concat([Buffer.from('AudioTvOutput\0'),Buffer.alloc(256)]));return 0n;}
   if(name.includes('InitializeAudioOutParameter'))put(args[0],Buffer.alloc(8));
   if(name.includes('ListAudioOuts')){put(args[0],Buffer.concat([Buffer.from('MainAudioOut\0'),Buffer.alloc(256)]));return 1n;}
   if(name.includes('OpenDefaultAudioOut')||name.includes('OpenAudioOutEP'))assert.equal(read(args.at(-1),8).readUInt16LE(4),2);
   if(name.includes('GetAudioOutChannelCount'))return 2n;if(name.includes('GetAudioOutSampleRate'))return 48000n;if(name.includes('GetAudioOutSampleFormat'))return 2n;
   if(name.includes('SetAudioOutBufferInfo')){assert(!owned.has(args[0]));descriptors.set(args[0],{at:args[1],bytes:args[3],ms:args[3]/192});}
   if(name.includes('AppendAudioOutBuffer')){const d=args[1];assert(!owned.has(d));if(started){if(lastEnd<Date.now())gaps.push(Date.now());lastEnd=Math.max(Date.now(),lastEnd)+descriptors.get(d).ms;}owned.set(d,started?lastEnd:Infinity);maxOwned=Math.max(maxOwned,owned.size);return 1n;}
   if(name.includes('GetReleasedAudioOutBuffer')){await wait(35);for(const [d,end]of owned)if(end<=Date.now()){owned.delete(d);return BigInt(d);}return 0n;}
   if(name.includes('StartAudioOut')){started=true;lastEnd=Date.now();for(const d of owned.keys()){lastEnd+=descriptors.get(d).ms;owned.set(d,lastEnd);}}
   if(name.includes('StopAudioOut'))started=false;
   if(name.includes('FlushAudioOutBuffers'))for(const d of owned.keys())owned.set(d,0);
   return 0n;
  }
  const rpc={a:{session:'jitter-model',sdk,scratch:0x10000},request:async()=>({}),read:async(at,n)=>read(at,n),write:async(at,b)=>put(at,b),async call(fn,args){const b=Buffer.alloc(8);b.writeBigUInt64LE(BigInt(base));put(args[0],b);return {result:0n};},callAddress:async(at,args)=>({result:await call(at,args)}),async writeCall(at,bytes,fn,args){await wait(65);for(const [d,info]of descriptors)if(info.at===at){assert(!owned.has(d),'device-owned PCM must not be overwritten');assert.equal(bytes.length,info.bytes);}assert(bytes.length<=32768);put(at,bytes);return {result:await call(fn,args)};}};
  const audio=await require('../'+lib+'/stream-audio.cjs').create({rpc,directory,source,reference:{bytes:()=>Buffer.alloc(32)}});
  const producer=setInterval(()=>source.push(Buffer.alloc(1920,1)),10);t.after(()=>clearInterval(producer));
  await wait(3400);const stabilizedAfter=Date.now()-1200;clearInterval(producer);await audio.close();
  assert(!audio.report.error,audio.report.error);assert(!audio.report.cleanupError,audio.report.cleanupError);
  assert(audio.report.bufferAdjustments>0,'must adapt to measured round-trip latency');assert(audio.report.chunkMs>=128);assert(audio.report.targetQueueMs<=320);assert(source.length<=38400);assert.equal(source.maxBytes,38400);assert(maxOwned<=2);assert.equal(owned.size,0);assert(!started);
  assert(gaps.every(at=>at<stabilizedAfter),'audio must stay continuous after settling');assert(audio.report.submitted>=18);assert(audio.report.deadlineMisses>0,'late appends must be reported even with an unreclaimed descriptor');
 });
 test(folder+' uses frame ACK input without redundant RPC polling between ordinary video frames',async()=>{
  let reads=0,inputs=0;const packet=Buffer.alloc(396),sampler=require('../'+lib+'/youtube-input-sampler.cjs').start({rpc:{readMany:async()=>{reads++;return [Buffer.alloc(56),Buffer.alloc(320),Buffer.alloc(4),Buffer.alloc(8)];}},mapped:0x10000000,header:0x7f0000,onInput:()=>inputs++});
  for(let i=0;i<8;i++){sampler.noteAck(packet);await wait(25);}assert.equal(reads,1,'only the startup read is needed while ACKs carry input');assert(inputs>=8);
  await wait(130);assert(reads>1,'input fallback must remain available when video ACKs stop');sampler.close();await sampler.done;
 });
}
