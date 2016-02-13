/**
 * Author: EPK Technologies s.r.o. (http://www.epk-technologies.com)
 * Copyright 2015 EPK Technologies s.r.o. (http://www.epk-technologies.com)
 */

#extension GL_OES_standard_derivatives : enable

#define LINE_WIDTH 2.25

precision mediump float;

uniform mat4 worldView;

uniform vec4 baseColor;
uniform vec4 wireColor;

varying vec3 vColor;

float edgeFactorTri()
{
    vec3 d = fwidth(vColor.xyz);
    vec3 a3 = smoothstep(vec3(0.0), d * LINE_WIDTH, vColor.xyz);
    return min(min(a3.x, a3.y), a3.z);
}

void main()
{
    gl_FragColor = mix(wireColor, baseColor, edgeFactorTri());
}