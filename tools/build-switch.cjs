'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),{execFileSync}=require('node:child_process'),{deflateSync}=require('node:zlib');
async function build(platform=process.env.IZ2S_ROOT){
 if(!platform)throw Error('Specify the IZ2S Platform directory or set IZ2S_ROOT');
 platform=path.resolve(platform);const root=path.resolve(__dirname,'..'),folder=path.join(root,'switch');
 // The font and renderer are module-owned. Updating a shell cannot change
 // their metrics, glyph locations, menus or private video allocation.
 execFileSync('python3',[path.join(__dirname,'font.py'),path.join(folder,'assets/font.bin')],{stdio:'inherit'});
 const state=Buffer.alloc(1024);state.writeFloatLE(4,968);state.writeFloatLE(1,972);await fs.writeFile(path.join(folder,'assets/state.bin'),state);await fs.writeFile(path.join(folder,'assets/video.bin'),Buffer.alloc(4));
 const descriptor=JSON.parse(await fs.readFile(path.join(root,'module.json'))),m={format:'hblauncher.gpu-app',abi:1,id:descriptor.id,name:descriptor.name,version:descriptor.version,description:'Independent video player for Switch 2 · touch and controller input',icon:'icon.png',initialState:'assets/state.bin',data:'assets/font.bin',transition:'none',hostRuntime:'module:vacootube/standalone',shaders:{vertex:'app.vert.spv',fragment:'app.frag.spv',compute:'app.comp.spv'},memory:{bytes:2097152,initial:'assets/video.bin'}};
 await fs.writeFile(path.join(folder,'app.json'),JSON.stringify(m,null,2)+'\n');await require(path.join(platform,'sdk/build.cjs')).buildApp(folder);
 m.shaderEncoding='deflate';for(const [key,stage]of [['vertex','vert'],['fragment','frag'],['compute','comp']]){const name='app.'+stage+'.spv';await fs.writeFile(path.join(folder,name+'.deflate'),deflateSync(await fs.readFile(path.join(folder,name)),{level:9}));m.shaders[key]=name+'.deflate';}
 await fs.writeFile(path.join(folder,'app.json'),JSON.stringify(m,null,2)+'\n');
 const files=[];async function walk(dir,prefix){for(const e of(await fs.readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){if(e.isDirectory())await walk(path.join(dir,e.name),prefix+e.name+'/');else files.push(prefix+e.name);}}await walk(folder,'switch/');descriptor.switch.files=files;await fs.writeFile(path.join(root,'module.json'),JSON.stringify(descriptor,null,2)+'\n');
}
if(require.main===module)build(process.argv[2]).catch(e=>{console.error(e);process.exitCode=1;});module.exports={build};
