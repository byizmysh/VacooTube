#version 450
#extension GL_GOOGLE_include_directive : require
layout(location=0) out vec4 outColor;
#define STATE_ACCESS readonly
#define HB_READONLY
#include "abi.glsl"
#include "hb.glsl"
#include "common.glsl"
#include "menu-draw.glsl"
#include "pc-screen.glsl"
#include "pc-screen-draw.glsl"
#include "vacootube-menu.glsl"
void main(){outColor=vec4(vacooMenuDraw(gl_FragCoord.xy),1);}
